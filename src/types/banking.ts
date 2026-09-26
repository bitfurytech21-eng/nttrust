export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'full_access';

export type PermissionResource =
  | 'dashboard'
  | 'accounts'
  | 'transactions'
  | 'transfers'
  | 'beneficiaries'
  | 'payments'
  | 'cards'
  | 'documents'
  | 'tax'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'security'
  | 'checks'
  | 'fx'
  | 'lending'
  | 'customers'
  | 'audit_logs'
  | 'roles'
  | 'ledger'
  | 'system';

export interface PermissionDefinition {
  id: string;
  name: string;
  action: PermissionAction;
  resource: PermissionResource;
  category: string;
  description: string;
}

export type UserRole =
  | 'client'
  | 'admin'
  | 'compliance_officer'
  | 'auditor'
  | 'treasury_manager'
  | 'restricted_client'
  | string;

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  defaultPermissions: string[];
}

export type TwoFactorMethod = 'authenticator' | 'sms' | 'recovery_code';

export interface DeviceInfo {
  id: string;
  name: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  isTrusted: boolean;
  fingerprint: string;
}

export interface UserProfile {
  id: string;
  clientId: string;
  username: string;
  fullName: string;
  preferredName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  roleTitle?: string;
  permissions?: string[];
  tier: 'Private Wealth - Sovereign & Celebrity VIP' | 'Private Wealth' | 'Premier Client' | 'Executive Sovereign' | 'Operations Lead' | string;
  occupation?: string;
  accountOpenedDate?: string;
  dateOfBirth?: string;
  ssnLast4?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  kycStatus: 'verified' | 'pending_review' | 'action_required';
  kycTier: 'Tier 3 (Institutional/Private)' | 'Tier 2 (Full Verified)' | 'Tier 1 (Standard)';
  taxIdMasked: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  trustedDevices: DeviceInfo[];
  securityQuestionsSet: boolean;
  accountLocked: boolean;
  failedLoginAttempts: number;
}

export type AccountType = 'checking' | 'savings' | 'investment' | 'multicurrency' | 'cd';

export interface BankAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  iban?: string;
  swiftBic?: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  interestRateAPY?: number;
  monthlyLimit?: number;
  monthlySpent?: number;
  isFrozen: boolean;
  status: 'active' | 'restricted' | 'frozen';
  colorTheme: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'bill_payment' | 'card_purchase' | 'fee' | 'interest';
export type TransactionStatus = 'completed' | 'pending' | 'on_hold' | 'failed' | 'disputed';

export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  type: TransactionType;
  amount: number;
  currency: string;
  counterparty: string;
  counterpartyAccount?: string;
  category: 'Income' | 'Transfers' | 'Investments' | 'Utilities' | 'Dining & Travel' | 'Luxury & Retail' | 'Healthcare' | 'Fees';
  description: string;
  referenceNumber: string;
  timestamp: string;
  status: TransactionStatus;
  fee?: number;
  location?: string;
  isDisputed?: boolean;
  disputeReason?: string;
}

export type TransferType = 'internal' | 'external_ach' | 'external_wire' | 'international_swift';
export type TransferStatus = 'approved' | 'pending_review' | 'processing' | 'rejected' | 'completed';

export interface TransferRequest {
  id: string;
  type: TransferType;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId?: string;
  toAccountName: string;
  toAccountNumber?: string;
  toRoutingOrBic?: string;
  beneficiaryName: string;
  beneficiaryBank?: string;
  beneficiaryCountry?: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate?: number;
  fee: number;
  scheduledDate: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  purpose: string;
  status: TransferStatus;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  amlFlag?: boolean;
  adminNotes?: string;
  createdAt: string;
  referenceId: string;
}

export interface Beneficiary {
  id: string;
  nickname: string;
  fullName: string;
  bankName: string;
  accountNumber: string;
  routingOrSwift: string;
  country: string;
  currency: string;
  type: 'domestic' | 'international';
  verified: boolean;
  lastTransferDate?: string;
}

