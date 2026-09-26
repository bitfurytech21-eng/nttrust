import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Response } from 'express';
import {
  INITIAL_CLIENT_PROFILE,
  INITIAL_ADMIN_PROFILE,
  MOCK_CUSTOMERS_LIST,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFERS,
  INITIAL_BENEFICIARIES,
  INITIAL_BILL_PAYMENTS,
  INITIAL_CARDS,
  INITIAL_DOCUMENTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ACTIVE_SESSIONS
} from '../src/services/mockData.js';
import type {
  BankAccount,
  Transaction,
  TransferRequest,
  Beneficiary,
  BillPayment,
  BankCard,
  BankDocument,
  SecureMessage,
  NotificationItem,
  SecurityAuditLog,
  UserProfile,
  MessageThreadItem,
  RoleDefinition
} from '../src/types/banking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'banking_database.json');

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'admin',
    name: 'Super Admin / Operations Lead',
    description: 'Full supervisory authority across all accounts, ledgers, and compliance desks.',
    isSystem: true,
    defaultPermissions: ['full_access']
  },
  {
    id: 'compliance_officer',
    name: 'Compliance & AML Officer',
    description: 'Manages KYC verification, customer identity audits, and regulatory SIEM logs.',
    isSystem: true,
    defaultPermissions: [
      'view:dashboard',
      'view:accounts',
      'view:transactions',
      'view:transfers',
      'view:documents',
      'view:audit_logs',
      'view:customers',
      'edit:customers',
      'manage:kyc',
      'manage:users',
      'manage:roles'
    ]
  },
  {
    id: 'auditor',
    name: 'Independent Regulatory Auditor',
    description: 'Strict read-only oversight across all client portfolios, records, and SIEM logs.',
    isSystem: true,
    defaultPermissions: [
      'view:dashboard',
      'view:accounts',
      'view:transactions',
      'view:transfers',
      'view:cards',
      'view:documents',
      'view:audit_logs',
      'view:customers'
    ]
  },
  {
    id: 'treasury_manager',
    name: 'Institutional Treasury Manager',
    description: 'Oversees liquidity reserves, wires, ledger adjustments, and depository vaults.',
    isSystem: true,
    defaultPermissions: [
      'view:dashboard',
      'view:accounts',
      'view:transactions',
      'view:transfers',
      'create:transfers',
      'create:accounts',
      'edit:accounts',
      'manage:ledger',
      'view:audit_logs'
    ]
  },
  {
    id: 'client',
    name: 'Private Wealth Client',
    description: 'Full individual client capabilities: accounts, transfers, cards, statements.',
    isSystem: true,
    defaultPermissions: [
      'view:dashboard',
      'view:accounts',
      'view:transactions',
      'view:transfers',
      'view:cards',
      'view:documents',
      'view:messages',
      'view:notifications',
      'view:profile',
      'create:transfers',
      'create:transactions',
      'create:messages',
      'create:beneficiaries',
      'create:cards',
      'edit:profile',
      'edit:accounts',
      'edit:cards',
      'edit:security',
      'delete:beneficiaries',
      'delete:notifications',
      'delete:records'
    ]
  },
  {
    id: 'restricted_client',
    name: 'Restricted Read-Only Client',
    description: 'View-only access for family beneficiaries or trustees; cannot initiate transfers or edit settings.',
    isSystem: true,
    defaultPermissions: [
      'view:dashboard',
      'view:accounts',
      'view:transactions',
      'view:documents',
      'view:profile'
    ]
  }
];

export interface BankingDatabaseSchema {
  accounts: BankAccount[];
  transactions: Transaction[];
  transfers: TransferRequest[];
  beneficiaries: Beneficiary[];
  bills: BillPayment[];
  cards: BankCard[];
  documents: BankDocument[];
  messages: SecureMessage[];
  notifications: NotificationItem[];
  securityLogs: SecurityAuditLog[];
  customers: UserProfile[];
  roles: RoleDefinition[];
  processedCreditReferences?: string[];
  lastUpdated: string;
}

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Database Cache
let dbState: BankingDatabaseSchema;

function loadDatabase(): BankingDatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.accounts)) {
        if (!parsed.roles || parsed.roles.length === 0) {
          parsed.roles = INITIAL_ROLES;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('[Database] Failed to read database file, initializing fresh store:', err);
  }

  // Seed default data
  const initialData: BankingDatabaseSchema = {
    accounts: INITIAL_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    transfers: INITIAL_TRANSFERS,
    beneficiaries: INITIAL_BENEFICIARIES,
    bills: INITIAL_BILL_PAYMENTS,
    cards: INITIAL_CARDS,
    documents: INITIAL_DOCUMENTS,
    messages: INITIAL_MESSAGES,
    notifications: INITIAL_NOTIFICATIONS,
    securityLogs: INITIAL_AUDIT_LOGS,
    customers: MOCK_CUSTOMERS_LIST,
    roles: INITIAL_ROLES,
    lastUpdated: new Date().toISOString()
  };

  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(state: BankingDatabaseSchema) {
  try {
    state.lastUpdated = new Date().toISOString();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[Database] Atomic write error:', err);
  }
}

// Initialize state
dbState = loadDatabase();

// ============================================================================
// Real-Time SSE Broadcaster
// ============================================================================
const sseClients = new Map<string, Response>();

export function registerSSEClient(id: string, res: Response) {
  sseClients.set(id, res);
}

export function unregisterSSEClient(id: string) {
  sseClients.delete(id);
}

export function broadcastEvent(eventType: string, payload: any) {
  const eventMessage = `data: ${JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  })}\n\n`;

  for (const [id, clientRes] of sseClients.entries()) {
    try {
      clientRes.write(eventMessage);
    } catch {
      sseClients.delete(id);
    }
  }
}

// ============================================================================
// Database Mutation Engine
// ============================================================================
export const BankingDB = {
  getState(): BankingDatabaseSchema {
    return dbState;
  },

  resetToDefault(): BankingDatabaseSchema {
    dbState = {
      accounts: INITIAL_ACCOUNTS,
      transactions: INITIAL_TRANSACTIONS,
      transfers: INITIAL_TRANSFERS,
      beneficiaries: INITIAL_BENEFICIARIES,
      bills: INITIAL_BILL_PAYMENTS,
      cards: INITIAL_CARDS,
      documents: INITIAL_DOCUMENTS,
      messages: INITIAL_MESSAGES,
      notifications: INITIAL_NOTIFICATIONS,
      securityLogs: INITIAL_AUDIT_LOGS,
      customers: MOCK_CUSTOMERS_LIST,
      roles: INITIAL_ROLES,
      lastUpdated: new Date().toISOString()
    };
    saveDatabase(dbState);
    broadcastEvent('STATE_RESET', dbState);
    return dbState;
  },

  getRoles(): RoleDefinition[] {
    if (!dbState.roles || dbState.roles.length === 0) {
      dbState.roles = [...INITIAL_ROLES];
    }
    return dbState.roles;
  },

  createRole(roleData: Omit<RoleDefinition, 'isSystem'> & { isSystem?: boolean }): RoleDefinition {
    const existing = dbState.roles.find(r => r.id === roleData.id);
    if (existing) {
      throw new Error(`Role with identifier '${roleData.id}' already exists.`);
    }

    const newRole: RoleDefinition = {
      id: roleData.id.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      name: roleData.name,
      description: roleData.description,
      isSystem: false,
      defaultPermissions: roleData.defaultPermissions || []
    };

    dbState.roles = [...dbState.roles, newRole];
    saveDatabase(dbState);
    broadcastEvent('ROLES_UPDATED', { roles: dbState.roles });
    return newRole;
  },

  updateRole(id: string, updates: Partial<RoleDefinition>): RoleDefinition | null {
    const idx = dbState.roles.findIndex(r => r.id === id);
    if (idx === -1) return null;

    dbState.roles[idx] = {
      ...dbState.roles[idx],
      name: updates.name || dbState.roles[idx].name,
      description: updates.description || dbState.roles[idx].description,
      defaultPermissions: updates.defaultPermissions || dbState.roles[idx].defaultPermissions
    };

    saveDatabase(dbState);
    broadcastEvent('ROLES_UPDATED', { roles: dbState.roles });
    return dbState.roles[idx];
  },

  deleteRole(id: string): boolean {
    const role = dbState.roles.find(r => r.id === id);
    if (!role || role.isSystem) {
      return false;
    }

    dbState.roles = dbState.roles.filter(r => r.id !== id);
    saveDatabase(dbState);
    broadcastEvent('ROLES_UPDATED', { roles: dbState.roles });
    return true;
  },

  deleteBeneficiary(id: string): boolean {
    const before = dbState.beneficiaries.length;
    dbState.beneficiaries = dbState.beneficiaries.filter(b => b.id !== id);
    if (dbState.beneficiaries.length !== before) {
      saveDatabase(dbState);
      broadcastEvent('BENEFICIARY_DELETED', { id, beneficiaries: dbState.beneficiaries });
      return true;
    }
    return false;
  },

  deleteNotification(id: string): boolean {
    const before = dbState.notifications.length;
    dbState.notifications = dbState.notifications.filter(n => n.id !== id);
    if (dbState.notifications.length !== before) {
      saveDatabase(dbState);
      broadcastEvent('NOTIFICATION_DELETED', { id, notifications: dbState.notifications });
      return true;
    }
    return false;
  },

  deleteCustomer(id: string): boolean {
    const before = dbState.customers.length;
    dbState.customers = dbState.customers.filter(c => c.id !== id && c.clientId !== id);
    if (dbState.customers.length !== before) {
      saveDatabase(dbState);
      broadcastEvent('CUSTOMER_DELETED', { id, customers: dbState.customers });
      return true;
    }
    return false;
  },

  createTransfer(transferData: Omit<TransferRequest, 'id' | 'createdAt' | 'status' | 'referenceId'>): TransferRequest {
    const isHighValue = transferData.amount >= 100000;
    const newTransfer: TransferRequest = {
      ...transferData,
      id: `trf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      referenceId: `NT-FEDWIRE-${Date.now().toString().slice(-8)}-FED`,
      createdAt: new Date().toISOString(),
      status: isHighValue ? 'pending_review' : 'completed',
      riskScore: isHighValue ? 'MEDIUM' : 'LOW',
      adminNotes: isHighValue ? 'Flagged for High-Value Operations Secondary Sign-Off' : undefined
    };

    // Debit source account immediately for movement of balance
    const totalDebit = newTransfer.amount + (newTransfer.fee || 0);
    dbState.accounts = dbState.accounts.map(acc => {
      if (acc.id === newTransfer.fromAccountId || acc.accountNumber === newTransfer.fromAccountId) {
        return {
          ...acc,
          balance: Math.max(0, acc.balance - totalDebit),
          availableBalance: Math.max(0, acc.availableBalance - totalDebit)
        };
      }
      return acc;
    });

    // Record transaction
    const sourceAccount = dbState.accounts.find(a => a.id === newTransfer.fromAccountId || a.accountNumber === newTransfer.fromAccountId);
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      accountId: sourceAccount?.id || newTransfer.fromAccountId,
      accountName: sourceAccount?.name || 'Angelina Jolie Private Wealth Reserve Checking',
      amount: -newTransfer.amount,
      type: 'transfer_out',
      category: 'Transfers',
      counterparty: newTransfer.beneficiaryName,
      description: newTransfer.purpose || `Outbound Wire to ${newTransfer.beneficiaryName}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: newTransfer.status === 'completed' ? 'completed' : 'pending',
      referenceNumber: newTransfer.referenceId,
      currency: newTransfer.sourceCurrency || 'USD'
    };

    dbState.transactions = [newTx, ...dbState.transactions];

    dbState.transfers = [newTransfer, ...dbState.transfers];
    saveDatabase(dbState);
    broadcastEvent('TRANSFER_CREATED', { transfer: newTransfer, accounts: dbState.accounts });
    return newTransfer;
  },

  approveTransfer(id: string, adminNotes?: string): TransferRequest | null {
    const transfer = dbState.transfers.find(t => t.id === id);
    if (!transfer || transfer.status !== 'pending_review') return null;

    transfer.status = 'completed';
    transfer.adminNotes = adminNotes || 'Approved by Bank Operations Compliance Officer';

    // Debit account
    const totalDebit = transfer.amount + (transfer.fee || 0);
    dbState.accounts = dbState.accounts.map(acc => {
      if (acc.id === transfer.fromAccountId) {
        return {
          ...acc,
          balance: acc.balance - totalDebit,
          availableBalance: acc.availableBalance - totalDebit
        };
      }
      return acc;
    });

    // Record ledger transaction
    const sourceAccount = dbState.accounts.find(a => a.id === transfer.fromAccountId);
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      accountId: transfer.fromAccountId,
      accountName: sourceAccount?.name || 'Private Wealth Checking',
      amount: -transfer.amount,
      type: 'transfer_out',
      category: 'Transfers',
      counterparty: transfer.beneficiaryName,
      description: `Fedwire Approved: ${transfer.purpose || transfer.beneficiaryName}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: 'completed',
      referenceNumber: transfer.referenceId,
      currency: transfer.sourceCurrency || 'USD'
    };

    dbState.transactions = [newTx, ...dbState.transactions];
    saveDatabase(dbState);
    broadcastEvent('TRANSFER_APPROVED', { transfer, accounts: dbState.accounts, transaction: newTx });
    return transfer;
  },

  rejectTransfer(id: string, reason: string): TransferRequest | null {
    const transfer = dbState.transfers.find(t => t.id === id);
    if (!transfer) return null;

    transfer.status = 'rejected';
    transfer.adminNotes = reason || 'Declined by AML / Sanctions Operations Policy';

    saveDatabase(dbState);
    broadcastEvent('TRANSFER_REJECTED', { transfer });
    return transfer;
  },

  adjustAccountBalance(accountId: string, amount: number, note: string): BankAccount | null {
    const acc = dbState.accounts.find(a => a.id === accountId);
    if (!acc) return null;

    acc.balance += amount;
    acc.availableBalance += amount;

    // Record adjustment audit transaction
    const newTx: Transaction = {
      id: `tx_adj_${Date.now()}`,
      accountId,
      accountName: acc.name,
      amount,
      type: amount >= 0 ? 'deposit' : 'withdrawal',
      category: 'Investments',
      counterparty: 'Northern Trust Custodial Ledger',
      description: note || 'Administrative Balance Adjustment',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: 'completed',
      referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
      currency: acc.currency
    };

    dbState.transactions = [newTx, ...dbState.transactions];
    saveDatabase(dbState);
    broadcastEvent('BALANCE_ADJUSTED', { account: acc, transaction: newTx });
    return acc;
  },

  creditAccount(params: {
    accountId: string;
    userId?: string;
    amount: number;
    currency?: string;
    fundingMethod: 'check' | 'wire' | 'ach' | 'direct_credit' | 'card' | 'vault';
    externalReference?: string;
    checkNumber?: string;
    sourceInstitution?: string;
    description?: string;
    memo?: string;
    holdPolicy?: 'instant' | 'standard_hold';
  }): { account: BankAccount; transaction: Transaction; referenceNumber: string } {
    const {
      accountId,
      userId,
      amount,
      currency = 'USD',
      fundingMethod = 'direct_credit',
      externalReference,
      checkNumber,
      sourceInstitution,
      description,
      memo,
      holdPolicy = 'instant'
    } = params;

    // 1. Account Identification & Validation
    const acc = dbState.accounts.find(a => a.id === accountId);
    if (!acc) {
      this.logSecurityEvent('UNAUTHORIZED_CREDIT_ATTEMPT', 'ledger', 'BLOCKED', `Credit rejected: Destination account '${accountId}' not found in registry.`, 50);
      throw new Error('Destination account not found.');
    }

    if (acc.isFrozen || acc.status === 'frozen') {
      this.logSecurityEvent('UNAUTHORIZED_CREDIT_ATTEMPT', 'ledger', 'BLOCKED', `Credit rejected: Destination account '${acc.name}' (${acc.accountNumber}) is frozen.`, 40);
      throw new Error(`Destination account '${acc.name}' is currently frozen and cannot receive credits.`);
    }

    if (acc.status === 'restricted') {
      this.logSecurityEvent('UNAUTHORIZED_CREDIT_ATTEMPT', 'ledger', 'BLOCKED', `Credit rejected: Destination account '${acc.name}' is restricted.`, 30);
      throw new Error(`Destination account '${acc.name}' is restricted by bank compliance.`);
    }

    // 2. Amount Validation
    const numAmount = Number(amount);
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      this.logSecurityEvent('UNAUTHORIZED_CREDIT_ATTEMPT', 'ledger', 'BLOCKED', `Credit rejected: Invalid credit amount '${amount}'.`, 35);
      throw new Error('Credit amount must be a valid positive number greater than $0.00.');
    }

    // Maximum Single Credit Limit ($10,000,000)
    const MAX_CREDIT_LIMIT = 10000000;
    if (numAmount > MAX_CREDIT_LIMIT) {
      this.logSecurityEvent('UNAUTHORIZED_CREDIT_ATTEMPT', 'ledger', 'BLOCKED', `Credit rejected: Amount $${numAmount.toLocaleString()} exceeds single deposit limit of $${MAX_CREDIT_LIMIT.toLocaleString()}.`, 60);
      throw new Error(`Deposit amount exceeds the maximum single credit limit of $${MAX_CREDIT_LIMIT.toLocaleString()} USD.`);
    }

    // 3. Duplicate-Credit Protection
    dbState.processedCreditReferences = dbState.processedCreditReferences || [];
    
    // Check specific duplicate keys
    const dedupKeys: string[] = [];
    if (externalReference && externalReference.trim()) {
      dedupKeys.push(`ext:${externalReference.trim().toUpperCase()}`);
    }
    if (checkNumber && checkNumber.trim()) {
      dedupKeys.push(`chk:${acc.id}:${checkNumber.trim().toUpperCase()}`);
    }

    for (const key of dedupKeys) {
      if (dbState.processedCreditReferences.includes(key)) {
        this.logSecurityEvent(
          'DUPLICATE_DEPOSIT_DETECTED',
          'ledger',
          'BLOCKED',
          `Duplicate credit rejected: Identifier '${key}' for account '${acc.name}' has already been processed.`,
          70
        );
        throw new Error(`Duplicate funding transaction detected: Reference '${key.replace(/^[a-z]+:/, '')}' has already been processed.`);
      }
    }

    // 4. Generate Unique Transaction Reference
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const prefixMap: Record<string, string> = {
      wire: 'FED',
      check: 'CHK',
      ach: 'ACH',
      vault: 'VLT',
      direct_credit: 'CRD',
      card: 'CRD'
    };
    const prefix = prefixMap[fundingMethod] || 'DEP';
    const uniqueRef = `${prefix}-${dateStr}-${randomSuffix}`;

    // Record deduplication keys and unique reference
    for (const key of dedupKeys) {
      dbState.processedCreditReferences.push(key);
    }
    dbState.processedCreditReferences.push(`ref:${uniqueRef}`);

    // 5. Transaction Lifecycle & Balance Update
    // Log Deposit Initiated
    this.logSecurityEvent(
      'DEPOSIT_INITIATED',
      'ledger',
      'SUCCESS',
      `Deposit initiated: $${numAmount.toLocaleString()} ${currency} via ${fundingMethod.toUpperCase()} to ${acc.name}. Reference: ${uniqueRef}`,
      0
    );

    const isInstant = holdPolicy === 'instant' || fundingMethod === 'wire' || fundingMethod === 'direct_credit' || (fundingMethod === 'check' && numAmount <= 100000);
    const txStatus: 'completed' | 'pending' = isInstant ? 'completed' : 'pending';

    if (isInstant) {
      acc.balance += numAmount;
      acc.availableBalance += numAmount;
    } else {
      acc.balance += numAmount;
      acc.pendingBalance = (acc.pendingBalance || 0) + numAmount;
    }

    // 6. Create Auditable Transaction Record
    const counterpartyName =
      sourceInstitution ||
      (fundingMethod === 'wire'
        ? 'Fedwire Inflow Clearing (ABA 021000089)'
        : fundingMethod === 'check'
        ? `Remote Check Clearing Desk (Check #${checkNumber || 'RDC'})`
        : fundingMethod === 'ach'
        ? 'ACH Direct Network Settlement'
        : 'Northern Trust Custodial Inflow');

    const txDescription =
      description ||
      memo ||
      `Deposit via ${fundingMethod.toUpperCase()} (${uniqueRef})`;

    const newTx: Transaction = {
      id: `tx_crd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      accountId: acc.id,
      accountName: acc.name,
      amount: numAmount,
      currency: acc.currency || currency,
      type: 'deposit',
      category: 'Income',
      counterparty: counterpartyName,
      description: txDescription,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: txStatus,
      referenceNumber: uniqueRef
    };

    dbState.transactions = [newTx, ...dbState.transactions];
    saveDatabase(dbState);

    // 7. Security Audit Trail & Real-time Event
    this.logSecurityEvent(
      'DEPOSIT_VERIFIED',
      'ledger',
      'SUCCESS',
      `Deposit verified and authorized: Ref ${uniqueRef}, Amount: $${numAmount.toLocaleString()} ${currency}, Channel: ${fundingMethod}`,
      0
    );

    this.logSecurityEvent(
      'ACCOUNT_CREDITED',
      'ledger',
      'SUCCESS',
      `Account '${acc.name}' (${acc.accountNumber}) credited $${numAmount.toLocaleString()} ${acc.currency}. New Balance: $${acc.balance.toLocaleString()}. Ref: ${uniqueRef}`,
      0
    );

    broadcastEvent('ACCOUNT_CREDITED', { account: acc, transaction: newTx, referenceNumber: uniqueRef });
    return { account: acc, transaction: newTx, referenceNumber: uniqueRef };
  },

  depositCheck(accountId: string, amount: number, checkNumber: string, memo: string): { account: BankAccount; transaction: Transaction } | null {
    const result = this.creditAccount({
      accountId,
      amount,
      fundingMethod: 'check',
      checkNumber,
      memo: `Check #${checkNumber} - ${memo}`,
      description: `Remote Check Deposit #${checkNumber}`
    });
    return { account: result.account, transaction: result.transaction };
  },

  withdrawFunds(accountId: string, amount: number, method: string = 'wire', destination: string = 'External Account', memo?: string): { account: BankAccount; transaction: Transaction } | null {
    const acc = dbState.accounts.find(a => a.id === accountId);
    if (!acc) return null;
    if (acc.availableBalance < amount || acc.isFrozen) {
      throw new Error('Insufficient available funds or account is frozen');
    }

    acc.balance -= amount;
    acc.availableBalance -= amount;

    const newTx: Transaction = {
      id: `tx_wth_${Date.now()}`,
      accountId,
      accountName: acc.name,
      amount: -amount,
      type: 'withdrawal',
      category: 'Transfers',
      counterparty: destination || 'External Outbound Transfer',
      description: memo || `Outbound ${method.toUpperCase()} Withdrawal to ${destination}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: 'completed',
      referenceNumber: `WTH-${Date.now().toString().slice(-6)}`,
      currency: acc.currency
    };

    dbState.transactions = [newTx, ...dbState.transactions];
    saveDatabase(dbState);
    broadcastEvent('WITHDRAWAL_COMPLETED', { account: acc, transaction: newTx });
    return { account: acc, transaction: newTx };
  },

  toggleCardFreeze(cardId: string): BankCard | null {
    const card = dbState.cards.find(c => c.id === cardId);
    if (!card) return null;

    card.isFrozen = !card.isFrozen;
    saveDatabase(dbState);
    broadcastEvent('CARD_UPDATED', { card });
    return card;
  },

  updateCardLimits(cardId: string, dailySpend: number, dailyAtm: number): BankCard | null {
    const card = dbState.cards.find(c => c.id === cardId);
    if (!card) return null;

    card.dailySpendingLimit = dailySpend;
    card.dailyWithdrawalLimit = dailyAtm;
    saveDatabase(dbState);
    broadcastEvent('CARD_UPDATED', { card });
    return card;
  },

  updateKYC(status: 'verified' | 'pending_review' | 'action_required'): UserProfile[] {
    dbState.customers = dbState.customers.map(c => ({
      ...c,
      kycStatus: status
    }));
    saveDatabase(dbState);
    broadcastEvent('KYC_UPDATED', { kycStatus: status });
    return dbState.customers;
  },

  updateCustomerProfile(customerId: string, updates: Partial<UserProfile>): UserProfile | null {
    const custIndex = dbState.customers.findIndex(c => c.id === customerId);
    if (custIndex === -1) return null;

    dbState.customers[custIndex] = {
      ...dbState.customers[custIndex],
      ...updates
    };

    saveDatabase(dbState);
    broadcastEvent('CUSTOMER_UPDATED', { customer: dbState.customers[custIndex] });
    return dbState.customers[custIndex];
  },

  getCustomer(idOrClientId: string): UserProfile | null {
    return dbState.customers.find(c => c.id === idOrClientId || c.clientId === idOrClientId || c.username === idOrClientId) || null;
  },

  updateUserPermissions(userId: string, role: string, permissions?: string[]): UserProfile | null {
    const custIndex = dbState.customers.findIndex(c => c.id === userId || c.clientId === userId);
    if (custIndex === -1) return null;

    dbState.customers[custIndex] = {
      ...dbState.customers[custIndex],
      role: role as any,
      permissions
    };

    saveDatabase(dbState);
    broadcastEvent('CUSTOMER_UPDATED', { customer: dbState.customers[custIndex] });
    return dbState.customers[custIndex];
  },

  createCustomer(data: { customer: Partial<UserProfile>; account?: Partial<BankAccount> & { initialDeposit?: number } }): { customer: UserProfile; account?: BankAccount; transaction?: Transaction } {
    const custId = data.customer?.id || `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const clientId = data.customer?.clientId || `NT-${randomDigits}`;
    const cleanUsername = data.customer?.username || (data.customer?.fullName ? data.customer.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.') : `client.${randomDigits}`);

    const newCustomer: UserProfile = {
      id: custId,
      clientId,
      username: cleanUsername,
      fullName: data.customer?.fullName || 'New Accredited Client',
      preferredName: data.customer?.preferredName || (data.customer?.fullName ? data.customer.fullName.split(' ')[0] : 'Client'),
      email: data.customer?.email || `${cleanUsername}@northerntrust-client.com`,
      phone: data.customer?.phone || '+1 (212) 555-0199',
      avatarUrl: data.customer?.avatarUrl || undefined,
      role: data.customer?.role || 'client',
      tier: data.customer?.tier || 'Private Wealth',
      occupation: data.customer?.occupation || 'Private Investor & Philanthropist',
      accountOpenedDate: data.customer?.accountOpenedDate || new Date().toISOString().slice(0, 10),
      dateOfBirth: data.customer?.dateOfBirth || '1982-05-14',
      taxIdMasked: data.customer?.taxIdMasked || `***-**-${Math.floor(1000 + Math.random() * 9000)}`,
      address: data.customer?.address || {
        street: '740 Park Avenue, Penthouse B',
        city: 'New York',
        state: 'NY',
        postalCode: '10021',
        country: 'United States'
      },
      kycStatus: data.customer?.kycStatus || 'verified',
      kycTier: data.customer?.kycTier || 'Tier 3 (Institutional/Private)',
      twoFactorEnabled: data.customer?.twoFactorEnabled !== undefined ? data.customer.twoFactorEnabled : true,
      twoFactorMethod: 'sms',
      trustedDevices: [],
      securityQuestionsSet: true,
      accountLocked: false,
      failedLoginAttempts: 0
    };

    dbState.customers = [newCustomer, ...dbState.customers];

    let createdAccount: BankAccount | undefined;
    let initialTx: Transaction | undefined;

    if (data.account) {
      const accNum = data.account.accountNumber || `8820${Math.floor(10000000 + Math.random() * 90000000)}`;
      const accId = data.account.id || `acc_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      const balance = Number(data.account.balance ?? data.account.initialDeposit ?? 100000);
      const currency = data.account.currency || 'USD';

      createdAccount = {
        id: accId,
        accountNumber: accNum,
        routingNumber: data.account.routingNumber || '071000288',
        iban: data.account.iban || `US33NTRS071000288${accNum}`,
        swiftBic: 'NTRSUS44XXX',
        name: data.account.name || `${newCustomer.fullName}'s Private ${data.account.type === 'savings' ? 'Savings' : 'Checking'}`,
        type: data.account.type || 'checking',
        currency,
        balance,
        availableBalance: balance,
        pendingBalance: 0,
        interestRateAPY: data.account.interestRateAPY || (data.account.type === 'savings' ? 4.85 : 1.25),
        monthlyLimit: data.account.monthlyLimit || 5000000,
        monthlySpent: 0,
        isFrozen: false,
        status: data.account.status || 'active',
        colorTheme: data.account.colorTheme || (data.account.type === 'savings' ? 'emerald' : 'navy')
      };

      dbState.accounts = [createdAccount, ...dbState.accounts];

      if (balance > 0) {
        initialTx = {
          id: `tx_init_${Date.now()}`,
          accountId: accId,
          accountName: createdAccount.name,
          amount: balance,
          type: 'deposit',
          category: 'Income',
          counterparty: 'Initial Account Capitalization & Ledger Deposit',
          description: `Account opening deposit for ${newCustomer.fullName}`,
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          status: 'completed',
          referenceNumber: `INIT-${Date.now().toString().slice(-6)}`,
          currency
        };
        dbState.transactions = [initialTx, ...dbState.transactions];
      }
    }

    saveDatabase(dbState);
    broadcastEvent('CUSTOMER_CREATED', {
      customer: newCustomer,
      account: createdAccount,
      transaction: initialTx,
      accounts: dbState.accounts,
      customers: dbState.customers
    });

    return { customer: newCustomer, account: createdAccount, transaction: initialTx };
  },

  createAccount(accountData: Partial<BankAccount> & { initialDeposit?: number }): { account: BankAccount; transaction?: Transaction } {
    const accNum = accountData.accountNumber || `8820${Math.floor(10000000 + Math.random() * 90000000)}`;
    const accId = accountData.id || `acc_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const balance = Number(accountData.balance ?? accountData.initialDeposit ?? 50000);
    const currency = accountData.currency || 'USD';

    const newAccount: BankAccount = {
      id: accId,
      accountNumber: accNum,
      routingNumber: accountData.routingNumber || '071000288',
      iban: accountData.iban || `US33NTRS071000288${accNum}`,
      swiftBic: 'NTRSUS44XXX',
      name: accountData.name || `Private ${accountData.type ? accountData.type.toUpperCase() : 'CHECKING'} Account`,
      type: accountData.type || 'checking',
      currency,
      balance,
      availableBalance: balance,
      pendingBalance: 0,
      interestRateAPY: accountData.interestRateAPY || (accountData.type === 'savings' ? 4.85 : 1.25),
      monthlyLimit: accountData.monthlyLimit || 5000000,
      monthlySpent: 0,
      isFrozen: false,
      status: accountData.status || 'active',
      colorTheme: accountData.colorTheme || (accountData.type === 'savings' ? 'emerald' : 'navy')
    };

    dbState.accounts = [newAccount, ...dbState.accounts];

    let initialTx: Transaction | undefined;
    if (balance > 0) {
      initialTx = {
        id: `tx_init_${Date.now()}`,
        accountId: accId,
        accountName: newAccount.name,
        amount: balance,
        type: 'deposit',
        category: 'Income',
        counterparty: 'Initial Account Capitalization',
        description: `Opening deposit for account #${accNum}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: 'completed',
        referenceNumber: `INIT-${Date.now().toString().slice(-6)}`,
        currency
      };
      dbState.transactions = [initialTx, ...dbState.transactions];
    }

    saveDatabase(dbState);
    broadcastEvent('ACCOUNT_CREATED', {
      account: newAccount,
      transaction: initialTx,
      accounts: dbState.accounts
    });

    return { account: newAccount, transaction: initialTx };
  },

  addMessage(msg: { subject: string; category: any; body: string; priority?: any }): SecureMessage {
    const threadItem: MessageThreadItem = {
      id: `th_${Date.now()}`,
      sender: 'Alexander Vance Wright',
      senderRole: 'client',
      text: msg.body,
      body: msg.body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMsg: SecureMessage = {
      id: `msg_${Date.now()}`,
      subject: msg.subject,
      category: msg.category || 'General',
      senderRole: 'client',
      senderName: 'Alexander Vance Wright',
      timestamp: new Date().toISOString(),
      isRead: false,
      unread: true,
      priority: msg.priority || 'normal',
      preview: msg.body.slice(0, 80),
      thread: [threadItem],
      threads: [threadItem]
    };

    dbState.messages = [newMsg, ...dbState.messages];
    saveDatabase(dbState);
    broadcastEvent('MESSAGE_CREATED', { message: newMsg });
    return newMsg;
  },

  replyMessage(messageId: string, text: string, senderRole: 'admin' | 'client'): SecureMessage | null {
    const msg = dbState.messages.find(m => m.id === messageId);
    if (!msg) return null;

    const newThread: MessageThreadItem = {
      id: `th_${Date.now()}`,
      sender: senderRole === 'admin' ? 'Sarah Jenkins (Operations Lead)' : 'Alexander Vance Wright',
      senderRole,
      text,
      body: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    msg.thread = [...(msg.thread || []), newThread];
    msg.threads = msg.thread;
    msg.preview = text.slice(0, 80);
    saveDatabase(dbState);
    broadcastEvent('MESSAGE_UPDATED', { message: msg });
    return msg;
  },

  payBill(billId: string, amountToPay?: number): BillPayment | null {
    const bill = dbState.bills.find(b => b.id === billId);
    if (!bill) return null;

    const paymentAmount = amountToPay || bill.amount;
    bill.status = 'paid';
    bill.lastPaidDate = new Date().toISOString().slice(0, 10);
    bill.confirmationCode = `ACH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Debit primary checking account
    const primaryAccount = dbState.accounts.find(a => a.type === 'checking') || dbState.accounts[0];
    if (primaryAccount) {
      primaryAccount.balance -= paymentAmount;
      primaryAccount.availableBalance -= paymentAmount;

      const newTx: Transaction = {
        id: `tx_bill_${Date.now()}`,
        accountId: primaryAccount.id,
        accountName: primaryAccount.name,
        amount: -paymentAmount,
        type: 'bill_payment',
        category: 'Utilities',
        counterparty: bill.payeeName,
        description: `Electronic Payment: ${bill.payeeName} (${bill.accountNumber})`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: 'completed',
        referenceNumber: `BIL-${Date.now().toString().slice(-6)}`,
        currency: 'USD'
      };

      dbState.transactions = [newTx, ...dbState.transactions];
    }

    saveDatabase(dbState);
    broadcastEvent('BILL_PAID', { bill, accounts: dbState.accounts });
    return bill;
  },

  logSecurityEvent(action: string, category: any, status: any, details: string, threatScore = 0): SecurityAuditLog {
    const newLog: SecurityAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      event: action,
      category,
      status,
      ipAddress: '198.51.100.44',
      location: 'Los Angeles, CA, US',
      device: 'MacBook Pro 16" M3 Max (Private Studio)',
      threatScore,
      riskScore: threatScore > 50 ? 'HIGH' : threatScore > 20 ? 'MEDIUM' : 'LOW',
      details
    };

    dbState.securityLogs = [newLog, ...dbState.securityLogs].slice(0, 500);
    saveDatabase(dbState);
    broadcastEvent('AUDIT_LOG_CREATED', { log: newLog });
    return newLog;
  }
};