export interface BillPayment {
  id: string;
  payeeName: string;
  category: 'Utilities' | 'Credit Card' | 'Mortgage' | 'Telecom' | 'Tax & Municipal' | 'Insurance';
  accountNumber: string;
  amount: number;
  dueDate: string;
  autoPayEnabled: boolean;
  status: 'paid' | 'scheduled' | 'overdue' | 'pending';
  lastPaidDate?: string;
  confirmationCode?: string;
}

export interface BankCard {
  id: string;
  cardholderName: string;
  cardNumber: string; // full 16 digits for simulator
  cardType: 'debit' | 'credit';
  tier: 'black_metal' | 'gold_reserve' | 'platinum_elite';
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  pinMasked: string;
  isFrozen: boolean;
  dailySpendingLimit: number;
  dailyWithdrawalLimit: number;
  currentDaySpent: number;
  allowInternational: boolean;
  allowOnlineTransactions: boolean;
  allowAtmWithdrawals: boolean;
  allowContactless: boolean;
  linkedAccountId: string;
}

export interface BankDocument {
  id: string;
  title: string;
  type: 'statement' | 'tax' | 'confirmation' | 'kyc_proof' | 'contract';
  category?: 'statement' | 'tax' | 'confirmation' | 'legal';
  date: string;
  fileSize: string;
  period?: string;
  downloadUrl: string;
  isEncrypted: boolean;
  accountNumber?: string;
}

export interface MessageThreadItem {
  id: string;
  sender: string;
  senderRole: 'client' | 'officer' | 'system' | 'admin';
  senderName?: string;
  text: string;
  body?: string;
  timestamp: string;
  avatar?: string;
}

export interface SecureMessage {
  id: string;
  subject: string;
  category: 'Account Inquiry' | 'Wire & Transfer' | 'Fraud & Security' | 'Wealth Management' | 'Card Services' | string;
  senderRole: 'client' | 'officer' | 'system' | 'admin';
  senderName: string;
  timestamp: string;
  preview: string;
  isRead?: boolean;
  thread: MessageThreadItem[];
  threads?: MessageThreadItem[];
  unread: boolean;
  priority: 'normal' | 'urgent' | 'high';
}

export type NotificationType = 'security' | 'transaction' | 'account' | 'system' | 'ai_alert';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  category: 'security' | 'transaction' | 'account' | 'system' | 'ai_alert';
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
  isRead?: boolean;
  linkRoute?: string;
  actionUrl?: string;
  actionRequired?: boolean;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action?: string;
  event: string;
  category: 'LOGIN' | '2FA_CHALLENGE' | 'TRANSFER_INITIATION' | 'DEVICE_TRUST' | 'PASSWORD_CHANGE' | 'ADMIN_ACTION' | 'ACCOUNT_LOCK';
  ip?: string;
  ipAddress: string;
  location: string;
  device: string;
  status: 'SUCCESS' | 'WARNING' | 'BLOCKED' | 'FAILED';
  threatScore: number; // 0 - 100
  riskScore?: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  startedAt: string;
  loginTime?: string;
  lastActivity: string;
  isCurrent: boolean;
}

export interface CheckDepositRecord {
  id: string;
  accountId: string;
  accountName: string;
  amount: number;
  checkNumber: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  status: 'cleared' | 'provisional_hold' | 'rejected';
  depositDate: string;
  fundsAvailabilityDate: string;
  referenceNumber: string;
}

export interface StopPaymentRecord {
  id: string;
  accountId: string;
  checkNumber: string;
  payeeName: string;
  amount?: number;
  reason: 'Lost' | 'Stolen' | 'Dispute' | 'Duplicate' | 'Incorrect Amount' | 'Other';
  placedAt: string;
  expiresAt: string;
  status: 'active' | 'cancelled' | 'expired';
}

export interface CheckbookOrderRecord {
  id: string;
  accountId: string;
  style: 'Executive Navy Blue' | 'Classic Parchment' | 'Monogram Gold' | 'Carbonless Business';
  quantity: number; // 100, 200, 400
  startingCheckNumber: number;
  shippingAddress: string;
  orderedAt: string;
  trackingNumber: string;
  status: 'processing' | 'printed' | 'dispatched' | 'delivered';
}

export interface TravelNotice {
  id: string;
  cardId: string;
  cardName: string;
  destinationCountries: string[];
  departureDate: string;
  returnDate: string;
  contactPhone: string;
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CreditLineFacility {
  facilityId: string;
  facilityName: string;
  totalLimit: number;
  drawnAmount: number;
  availableLimit: number;
  apr: number; // e.g. 7.25%
  primeRate: number; // 6.50%
  spread: number; // 0.75%
  linkedCollateralValue: number;
  minimumMonthlyPayment: number;
  paymentDueDate: string;
}

export interface StandingOrder {
  id: string;
  fromAccountId: string;
  fromAccountName: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  beneficiaryBank?: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  nextExecutionDate: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  purpose: string;
  createdAt: string;
}

export interface CashSweepRule {
  enabled: boolean;
  sourceAccountId: string;
  targetAccountId: string;
  thresholdAmount: number; // sweep any balance over this
  frequency: 'daily' | 'weekly' | 'monthly';
  lastExecuted?: string;
  totalSweptYTD: number;
}

export type CdMaturityInstruction = 'renew_all' | 'renew_principal' | 'liquidate';

export interface CdAccountRecord {
  id: string;
  accountId: string;
  accountNumber: string;
  certificateName: string;
  principalAmount: number;
  interestRateAPY: number;
  termMonths: number;
  issueDate: string;
  maturityDate: string;
  projectedInterestYield: number;
  accruedInterestToDate: number;
  maturityInstruction: CdMaturityInstruction;
  payoutAccountId: string;
  penaltyForEarlyWithdrawal: string;
}

export interface BankBranchLocation {
  id: string;
  name: string;
  type: 'Private Wealth Flagship' | 'Global Treasury Office' | 'Custody & Bullion Vault' | 'Allpoint Plus ATM';
  address: string;
  city: string;
  stateOrRegion: string;
  country: string;
  postalCode: string;
  phone: string;
  hours: string;
  amenities: string[];
  hasSafeDepositBoxes: boolean;
  hasBullionVault: boolean;
  hasNotaryMedallion: boolean;
  hasAtm24h: boolean;
  coordinates: { lat: number; lng: number };
}

export interface WireLimitSettings {
  dailyFedwireLimit: number;
  singleWireLimit: number;
  swiftDailyLimit: number;
  internalSweepLimit: number;
  todayFedwireUsed: number;
  tempIncreaseActive: boolean;
  tempLimitAmount?: number;
  tempLimitExpiry?: string;
  tempLimitReason?: string;
}

export type BiometricType = 'face_id' | 'touch_id' | 'fido2_auto';

export interface BiometricSettings {
  enabled: boolean;
  type: BiometricType;
  requireForWires: boolean;
  thresholdAmount: number;
  requireForBeneficiaries: boolean;
  requireForPasswordChange: boolean;
  hardwareEnclaveId: string;
  enclaveSecurityLevel: 'Secure Enclave L3 (FIPS 140-3)' | 'WebAuthn Level 2' | 'Hardware TPM 2.0';
  lastAuthenticated?: string;
}

export interface SqlFieldChangeDetail {
  from: any;
  to: any;
  difference?: any;
}

export interface SqlAdminAuditLog {
  id: string;
  timestamp: string;
  adminUserId: string;
  adminUsername: string;
  action: string;
  targetEntityType: 'account' | 'audit_log' | 'transfer' | 'customer' | 'system' | 'card' | 'security';
  targetEntityId: string;
  fieldsChanged: Record<string, SqlFieldChangeDetail>;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  executionStatus: 'SUCCESS' | 'FAILED' | 'REJECTED';
}
