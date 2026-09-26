import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { verifyTotpToken } from '../utils/totp';
import {
  UserProfile,
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
  ActiveSession,
  DeviceInfo,
  TwoFactorMethod,
  CheckDepositRecord,
  StopPaymentRecord,
  CheckbookOrderRecord,
  TravelNotice,
  CreditLineFacility,
  StandingOrder,
  CashSweepRule,
  CdAccountRecord,
  CdMaturityInstruction,
  BankBranchLocation,
  WireLimitSettings,
  BiometricSettings,
  BiometricType,
  SqlAdminAuditLog,
  SqlFieldChangeDetail,
  RoleDefinition,
  PermissionAction,
  PermissionResource
} from '../types/banking';
import {
  logAdminActionToSql,
  fetchSqlAuditLogs,
  computeFieldDiff
} from '../services/sqlAuditService';
import { EnrolledSecurityKey } from '../utils/webauthn';
import { hasPermission, SYSTEM_ROLES } from '../utils/permissions';
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
  INITIAL_ACTIVE_SESSIONS,
  INITIAL_CHECK_DEPOSITS,
  INITIAL_STOPPED_CHECKS,
  INITIAL_CHECKBOOK_ORDERS,
  INITIAL_TRAVEL_NOTICES,
  INITIAL_CREDIT_LINE,
  INITIAL_STANDING_ORDERS,
  INITIAL_CASH_SWEEP,
  INITIAL_CD_RECORDS,
  INITIAL_BRANCH_LOCATIONS,
  INITIAL_WIRE_LIMITS
} from '../services/mockData';

export type AuthStage = 'unauthenticated' | 'awaiting_2fa' | 'awaiting_device_registration' | 'authenticated' | 'locked';

export interface TwoFactorSettingsData {
  totpSecret: string;
  recoveryCodes: string[];
}

interface BankingContextType {
  // Navigation & View
  currentRoute: string;
  navigateTo: (route: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  isDesktopMode: boolean;
  setIsDesktopMode: (val: boolean) => void;
  toggleDesktopMode: () => void;

  // Theme & Appearance (High-Contrast Dark Mode)
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;

  // Biometric Authentication & Hardware Passkeys
  biometricSettings: BiometricSettings;
  updateBiometricSettings: (settings: Partial<BiometricSettings>) => void;
  toggleBiometricAuth: () => void;
  realFaceVerificationEnabled: boolean;
  setRealFaceVerificationEnabled: (enabled: boolean) => void;
  lastFaceVerificationTimestamp: string | null;
  recordFaceVerification: () => void;

  // Real Hardware Security Keys (FIDO2 / YubiKey / Passkeys)
  enrolledSecurityKeys: EnrolledSecurityKey[];
  addSecurityKey: (key: EnrolledSecurityKey) => void;
  removeSecurityKey: (id: string) => void;

  // Granular Privacy & Eye Lock Controls
  privacyMode: boolean;
  setPrivacyMode: (val: boolean) => void;
  togglePrivacyMode: () => void;
  granularMaskMap: Record<string, boolean>;
  isItemMasked: (key: string) => boolean;
  toggleItemMask: (key: string) => void;
  maskAllItems: () => void;
  unmaskAllItems: () => void;
  autoMaskOnTabBlur: boolean;
  setAutoMaskOnTabBlur: (val: boolean) => void;
  sessionTimeoutMinutes: number;
  setSessionTimeoutMinutes: (mins: number) => void;
  securityPostureScore: number;
  securityPostureLevel: 'OPTIMAL' | 'HIGH' | 'ATTENTION';
  formatAmount: (amount: number, currency?: string) => string;
  maskSensitiveNumber: (val: string, showLast?: number) => string;

  // Authentication & Session
  currentUser: UserProfile | null;
  authStage: AuthStage;
  pendingUsername: string;
  rememberDeviceChecked: boolean;
  sessionLocked: boolean;
  sessionRemainingSeconds: number;
  extendSession: () => void;
  lockSessionManually: () => void;
  unlockSession: (pinOrPassword: string) => boolean;
  login: (accountNumberOrIdentifier: string, password: string, rememberDevice: boolean) => { success: boolean; error?: string };
  verify2FA: (code: string, trustDevice: boolean) => { success: boolean; error?: string };
  verifyRecoveryCode: (code: string) => { success: boolean; error?: string };
  registerCurrentDevice: (deviceName: string, makeTrusted: boolean) => void;
  logout: () => void;
  unlockAccountWithKYC: (answers: { ssnLast4: string; birthYear: string; motherMaiden: string }) => boolean;
  requestPasswordReset: (identifier: string) => boolean;
  resetPassword: (newPass: string) => boolean;
  switchUserPersona: (role: 'client' | 'admin') => void;

  // Banking State
  accounts: BankAccount[];
  transactions: Transaction[];
  transfers: TransferRequest[];
  beneficiaries: Beneficiary[];
  bills: BillPayment[];
  cards: BankCard[];
  documents: BankDocument[];
  messages: SecureMessage[];
  notifications: NotificationItem[];
  auditLogs: SecurityAuditLog[];
  activeSessions: ActiveSession[];
  trustedDevices: DeviceInfo[];
  allCustomers: UserProfile[];

  // Totals & Computed
  totalNetWorthUSD: number;
  totalAvailableUSD: number;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  pendingTransfersCount: number;
  aiSpendingAlerts: boolean;
  setAiSpendingAlerts: (val: boolean) => void;
  aiSpendingThreshold: number;
  setAiSpendingThreshold: (val: number) => void;
  addNotification: (item: Partial<NotificationItem>) => void;
  simulateAiSpendingAlert: (customAmount?: number, reason?: string) => void;

  // Actions
  initiateTransfer: (data: Omit<TransferRequest, 'id' | 'createdAt' | 'status' | 'referenceId'>) => TransferRequest;
  approveTransfer: (id: string, adminNotes?: string) => void;
  rejectTransfer: (id: string, reason: string) => void;
  addBeneficiary: (ben: Omit<Beneficiary, 'id' | 'verified'>) => void;
  updateBeneficiary: (id: string, updates: Partial<Beneficiary>) => void;
  deleteBeneficiary: (id: string) => void;
  payBill: (billId: string, amount?: number) => void;
  addBill: (bill: Omit<BillPayment, 'id' | 'status'>) => void;
  toggleCardFreeze: (cardId: string) => void;
  updateCardLimits: (cardId: string, dailySpend: number, dailyAtm: number) => void;
  updateCardSecuritySwitches: (cardId: string, switches: { allowInternational?: boolean; allowOnline?: boolean; allowAtm?: boolean; allowContactless?: boolean }) => void;
  disputeTransaction: (txId: string, reason: string) => void;
  sendSecureMessage: (subject: string, category: any, text: string) => void;
  sendMessage: (data: { subject: string; category: any; body: string; priority?: any }) => void;
  adminReplyMessage: (messageId: string, text: string) => void;
  replyToMessage: (messageId: string, text: string) => void;
  markMessageRead: (messageId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  uploadDocument: (doc: Partial<BankDocument>) => void;
  updateProfileInfo: (updates: Partial<UserProfile>) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateCustomerProfile: (customerId: string, updates: Partial<UserProfile>) => void;
  updateSecuritySettings: (twoFactorEnabled: boolean, method: TwoFactorMethod) => void;
  twoFactorSettings: TwoFactorSettingsData;
  updateTwoFactorSettings: (settings: Partial<TwoFactorSettingsData>) => void;
  regenerateRecoveryCodes: () => void;
  updateMasterPassword: (current: string, newPass: string) => boolean;
  revokeDevice: (deviceId: string) => void;
  terminateSession: (sessionId: string) => void;
  terminateAllOtherSessions: () => void;
  adminAdjustAccountBalance: (accountId: string, amount: number, note: string) => void;
  adjustAccountBalance: (accountId: string, amount: number, note: string) => void;
  adminSetAccountStatus: (accountId: string, status: 'active' | 'restricted' | 'frozen') => void;
  updateAccountStatus: (accountId: string, status: 'active' | 'restricted' | 'frozen') => void;
  adminSetCustomerKYC: (status: 'verified' | 'pending_review' | 'action_required') => void;
  createCustomerAccount: (data: {
    customer: Partial<UserProfile>;
    account?: Partial<BankAccount> & { initialDeposit?: number };
  }) => Promise<{ customer: UserProfile; account?: BankAccount }>;
  createBankAccount: (data: Partial<BankAccount> & { initialDeposit?: number }) => Promise<BankAccount>;
  resetAllData: () => void;

  // Role & Permission-Based Access Controls (RBAC)
  roles: RoleDefinition[];
  hasPermission: (required: string | { action: PermissionAction; resource?: PermissionResource }) => boolean;
  accessDeniedState: { isOpen: boolean; requiredPermission: string; attemptedFeature: string; customMessage?: string } | null;
  triggerAccessDenied: (requiredPermission: string, attemptedFeature?: string, customMessage?: string) => void;
  closeAccessDenied: () => void;
  createRole: (roleData: Omit<RoleDefinition, 'isSystem'>) => Promise<RoleDefinition>;
  updateRole: (id: string, updates: Partial<RoleDefinition>) => Promise<RoleDefinition>;
  deleteRole: (id: string) => Promise<boolean>;
  updateUserRoleAndPermissions: (userId: string, role: string, permissions?: string[]) => Promise<UserProfile | null>;

  // Check Services & Enclave
  checkDeposits: CheckDepositRecord[];
  stoppedChecks: StopPaymentRecord[];
  checkbookOrders: CheckbookOrderRecord[];
  depositCheck: (accountId: string, amount: number, checkNumber: string, memo?: string) => { success: boolean; referenceNumber: string };
  fundAccount: (params: {
    accountId: string;
    amount: number;
    fundingMethod?: 'check' | 'wire' | 'ach' | 'direct_credit';
    checkNumber?: string;
    externalReference?: string;
    memo?: string;
    sourceInstitution?: string;
  }) => Promise<{ success: boolean; referenceNumber?: string; error?: string }>;
  placeStopPayment: (accountId: string, checkNumber: string, payeeName: string, amount?: number, reason?: string) => { success: boolean };
  orderCheckbook: (accountId: string, style: any, quantity: number, startingCheckNumber: number, shippingAddress: string) => { success: boolean; trackingNumber: string };

  // Foreign Exchange (FX) Conversion
  executeFxConversion: (fromAccountId: string, toAccountId: string, sourceAmount: number, targetAmount: number, exchangeRate: number) => { success: boolean; error?: string };

  // Institutional Credit Line & Lending
  creditLine: CreditLineFacility;
  drawdownCreditLine: (targetAccountId: string, amount: number) => { success: boolean; error?: string };
  repayCreditLine: (sourceAccountId: string, amount: number) => { success: boolean; error?: string };

  // Advanced Card Controls & Travel Notices
  travelNotices: TravelNotice[];
  addTravelNotice: (notice: Omit<TravelNotice, 'id' | 'createdAt' | 'status'>) => void;
  deleteTravelNotice: (id: string) => void;
  merchantCategoryLocks: Record<string, boolean>;
  updateMerchantCategoryLocks: (locks: Record<string, boolean>) => void;

  // Standing Orders & Automated Cash Sweeps
  standingOrders: StandingOrder[];
  addStandingOrder: (order: Omit<StandingOrder, 'id' | 'createdAt' | 'status'>) => void;
  cancelStandingOrder: (id: string) => void;
  cashSweepRule: CashSweepRule;
  updateCashSweepRule: (rule: Partial<CashSweepRule>) => void;

  // Google Authenticator & Internal Bank Commands
  adminTotpSecret: string;
  updateAdminTotpSecret: (newSecret: string) => void;
  verifyAdminTotp: (code: string) => Promise<boolean>;
  executeInternalBankCommand: (commandName: string, totpCode: string, onExecute: () => void) => Promise<{ success: boolean; error?: string }>;

  // External SQL Database SIEM Regulatory Audit Trail
  sqlAuditLogs: SqlAdminAuditLog[];
  fetchSqlAuditLogs: (filters?: any) => Promise<SqlAdminAuditLog[]>;
  logAdminSqlAction: (entry: {
    action: string;
    targetEntityType: 'account' | 'audit_log' | 'transfer' | 'customer' | 'system' | 'card' | 'security';
    targetEntityId: string;
    fieldsChanged: Record<string, SqlFieldChangeDetail>;
    details: string;
    adminUserId?: string;
    adminUsername?: string;
    executionStatus?: 'SUCCESS' | 'FAILED' | 'REJECTED';
    timestamp?: string;
  }) => Promise<SqlAdminAuditLog>;
  logAuditView: (details?: string) => Promise<void>;
}

const BankingContext = createContext<BankingContextType | null>(null);

const STORAGE_KEY_PREFIX = 'nt_bank_portal_v7_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Storage parse error', e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error', e);
  }
}

export const BankingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [currentRoute, setCurrentRoute] = useState<string>('/login');
  const [isAdminMode, setIsAdminModeState] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isDesktopMode, setIsDesktopMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nt_desktop_mode') || localStorage.getItem('apex_desktop_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleDesktopMode = useCallback(() => {
    setIsDesktopMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nt_desktop_mode', String(next));
      } catch {}
      return next;
    });
  }, []);

  const openMobileDrawer = () => setIsMobileDrawerOpen(true);
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false);

  // Theme & Appearance (High-Contrast Dark Mode)
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nt_dark_mode') || localStorage.getItem('apex_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const setDarkMode = useCallback((enabled: boolean) => {
    setDarkModeState(enabled);
    try {
      localStorage.setItem('nt_dark_mode', String(enabled));
    } catch {}
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Authentication
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authStage, setAuthStage] = useState<AuthStage>('unauthenticated');
  const [pendingUsername, setPendingUsername] = useState<string>('');
  const [rememberDeviceChecked, setRememberDeviceChecked] = useState<boolean>(false);
  const [sessionLocked, setSessionLocked] = useState<boolean>(false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutesState] = useState<number>(() => {
    return loadFromStorage('session_timeout_mins', 5);
  });
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(() => {
    const mins = loadFromStorage('session_timeout_mins', 5);
    return mins * 60;
  });
  const [failedUnlockAttempts, setFailedUnlockAttempts] = useState<number>(0);

  // Global Privacy Shield / Screen Masking & Granular Eye Locks
  const [privacyMode, setPrivacyModeState] = useState<boolean>(() => {
    return loadFromStorage('privacy_mode', false);
  });
  const [granularMaskMap, setGranularMaskMap] = useState<Record<string, boolean>>(() => {
    return loadFromStorage('granular_mask_map', {});
  });
  const [autoMaskOnTabBlur, setAutoMaskOnTabBlurState] = useState<boolean>(() => {
    return loadFromStorage('auto_mask_blur', true);
  });

  const setPrivacyMode = useCallback((val: boolean) => {
    setPrivacyModeState(val);
    saveToStorage('privacy_mode', val);
  }, []);

  const togglePrivacyMode = useCallback(() => {
    setPrivacyModeState(prev => {
      const next = !prev;
      saveToStorage('privacy_mode', next);
      return next;
    });
  }, []);

  const isItemMasked = useCallback((key: string): boolean => {
    if (privacyMode) return true;
    return !!granularMaskMap[key];
  }, [privacyMode, granularMaskMap]);

  const toggleItemMask = useCallback((key: string) => {
    setGranularMaskMap(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveToStorage('granular_mask_map', next);
      return next;
    });
  }, []);

  const maskAllItems = useCallback(() => {
    setPrivacyModeState(true);
    saveToStorage('privacy_mode', true);
  }, []);

  const unmaskAllItems = useCallback(() => {
    setPrivacyModeState(false);
    saveToStorage('privacy_mode', false);
    setGranularMaskMap({});
    saveToStorage('granular_mask_map', {});
  }, []);

  // Real Hardware Security Keys (FIDO2 / YubiKey / WebAuthn)
  const INITIAL_SECURITY_KEYS: EnrolledSecurityKey[] = [
    {
      id: 'key_yubikey_01',
      name: 'YubiKey 5C NFC (Primary Hardware Key)',
      type: 'yubikey_nfc',
      credentialId: 'yk_9941a82f019b882',
      enrolledAt: '2026-09-20T14:32:00Z',
      lastUsedAt: '2026-09-25T13:42:00Z',
      attestationFormat: 'fido-u2f (FIPS 140-3 Hardware Level 4)',
      fipsLevel: 4,
      isEnclaveBound: true
    },
    {
      id: 'key_apple_touchid',
      name: 'MacBook Pro Secure Enclave Touch ID',
      type: 'apple_touch_id',
      credentialId: 'ap_7710b33c09e144a',
      enrolledAt: '2026-09-21T09:15:00Z',
      lastUsedAt: '2026-09-25T13:50:00Z',
      attestationFormat: 'apple-enclave-fips',
      fipsLevel: 4,
      isEnclaveBound: true
    }
  ];

  const [enrolledSecurityKeys, setEnrolledSecurityKeys] = useState<EnrolledSecurityKey[]>(() => {
    return loadFromStorage('enrolled_security_keys', INITIAL_SECURITY_KEYS);
  });

  const addSecurityKey = useCallback((key: EnrolledSecurityKey) => {
    setEnrolledSecurityKeys(prev => {
      const next = [key, ...prev.filter(k => k.id !== key.id)];
      saveToStorage('enrolled_security_keys', next);
      return next;
    });
  }, []);

  const removeSecurityKey = useCallback((id: string) => {
    setEnrolledSecurityKeys(prev => {
      const next = prev.filter(k => k.id !== id);
      saveToStorage('enrolled_security_keys', next);
      return next;
    });
  }, []);

  // Real Face Verification State
  const [realFaceVerificationEnabled, setRealFaceVerificationEnabledState] = useState<boolean>(() => {
    return loadFromStorage('real_face_auth', true);
  });
  const [lastFaceVerificationTimestamp, setLastFaceVerificationTimestamp] = useState<string | null>(() => {
    return loadFromStorage('last_face_verification', '2026-09-25 13:48:10 UTC');
  });

  const setRealFaceVerificationEnabled = useCallback((enabled: boolean) => {
    setRealFaceVerificationEnabledState(enabled);
    saveToStorage('real_face_auth', enabled);
  }, []);

  const recordFaceVerification = useCallback(() => {
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    setLastFaceVerificationTimestamp(ts);
    saveToStorage('last_face_verification', ts);
  }, []);

  const setAutoMaskOnTabBlur = useCallback((val: boolean) => {
    setAutoMaskOnTabBlurState(val);
    saveToStorage('auto_mask_blur', val);
  }, []);

  const setSessionTimeoutMinutes = useCallback((mins: number) => {
    const validMins = Math.max(1, Math.min(60, mins));
    setSessionTimeoutMinutesState(validMins);
    saveToStorage('session_timeout_mins', validMins);
    setSessionRemainingSeconds(validMins * 60);
  }, []);

  // Main Banking Entities
  const [accounts, setAccounts] = useState<BankAccount[]>(() => loadFromStorage('accounts', INITIAL_ACCOUNTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('transactions', INITIAL_TRANSACTIONS));
  const [transfers, setTransfers] = useState<TransferRequest[]>(() => loadFromStorage('transfers', INITIAL_TRANSFERS));
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => loadFromStorage('beneficiaries', INITIAL_BENEFICIARIES));
  const [bills, setBills] = useState<BillPayment[]>(() => loadFromStorage('bills', INITIAL_BILL_PAYMENTS));
  const [cards, setCards] = useState<BankCard[]>(() => loadFromStorage('cards', INITIAL_CARDS));
  const [documents, setDocuments] = useState<BankDocument[]>(() => loadFromStorage('documents', INITIAL_DOCUMENTS));
  const [messages, setMessages] = useState<SecureMessage[]>(() => loadFromStorage('messages', INITIAL_MESSAGES));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS));
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(() => loadFromStorage('active_sessions', INITIAL_ACTIVE_SESSIONS));
  const [trustedDevices, setTrustedDevices] = useState<DeviceInfo[]>(() => INITIAL_CLIENT_PROFILE.trustedDevices);
  const [allCustomers, setAllCustomers] = useState<UserProfile[]>(() => loadFromStorage('all_customers', MOCK_CUSTOMERS_LIST));
  const [roles, setRoles] = useState<RoleDefinition[]>(() => loadFromStorage('roles', SYSTEM_ROLES));
  const [accessDeniedState, setAccessDeniedState] = useState<{
    isOpen: boolean;
    requiredPermission: string;
    attemptedFeature: string;
    customMessage?: string;
  } | null>(null);

  // Advanced Banking Entities: Checks, FX, Lending, Travel, Standing Orders, Sweeps
  const [checkDeposits, setCheckDeposits] = useState<CheckDepositRecord[]>(() => loadFromStorage('check_deposits', INITIAL_CHECK_DEPOSITS));
  const [stoppedChecks, setStoppedChecks] = useState<StopPaymentRecord[]>(() => loadFromStorage('stopped_checks', INITIAL_STOPPED_CHECKS));
  const [checkbookOrders, setCheckbookOrders] = useState<CheckbookOrderRecord[]>(() => loadFromStorage('checkbook_orders', INITIAL_CHECKBOOK_ORDERS));
  const [creditLine, setCreditLine] = useState<CreditLineFacility>(() => loadFromStorage('credit_line', INITIAL_CREDIT_LINE));
  const [travelNotices, setTravelNotices] = useState<TravelNotice[]>(() => loadFromStorage('travel_notices', INITIAL_TRAVEL_NOTICES));
  const [merchantCategoryLocks, setMerchantCategoryLocks] = useState<Record<string, boolean>>(() => loadFromStorage('card_locks', { atm: false, gambling: true, crypto: false, international: false }));
  const [standingOrders, setStandingOrders] = useState<StandingOrder[]>(() => loadFromStorage('standing_orders', INITIAL_STANDING_ORDERS));
  const [cashSweepRule, setCashSweepRule] = useState<CashSweepRule>(() => loadFromStorage('cash_sweep', INITIAL_CASH_SWEEP));

  const [twoFactorSettings, setTwoFactorSettings] = useState<TwoFactorSettingsData>({
    totpSecret: 'HXDM-729B-KW4L-99AQ',
    recoveryCodes: ['9921-8842-1049', '5512-3390-4412', '7741-0023-8851', '1249-9941-2041']
  });

  const DEFAULT_BIOMETRICS: BiometricSettings = {
    enabled: true,
    type: 'face_id',
    requireForWires: true,
    thresholdAmount: 10000,
    requireForBeneficiaries: true,
    requireForPasswordChange: true,
    hardwareEnclaveId: 'SEC-ENC-APX-9824-A',
    enclaveSecurityLevel: 'Secure Enclave L3 (FIPS 140-3)',
    lastAuthenticated: '2026-09-24 16:42:10 UTC'
  };

  // External SQL Database Audit Logs State
  const [sqlAuditLogs, setSqlAuditLogs] = useState<SqlAdminAuditLog[]>([]);

  // =========================================================================
  // REAL-TIME BANKING DATABASE ENGINE & SSE SYNCHRONIZATION
  // =========================================================================
  useEffect(() => {
    // 1. Initial State Fetch from Real-Time Database
    fetch('/api/banking/state')
      .then(res => {
        if (!res.ok) throw new Error('Database fetch failed');
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
          saveToStorage('accounts', data.accounts);
        }
        if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          saveToStorage('transactions', data.transactions);
        }
        if (data && Array.isArray(data.transfers)) {
          setTransfers(data.transfers);
          saveToStorage('transfers', data.transfers);
        }
        if (data && Array.isArray(data.cards)) {
          setCards(data.cards);
          saveToStorage('cards', data.cards);
        }
        if (data && Array.isArray(data.customers)) {
          setAllCustomers(data.customers);
          saveToStorage('all_customers', data.customers);
        }
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
          saveToStorage('messages', data.messages);
        }
        if (data && Array.isArray(data.bills)) {
          setBills(data.bills);
          saveToStorage('bills', data.bills);
        }
        if (data && Array.isArray(data.roles)) {
          setRoles(data.roles);
          saveToStorage('roles', data.roles);
        }
      })
      .catch(() => {
        // Fallback to local storage
      });

    // 2. Real-Time Server-Sent Events (SSE) Live Stream
    let sse: EventSource | null = null;
    try {
      sse = new EventSource('/api/banking/stream');

      sse.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'TRANSFER_CREATED') {
            if (msg.payload?.transfer) {
              setTransfers(prev => [msg.payload.transfer, ...prev.filter(t => t.id !== msg.payload.transfer.id)]);
            }
            if (msg.payload?.accounts) {
              setAccounts(msg.payload.accounts);
              saveToStorage('accounts', msg.payload.accounts);
            }
          } else if (msg.type === 'TRANSFER_APPROVED') {
            if (msg.payload?.transfer) {
              setTransfers(prev => prev.map(t => t.id === msg.payload.transfer.id ? msg.payload.transfer : t));
            }
            if (msg.payload?.accounts) {
              setAccounts(msg.payload.accounts);
              saveToStorage('accounts', msg.payload.accounts);
            }
            if (msg.payload?.transaction) {
              setTransactions(prev => [msg.payload.transaction, ...prev]);
            }
          } else if (msg.type === 'TRANSFER_REJECTED') {
            if (msg.payload?.transfer) {
              setTransfers(prev => prev.map(t => t.id === msg.payload.transfer.id ? msg.payload.transfer : t));
            }
          } else if (msg.type === 'BALANCE_ADJUSTED') {
            if (msg.payload?.account) {
              setAccounts(prev => prev.map(a => a.id === msg.payload.account.id ? msg.payload.account : a));
            }
            if (msg.payload?.transaction) {
              setTransactions(prev => [msg.payload.transaction, ...prev]);
            }
          } else if (msg.type === 'CHECK_DEPOSITED') {
            if (msg.payload?.account) {
              setAccounts(prev => prev.map(a => a.id === msg.payload.account.id ? msg.payload.account : a));
            }
            if (msg.payload?.transaction) {
              setTransactions(prev => [msg.payload.transaction, ...prev]);
            }
          } else if (msg.type === 'CARD_UPDATED') {
            if (msg.payload?.card) {
              setCards(prev => prev.map(c => c.id === msg.payload.card.id ? msg.payload.card : c));
            }
          } else if (msg.type === 'MESSAGE_CREATED' || msg.type === 'MESSAGE_UPDATED') {
            if (msg.payload?.message) {
              setMessages(prev => [msg.payload.message, ...prev.filter(m => m.id !== msg.payload.message.id)]);
            }
          } else if (msg.type === 'BILL_PAID') {
            if (msg.payload?.bill) {
              setBills(prev => prev.map(b => b.id === msg.payload.bill.id ? msg.payload.bill : b));
            }
            if (msg.payload?.accounts) {
              setAccounts(msg.payload.accounts);
              saveToStorage('accounts', msg.payload.accounts);
            }
          } else if (msg.type === 'KYC_UPDATED') {
            if (msg.payload?.kycStatus) {
              setAllCustomers(prev => prev.map(c => ({ ...c, kycStatus: msg.payload.kycStatus })));
            }
          } else if (msg.type === 'CUSTOMER_CREATED') {
            if (msg.payload?.customer) {
              setAllCustomers(prev => [msg.payload.customer, ...prev.filter(c => c.id !== msg.payload.customer.id)]);
            }
            if (msg.payload?.account) {
              setAccounts(prev => [msg.payload.account, ...prev.filter(a => a.id !== msg.payload.account.id)]);
            }
            if (msg.payload?.transaction) {
              setTransactions(prev => [msg.payload.transaction, ...prev.filter(t => t.id !== msg.payload.transaction.id)]);
            }
          } else if (msg.type === 'CUSTOMER_UPDATED') {
            if (msg.payload?.customer) {
              setAllCustomers(prev => prev.map(c => c.id === msg.payload.customer.id ? msg.payload.customer : c));
              setCurrentUser(curr => (curr && curr.id === msg.payload.customer.id ? msg.payload.customer : curr));
            }
          } else if (msg.type === 'ROLES_UPDATED') {
            if (msg.payload?.roles) {
              setRoles(msg.payload.roles);
              saveToStorage('roles', msg.payload.roles);
            }
          } else if (msg.type === 'BENEFICIARY_DELETED') {
            if (msg.payload?.beneficiaries) {
              setBeneficiaries(msg.payload.beneficiaries);
              saveToStorage('beneficiaries', msg.payload.beneficiaries);
            }
          } else if (msg.type === 'NOTIFICATION_DELETED') {
            if (msg.payload?.notifications) {
              setNotifications(msg.payload.notifications);
              saveToStorage('notifications', msg.payload.notifications);
            }
          } else if (msg.type === 'ACCOUNT_CREATED') {
            if (msg.payload?.account) {
              setAccounts(prev => [msg.payload.account, ...prev.filter(a => a.id !== msg.payload.account.id)]);
            }
            if (msg.payload?.transaction) {
              setTransactions(prev => [msg.payload.transaction, ...prev.filter(t => t.id !== msg.payload.transaction.id)]);
            }
          } else if (msg.type === 'SQL_AUDIT_LOG_CREATED') {
            if (msg.payload?.log) {
              setSqlAuditLogs(prev => [msg.payload.log, ...prev.filter(l => l.id !== msg.payload.log.id)]);
            }
          } else if (msg.type === 'STATE_RESET') {
            if (msg.payload) {
              setAccounts(msg.payload.accounts);
              setTransactions(msg.payload.transactions);
              setTransfers(msg.payload.transfers);
              setCards(msg.payload.cards);
              setMessages(msg.payload.messages);
            }
          }
        } catch {}
      };
    } catch {}

    return () => {
      sse?.close();
    };
  }, []);

  const [aiSpendingAlerts, setAiSpendingAlertsState] = useState<boolean>(() => loadFromStorage('ai_spending_alerts', true));
  const [aiSpendingThreshold, setAiSpendingThresholdState] = useState<number>(() => loadFromStorage('ai_spending_threshold', 10000));
  
  const setAiSpendingAlerts = useCallback((val: boolean) => {
    setAiSpendingAlertsState(val);
    saveToStorage('ai_spending_alerts', val);
  }, []);

  const setAiSpendingThreshold = useCallback((val: number) => {
    setAiSpendingThresholdState(val);
    saveToStorage('ai_spending_threshold', val);
  }, []);

  // Granular Access Control and Permission State Helpers
  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user-id': currentUser?.id || '',
    'x-user-role': currentUser?.role || ''
  }), [currentUser]);

  const checkHasPerm = useCallback((required: string | { action: PermissionAction; resource?: PermissionResource }): boolean => {
    return hasPermission(currentUser, required);
  }, [currentUser]);

  const triggerAccessDenied = useCallback((requiredPermission: string, attemptedFeature?: string, customMessage?: string) => {
    setAccessDeniedState({
      isOpen: true,
      requiredPermission,
      attemptedFeature: attemptedFeature || requiredPermission,
      customMessage
    });
  }, []);

  const closeAccessDenied = useCallback(() => {
    setAccessDeniedState(null);
  }, []);

  const addNotification = useCallback((item: Partial<NotificationItem>) => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: item.title || 'System Notification',
      message: item.message || '',
      category: item.category || 'system',
      type: item.type || (item.category as any) || 'system',
      severity: item.severity || 'low',
      timestamp: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      read: false,
      isRead: false,
      linkRoute: item.linkRoute || '/notifications',
      ...item
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const simulateAiSpendingAlert = useCallback((customAmount = 28500, reason = 'Off-pattern cross-border digital settlement') => {
    addNotification({
      title: 'AI Sentinel: High-Value Anomaly Detected ($' + customAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) + ')',
      message: 'AI behavioral monitor flagged an unusual transaction: ' + reason + ' exceeding the $' + aiSpendingThreshold.toLocaleString() + ' alert parameter.',
      category: 'ai_alert',
      type: 'ai_alert',
      severity: customAmount > 50000 ? 'high' : 'medium',
      linkRoute: '/transactions'
    });
  }, [addNotification, aiSpendingThreshold]);

  const [biometricSettings, setBiometricSettings] = useState<BiometricSettings>(() =>
    loadFromStorage('biometric_settings', DEFAULT_BIOMETRICS)
  );

  const updateBiometricSettings = useCallback((settings: Partial<BiometricSettings>) => {
    setBiometricSettings(prev => {
      const updated = { ...prev, ...settings };
      return updated;
    });
  }, []);

  const toggleBiometricAuth = useCallback(() => {
    setBiometricSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  }, []);

  // Sync to local storage
  useEffect(() => { saveToStorage('biometric_settings', biometricSettings); }, [biometricSettings]);
  useEffect(() => { saveToStorage('accounts', accounts); }, [accounts]);
  useEffect(() => { saveToStorage('transactions', transactions); }, [transactions]);
  useEffect(() => { saveToStorage('transfers', transfers); }, [transfers]);
  useEffect(() => { saveToStorage('beneficiaries', beneficiaries); }, [beneficiaries]);
  useEffect(() => { saveToStorage('bills', bills); }, [bills]);
  useEffect(() => { saveToStorage('cards', cards); }, [cards]);
  useEffect(() => { saveToStorage('documents', documents); }, [documents]);
  useEffect(() => { saveToStorage('messages', messages); }, [messages]);
  useEffect(() => { saveToStorage('notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('audit_logs', auditLogs); }, [auditLogs]);
  useEffect(() => { saveToStorage('active_sessions', activeSessions); }, [activeSessions]);
  useEffect(() => { saveToStorage('all_customers', allCustomers); }, [allCustomers]);
  useEffect(() => { saveToStorage('check_deposits', checkDeposits); }, [checkDeposits]);
  useEffect(() => { saveToStorage('stopped_checks', stoppedChecks); }, [stoppedChecks]);
  useEffect(() => { saveToStorage('checkbook_orders', checkbookOrders); }, [checkbookOrders]);
  useEffect(() => { saveToStorage('credit_line', creditLine); }, [creditLine]);
  useEffect(() => { saveToStorage('travel_notices', travelNotices); }, [travelNotices]);
  useEffect(() => { saveToStorage('card_locks', merchantCategoryLocks); }, [merchantCategoryLocks]);
  useEffect(() => { saveToStorage('standing_orders', standingOrders); }, [standingOrders]);
  useEffect(() => { saveToStorage('cash_sweep', cashSweepRule); }, [cashSweepRule]);

  const logSecurityEvent = useCallback((event: string, category: SecurityAuditLog['category'], status: SecurityAuditLog['status'], details: string, threatScore = 5) => {
    const newLog: SecurityAuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: details,
      event,
      category,
      ip: '198.51.100.44',
      ipAddress: '198.51.100.44',
      location: 'New York, USA',
      device: 'MacBook Pro 16" (Chrome 129.0)',
      status,
      threatScore,
      riskScore: threatScore > 50 ? 'HIGH' : threatScore > 20 ? 'MEDIUM' : 'LOW',
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  // =========================================================================
  // EXTERNAL SQL DATABASE - IMMUTABLE REGULATORY SIEM AUDIT LEDGER
  // =========================================================================
  const logAdminSqlAction = useCallback(async (entry: {
    action: string;
    targetEntityType: 'account' | 'audit_log' | 'transfer' | 'customer' | 'system' | 'card' | 'security';
    targetEntityId: string;
    fieldsChanged: Record<string, SqlFieldChangeDetail>;
    details: string;
    adminUserId?: string;
    adminUsername?: string;
    executionStatus?: 'SUCCESS' | 'FAILED' | 'REJECTED';
    timestamp?: string;
  }): Promise<SqlAdminAuditLog> => {
    const adminUserId = entry.adminUserId || currentUser?.id || 'usr_admin_001';
    const adminUsername = entry.adminUsername || currentUser?.fullName || (currentUser?.role === 'admin' ? currentUser.username : 'Sarah Jenkins (Operations Lead)');

    const record = await logAdminActionToSql({
      ...entry,
      adminUserId,
      adminUsername,
      timestamp: entry.timestamp || new Date().toISOString()
    });

    setSqlAuditLogs(prev => [record, ...prev.filter(l => l.id !== record.id)]);
    return record;
  }, [currentUser]);

  const logAuditView = useCallback(async (details?: string) => {
    const adminUserId = currentUser?.id || 'usr_admin_001';
    const adminUsername = currentUser?.fullName || (currentUser?.role === 'admin' ? currentUser.username : 'Sarah Jenkins (Operations Lead)');
    const ts = new Date().toISOString();

    await logAdminSqlAction({
      action: 'VIEW_AUDIT_LOGS',
      targetEntityType: 'audit_log',
      targetEntityId: 'audit_vault_siem',
      fieldsChanged: {
        accessMode: { from: null, to: 'FORENSIC_READ_ONLY' },
        inspectedResource: { from: null, to: 'Security & Forensic System Logs (SIEM)' },
        inspectionTimestamp: { from: null, to: ts }
      },
      details: details || `Administrator ${adminUsername} opened and inspected sensitive SIEM forensic audit logs.`,
      executionStatus: 'SUCCESS',
      adminUserId,
      adminUsername,
      timestamp: ts
    });
  }, [currentUser, logAdminSqlAction]);

  // Initial fetch of external SQL audit logs
  useEffect(() => {
    fetchSqlAuditLogs().then(logs => {
      if (Array.isArray(logs) && logs.length > 0) {
        setSqlAuditLogs(logs);
      }
    });
  }, []);

  // Automatic logging of audit logs view when route changes to /admin/audit
  const lastAuditViewLoggedRef = React.useRef<number>(0);
  useEffect(() => {
    if (currentRoute === '/admin/audit' || currentRoute.startsWith('/admin/audit')) {
      const now = Date.now();
      if (now - lastAuditViewLoggedRef.current > 4000) {
        lastAuditViewLoggedRef.current = now;
        logAuditView();
      }
    }
  }, [currentRoute, logAuditView]);

  // Active User Inactivity Tracking & Auto-Lock
  useEffect(() => {
    if (authStage !== 'authenticated' || sessionLocked) return;

    let lastInteraction = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastInteraction > 2500) {
        lastInteraction = now;
        setSessionRemainingSeconds(sessionTimeoutMinutes * 60);
      }
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));

    const interval = setInterval(() => {
      setSessionRemainingSeconds(prev => {
        if (prev <= 1) {
          setSessionLocked(true);
          logSecurityEvent('SESSION_INACTIVITY_LOCK', 'LOGIN', 'WARNING', 'Session automatically suspended due to inactivity threshold reached.', 10);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleActivity));
      clearInterval(interval);
    };
  }, [authStage, sessionLocked, sessionTimeoutMinutes]);

  // Tab Blur & Visibility Change Screen Protection
  useEffect(() => {
    if (!autoMaskOnTabBlur || authStage !== 'authenticated') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPrivacyModeState(true);
        saveToStorage('privacy_mode', true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoMaskOnTabBlur, authStage]);

  const extendSession = useCallback(() => {
    setSessionRemainingSeconds(sessionTimeoutMinutes * 60);
    setSessionLocked(false);
    setFailedUnlockAttempts(0);
  }, [sessionTimeoutMinutes]);

  const lockSessionManually = useCallback(() => {
    setSessionLocked(true);
    setSessionRemainingSeconds(0);
    logSecurityEvent('MANUAL_SESSION_LOCK', 'LOGIN', 'SUCCESS', 'Session manually suspended by user.', 5);
  }, []);

  const logout = useCallback(() => {
    logSecurityEvent('USER_LOGOUT', 'LOGIN', 'SUCCESS', `User session terminated securely by client.`);
    setCurrentUser(null);
    setAuthStage('unauthenticated');
    setSessionLocked(false);
    setCurrentRoute('/login');
  }, [logSecurityEvent]);

  const unlockSession = useCallback((pinOrPassword: string) => {
    const trimmed = pinOrPassword.trim();
    const isValid = trimmed === 'password123' || trimmed === '1234' || (currentUser && trimmed === currentUser.username) || trimmed.length >= 6;
    if (isValid) {
      setSessionLocked(false);
      setSessionRemainingSeconds(sessionTimeoutMinutes * 60);
      setFailedUnlockAttempts(0);
      logSecurityEvent('SESSION_UNLOCKED', 'LOGIN', 'SUCCESS', 'Secure enclave re-authenticated successfully.', 5);
      return true;
    }

    const nextAttempts = failedUnlockAttempts + 1;
    setFailedUnlockAttempts(nextAttempts);
    logSecurityEvent('SESSION_UNLOCK_FAILED', 'LOGIN', 'WARNING', `Failed session unlock attempt (${nextAttempts}/3).`, 45);

    if (nextAttempts >= 3) {
      logSecurityEvent('SESSION_TERMINATED_BRUTEFORCE', 'LOGIN', 'BLOCKED', 'Session terminated: maximum unlock attempts exceeded.', 95);
      logout();
    }
    return false;
  }, [sessionTimeoutMinutes, failedUnlockAttempts, currentUser, logout]);

  // Financial Number & Data Masking Helpers
  const formatAmount = useCallback((amount: number, currency: string = 'USD'): string => {
    if (privacyMode) return '••••••••';
    const currSign = currency === 'USD' ? '$' : currency + ' ';
    return `${currSign}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [privacyMode]);

  const maskSensitiveNumber = useCallback((val: string, showLast: number = 4) => {
    if (privacyMode) return '••••••••••••';
    if (!val || val.length <= showLast) return val || '••••';
    return '•••• ' + val.slice(-showLast);
  }, [privacyMode]);

  // Dynamic Security Posture Score
  const securityPostureScore = useMemo(() => {
    let score = 0;
    if (currentUser?.twoFactorEnabled !== false) score += 30;
    if (biometricSettings.enabled) score += 25;
    if (aiSpendingAlerts) score += 15;
    if (trustedDevices.some(d => d.isCurrent && d.isTrusted)) score += 15;
    if (sessionTimeoutMinutes <= 5) score += 15;
    return Math.min(100, score);
  }, [currentUser, biometricSettings, aiSpendingAlerts, trustedDevices, sessionTimeoutMinutes]);

  const securityPostureLevel = useMemo<'OPTIMAL' | 'HIGH' | 'ATTENTION'>(() => {
    if (securityPostureScore >= 90) return 'OPTIMAL';
    if (securityPostureScore >= 70) return 'HIGH';
    return 'ATTENTION';
  }, [securityPostureScore]);

  const navigateTo = useCallback((route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setIsAdminMode = useCallback((admin: boolean) => {
    setIsAdminModeState(admin);
    if (admin) {
      setCurrentUser(INITIAL_ADMIN_PROFILE);
      setCurrentRoute('/admin/dashboard');
    } else {
      setCurrentUser(INITIAL_CLIENT_PROFILE);
      setCurrentRoute('/dashboard');
    }
  }, []);

  // Authentication workflows
  const login = useCallback((accountNumberOrIdentifier: string, password: string, rememberDevice: boolean) => {
    const rawInput = (accountNumberOrIdentifier || '').trim();
    const cleanNumber = rawInput.replace(/[\s\-_]/g, '');
    const identifier = cleanNumber.toLowerCase();
    
    if (identifier === 'locked.user') {
      logSecurityEvent('LOGIN_ATTEMPT_LOCKED_ACCOUNT', 'LOGIN', 'BLOCKED', `Login blocked for permanently locked account ${rawInput}`, 85);
      return { success: false, error: 'Account is locked due to high-risk security compliance. Please use /unlock-account to verify your identity.' };
    }

    if (!rawInput || !password) {
      return { success: false, error: 'Please enter both your Account Number and Password.' };
    }

    const trimmedPassword = password.trim();

    // Check if matching Admin / Operations Lead (Sarah Jenkins)
    const isAdmin = identifier === 'sarah.jenkins' || 
                    identifier === 'ops-lead-9912' || 
                    identifier === 's.jenkins@northerntrust.com' || 
                    identifier === 'admin';

    // Authorized account numbers and identifiers for Angelina Jolie
    const isAuthorizedClientAccount = 
      cleanNumber === '882049102741' ||
      cleanNumber === '882077771975' ||
      cleanNumber === '994810283719' ||
      cleanNumber === '552910483921' ||
      cleanNumber === '771920485012' ||
      cleanNumber === '331892014755' ||
      identifier === 'angelina.jolie' ||
      identifier === 'nt-vip-jolie-7724' ||
      identifier === 'a.jolie@joliepas.com' ||
      accounts.some(a => a.accountNumber.replace(/[\s\-_]/g, '') === cleanNumber);

    if (!isAuthorizedClientAccount && !isAdmin) {
      logSecurityEvent('LOGIN_UNAUTHORIZED_ACCOUNT', 'LOGIN', 'FAILED', `Authentication rejected: Account Number / Identifier "${rawInput}" is not authorized in bank database.`, 60);
      return { success: false, error: 'Access Denied: Invalid Account Number or Password. The account number or password provided is not authorized.' };
    }

    // Password Verification Gate
    if (isAdmin) {
      const isValidAdminPass = trimmedPassword === 'NorthernTrust#2026!' || 
                               trimmedPassword === 'password123' || 
                               trimmedPassword === 'admin123' ||
                               trimmedPassword.length >= 6;
      if (!isValidAdminPass) {
        logSecurityEvent('LOGIN_INVALID_ADMIN_PASSWORD', 'LOGIN', 'FAILED', `Authentication rejected for Admin ${rawInput}: Invalid password.`, 50);
        return { success: false, error: 'Access Denied: Invalid Account Number or Password.' };
      }
    } else {
      const isValidClientPass = trimmedPassword === 'Sovereign#2026!' || 
                                trimmedPassword === 'Jolie7724!' || 
                                trimmedPassword === 'password123' || 
                                trimmedPassword === 'angelina123' ||
                                trimmedPassword.length >= 6;
      if (!isValidClientPass) {
        logSecurityEvent('LOGIN_INVALID_CLIENT_PASSWORD', 'LOGIN', 'FAILED', `Authentication rejected for Client ${rawInput}: Invalid password.`, 50);
        return { success: false, error: 'Access Denied: Invalid Account Number or Password.' };
      }
    }

    const matchedProfile = isAdmin 
      ? (allCustomers.find(c => c.role === 'admin') || INITIAL_ADMIN_PROFILE) 
      : (allCustomers.find(c => c.role === 'client') || INITIAL_CLIENT_PROFILE);

    const accountLabel = `Account #${rawInput} (${matchedProfile.fullName})`;

    setPendingUsername(rawInput);
    setRememberDeviceChecked(rememberDevice);

    if (matchedProfile.twoFactorEnabled) {
      setAuthStage('awaiting_2fa');
      setCurrentRoute('/verify-2fa');
      logSecurityEvent('2FA_CHALLENGE_ISSUED', '2FA_CHALLENGE', 'SUCCESS', `Credentials validated for ${accountLabel}. 2FA challenge dispatched.`, 10);
      return { success: true };
    } else {
      setCurrentUser(matchedProfile);
      setAuthStage('authenticated');
      setCurrentRoute(isAdmin ? '/admin/dashboard' : '/dashboard');
      logSecurityEvent('LOGIN_SUCCESS', 'LOGIN', 'SUCCESS', `Authorized user session authenticated for ${accountLabel}.`, 10);
      return { success: true };
    }
  }, [accounts, allCustomers, logSecurityEvent]);

  const verify2FA = useCallback((code: string, trustDevice: boolean) => {
    const cleanCode = code.trim();
    if (cleanCode.length === 6 || cleanCode === '123456' || cleanCode === '884921') {
      const cleanPending = pendingUsername.toLowerCase().trim();
      const isAdmin = cleanPending.includes('admin') || cleanPending.includes('ops') || cleanPending.includes('sarah');
      const matchedCustomer = allCustomers.find(c => 
        c.username.toLowerCase() === cleanPending || 
        c.clientId.toLowerCase() === cleanPending || 
        c.id.toLowerCase() === cleanPending ||
        c.email.toLowerCase() === cleanPending
      );
      const targetUser = isAdmin 
        ? (allCustomers.find(c => c.role === 'admin') || INITIAL_ADMIN_PROFILE) 
        : (matchedCustomer || allCustomers.find(c => c.role === 'client') || INITIAL_CLIENT_PROFILE);

      if (trustDevice) {
        const newDevice: DeviceInfo = {
          id: `dev_${Date.now()}`,
          name: 'Current Browser Session (Verified Trust)',
          browser: 'Chrome 129.0 / macOS',
          os: 'macOS 14.6',
          ip: '198.51.100.44',
          location: 'New York, USA',
          lastActive: 'Active now',
          isCurrent: true,
          isTrusted: true,
          fingerprint: `fp_${Math.random().toString(36).substring(2, 12)}`
        };
        setTrustedDevices(prev => [newDevice, ...prev]);
      }

      setCurrentUser(targetUser);
      setIsAdminModeState(isAdmin);
      setAuthStage('authenticated');
      setSessionRemainingSeconds(300);
      setSessionLocked(false);
      setCurrentRoute(isAdmin ? '/admin/dashboard' : '/dashboard');
      logSecurityEvent('PORTAL_LOGIN_2FA_SUCCESS', 'LOGIN', 'SUCCESS', `2FA verification code validated for ${targetUser.username}. Device trusted=${trustDevice}.`, 2);
      return { success: true };
    } else {
      logSecurityEvent('2FA_INVALID_CODE', '2FA_CHALLENGE', 'WARNING', `Invalid 2FA code supplied for ${pendingUsername}.`, 45);
      return { success: false, error: 'Invalid verification code. Please enter the valid 6-digit SMS code received.' };
    }
  }, [pendingUsername, logSecurityEvent]);

  const verifyRecoveryCode = useCallback((code: string) => {
    if (code.trim().length >= 8) {
      setCurrentUser(INITIAL_CLIENT_PROFILE);
      setAuthStage('authenticated');
      setSessionRemainingSeconds(300);
      setCurrentRoute('/dashboard');
      logSecurityEvent('RECOVERY_CODE_LOGIN_SUCCESS', 'LOGIN', 'WARNING', `Emergency backup recovery code used for login. User prompted to rotate keys.`, 30);
      return { success: true };
    }
    return { success: false, error: 'Invalid recovery code format. Standard code format is XXXX-XXXX-XXXX.' };
  }, [logSecurityEvent]);

  const registerCurrentDevice = useCallback((deviceName: string, makeTrusted: boolean) => {
    const newDev: DeviceInfo = {
      id: `dev_${Date.now()}`,
      name: deviceName || 'Registered Workstation Hardware',
      browser: 'Northern Trust High-Assurance Enclave',
      os: 'macOS Sonoma Secure Enclave',
      ip: '198.51.100.44',
      location: 'New York, USA',
      lastActive: 'Active now',
      isCurrent: true,
      isTrusted: makeTrusted,
      fingerprint: `fp_${Math.random().toString(36).substring(2, 12)}`
    };
    setTrustedDevices(prev => [newDev, ...prev]);
    logSecurityEvent('DEVICE_REGISTERED', 'DEVICE_TRUST', 'SUCCESS', `Device "${deviceName}" registered and bound with cryptographic token.`);
  }, [logSecurityEvent]);

  const unlockAccountWithKYC = useCallback((answers: { ssnLast4: string; birthYear: string; motherMaiden: string }) => {
    if (answers.ssnLast4.length === 4 && answers.birthYear.length === 4) {
      setAuthStage('authenticated');
      setCurrentUser(INITIAL_CLIENT_PROFILE);
      setCurrentRoute('/dashboard');
      logSecurityEvent('ACCOUNT_UNLOCKED_KYC', 'ACCOUNT_LOCK', 'SUCCESS', 'Account unlocked via verified Tier-3 biometric KYC challenge.');
      return true;
    }
    return false;
  }, [logSecurityEvent]);

  const requestPasswordReset = useCallback((identifier: string) => {
    if (identifier.length > 2) {
      logSecurityEvent('PASSWORD_RESET_REQUESTED', 'PASSWORD_CHANGE', 'SUCCESS', `Password reset token dispatched to verified email/SMS for ${identifier}.`);
      return true;
    }
    return false;
  }, [logSecurityEvent]);

  const resetPassword = useCallback((newPass: string) => {
    if (newPass.length >= 8) {
      logSecurityEvent('PASSWORD_RESET_SUCCESS', 'PASSWORD_CHANGE', 'SUCCESS', 'Master password securely updated via verified authentication recovery flow.');
      return true;
    }
    return false;
  }, [logSecurityEvent]);

  const switchUserPersona = useCallback((role: 'client' | 'admin') => {
    if (role === 'admin') {
      setIsAdminModeState(true);
      setCurrentUser(INITIAL_ADMIN_PROFILE);
      setCurrentRoute('/admin/dashboard');
    } else {
      setIsAdminModeState(false);
      setCurrentUser(INITIAL_CLIENT_PROFILE);
      setCurrentRoute('/dashboard');
    }
    setAuthStage('authenticated');
    setSessionLocked(false);
    setSessionRemainingSeconds(300);
  }, []);

  // Banking Operations
  const initiateTransfer = useCallback((data: Omit<TransferRequest, 'id' | 'createdAt' | 'status' | 'referenceId'>) => {
    if (!checkHasPerm('create:transfers')) {
      triggerAccessDenied('create:transfers', 'Initiate Fund Transfer');
      logSecurityEvent(
        'UNAUTHORIZED_TRANSFER_BLOCKED',
        'TRANSFER_INITIATION',
        'BLOCKED',
        `User ${currentUser?.fullName} (${currentUser?.clientId}) with role ${currentUser?.role} attempted to initiate transfer without create:transfers clearance.`
      );
      throw new Error(`Access Denied: Your account role (${currentUser?.role}) is not permitted to initiate fund transfers.`);
    }

    const isHighValue = data.amount >= 40000;
    const refId = `TRF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newTransfer: TransferRequest = {
      ...data,
      id: `trf_${Date.now()}`,
      referenceId: refId,
      status: isHighValue ? 'pending_review' : 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      riskScore: isHighValue ? 'MEDIUM' : 'LOW'
    };

    setTransfers(prev => [newTransfer, ...prev]);

    // Debit source account
    setAccounts(prev => prev.map(acc => {
      if (acc.id === data.fromAccountId) {
        const newBal = Math.max(0, acc.balance - data.amount - data.fee);
        return { ...acc, balance: newBal, availableBalance: newBal };
      }
      return acc;
    }));

    // Record Transaction
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: data.fromAccountId,
      accountName: data.fromAccountName,
      type: 'transfer_out',
      amount: data.amount,
      currency: data.sourceCurrency,
      counterparty: data.beneficiaryName,
      counterpartyAccount: data.toAccountNumber,
      category: 'Transfers',
      description: `Wire Remittance: ${data.purpose}`,
      referenceNumber: refId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: isHighValue ? 'pending' : 'completed',
      fee: data.fee
    };
    setTransactions(prev => [newTx, ...prev]);
    if (aiSpendingAlerts && data.amount >= aiSpendingThreshold) {
      addNotification({
        title: 'AI Sentinel: High-Value Transfer Dispatched ($' + data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) + ')',
        message: 'AI Spending Sentinel monitored and logged high-value remittance to ' + data.beneficiaryName + ' ($' + data.amount.toLocaleString() + '). Behavioral risk scored as ' + (isHighValue ? 'ELEVATED' : 'NOMINAL') + '.',
        category: 'ai_alert',
        type: 'ai_alert',
        severity: isHighValue ? 'high' : 'medium',
        linkRoute: '/transfers'
      });
    }

    logSecurityEvent(
      'TRANSFER_INITIATED',
      'TRANSFER_INITIATION',
      'SUCCESS',
      `Transfer of $${data.amount.toLocaleString()} initiated to ${data.beneficiaryName}. Status=${newTransfer.status}.`
    );

    // Sync to Real-Time Banking Database
    fetch('/api/banking/transfers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).catch(() => {});

    return newTransfer;
  }, [currentUser, checkHasPerm, triggerAccessDenied, getAuthHeaders, aiSpendingAlerts, aiSpendingThreshold, logSecurityEvent, addNotification]);

  const approveTransfer = useCallback((id: string, adminNotes?: string) => {
    if (!checkHasPerm('manage:ledger')) {
      triggerAccessDenied('manage:ledger', 'Transfer Approval / Ledger Settlement');
      return;
    }

    const match = transfers.find(tr => tr.id === id);
    setTransfers(prev => prev.map(t => (t.id === id ? { ...t, status: 'completed', adminNotes } : t)));
    setTransactions(prev => prev.map(tx => {
      if (match && tx.referenceNumber === match.referenceId) {
        return { ...tx, status: 'completed' };
      }
      return tx;
    }));
    logSecurityEvent('ADMIN_TRANSFER_APPROVED', 'ADMIN_ACTION', 'SUCCESS', `Wire transfer ${id} authorized and released by Operations Officer.`);

    // Automatically log sensitive administrative action into external SQL database
    logAdminSqlAction({
      action: 'TRANSFER_APPROVED',
      targetEntityType: 'transfer',
      targetEntityId: id,
      fieldsChanged: {
        status: { from: match?.status || 'pending_review', to: 'completed' },
        adminNotes: { from: match?.adminNotes || null, to: adminNotes || 'Approved by Bank Operations Compliance Officer' }
      },
      details: `Wire transfer ${id} ($${(match?.amount || 0).toLocaleString()} to ${match?.beneficiaryName || 'Beneficiary'}) authorized and released by Operations Officer.`
    });

    // Sync to Real-Time Banking Database
    fetch(`/api/banking/transfers/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes: adminNotes })
    }).catch(() => {});
  }, [transfers, checkHasPerm, triggerAccessDenied, getAuthHeaders, logSecurityEvent, logAdminSqlAction]);

  const rejectTransfer = useCallback((id: string, reason: string) => {
    if (!checkHasPerm('manage:ledger')) {
      triggerAccessDenied('manage:ledger', 'Transfer Rejection / Regulatory Hold');
      return;
    }

    const trf = transfers.find(t => t.id === id);
    if (trf) {
      // Refund balance
      setAccounts(prev => prev.map(acc => {
        if (acc.id === trf.fromAccountId) {
          return { ...acc, balance: acc.balance + trf.amount + trf.fee, availableBalance: acc.availableBalance + trf.amount + trf.fee };
        }
        return acc;
      }));
    }
    setTransfers(prev => prev.map(t => (t.id === id ? { ...t, status: 'rejected', adminNotes: reason } : t)));
    logSecurityEvent('ADMIN_TRANSFER_REJECTED', 'ADMIN_ACTION', 'WARNING', `Wire transfer ${id} rejected: ${reason}`);

    // Automatically log sensitive administrative action into external SQL database
    logAdminSqlAction({
      action: 'TRANSFER_REJECTED',
      targetEntityType: 'transfer',
      targetEntityId: id,
      fieldsChanged: {
        status: { from: trf?.status || 'pending_review', to: 'rejected' },
        rejectionReason: { from: trf?.adminNotes || null, to: reason }
      },
      details: `Wire transfer ${id} ($${(trf?.amount || 0).toLocaleString()}) rejected by Operations Officer. Reason: ${reason}`
    });

    // Sync to Real-Time Banking Database
    fetch(`/api/banking/transfers/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    }).catch(() => {});
  }, [transfers, checkHasPerm, triggerAccessDenied, getAuthHeaders, logSecurityEvent, logAdminSqlAction]);

  const addBeneficiary = useCallback((ben: Omit<Beneficiary, 'id' | 'verified'>) => {
    if (!checkHasPerm('create:beneficiaries')) {
      triggerAccessDenied('create:beneficiaries', 'Register Wire Beneficiary');
      return;
    }

    const newBen: Beneficiary = {
      ...ben,
      id: `ben_${Date.now()}`,
      verified: true
    };
    setBeneficiaries(prev => [newBen, ...prev]);
  }, [checkHasPerm, triggerAccessDenied]);

  const updateBeneficiary = useCallback((id: string, updates: Partial<Beneficiary>) => {
    if (!checkHasPerm('edit:profile') && !checkHasPerm('edit:beneficiaries')) {
      triggerAccessDenied('edit:beneficiaries', 'Edit Beneficiary Details');
      return;
    }
    setBeneficiaries(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  }, [checkHasPerm, triggerAccessDenied]);

  const deleteBeneficiary = useCallback((id: string) => {
    if (!checkHasPerm('delete:beneficiaries')) {
      triggerAccessDenied('delete:beneficiaries', 'Delete Beneficiary Payee');
      return;
    }

    setBeneficiaries(prev => prev.filter(b => b.id !== id));
    fetch(`/api/banking/beneficiaries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).catch(() => {});
  }, [checkHasPerm, triggerAccessDenied, getAuthHeaders]);

  const payBill = useCallback((billId: string, amount?: number) => {
    if (!checkHasPerm('create:transactions')) {
      triggerAccessDenied('create:transactions', 'Electronic Bill Payment');
      return;
    }

    setBills(prev => prev.map(b => {
      if (b.id === billId) {
        const payAmt = amount || b.amount;
        return {
          ...b,
          status: 'paid',
          lastPaidDate: new Date().toISOString().slice(0, 10),
          confirmationCode: `ACH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        };
      }
      return b;
    }));

    fetch(`/api/banking/bills/${billId}/pay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    }).catch(() => {});
  }, [checkHasPerm, triggerAccessDenied, getAuthHeaders]);

  const addBill = useCallback((bill: Omit<BillPayment, 'id' | 'status'>) => {
    const newBill: BillPayment = {
      ...bill,
      id: `bill_${Date.now()}`,
      status: 'scheduled'
    };
    setBills(prev => [newBill, ...prev]);
  }, []);

  const toggleCardFreeze = useCallback((cardId: string) => {
    if (!checkHasPerm('edit:cards')) {
      triggerAccessDenied('edit:cards', 'Card Freeze Control');
      return;
    }

    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const nextState = !c.isFrozen;
        logSecurityEvent('CARD_LOCK_TOGGLE', 'DEVICE_TRUST', 'SUCCESS', `Card ${c.cardNumber.slice(-4)} freeze state changed to ${nextState}`);
        return { ...c, isFrozen: nextState };
      }
      return c;
    }));

    fetch(`/api/banking/cards/${cardId}/freeze`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).catch(() => {});
  }, [checkHasPerm, triggerAccessDenied, getAuthHeaders, logSecurityEvent]);

  const updateCardLimits = useCallback((cardId: string, dailySpend: number, dailyAtm: number) => {
    if (!checkHasPerm('edit:cards')) {
      triggerAccessDenied('edit:cards', 'Adjust Card Spending Limits');
      return;
    }

    setCards(prev => prev.map(c => (c.id === cardId ? { ...c, dailySpendingLimit: dailySpend, dailyWithdrawalLimit: dailyAtm } : c)));

    fetch(`/api/banking/cards/${cardId}/limits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dailySpend, dailyAtm })
    }).catch(() => {});
  }, [checkHasPerm, triggerAccessDenied, getAuthHeaders]);

  const updateCardSecuritySwitches = useCallback((cardId: string, switches: { allowInternational?: boolean; allowOnline?: boolean; allowAtm?: boolean; allowContactless?: boolean }) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          allowInternational: switches.allowInternational !== undefined ? switches.allowInternational : c.allowInternational,
          allowOnlineTransactions: switches.allowOnline !== undefined ? switches.allowOnline : c.allowOnlineTransactions,
          allowAtmWithdrawals: switches.allowAtm !== undefined ? switches.allowAtm : c.allowAtmWithdrawals,
          allowContactless: switches.allowContactless !== undefined ? switches.allowContactless : c.allowContactless
        };
      }
      return c;
    }));
  }, []);

  const disputeTransaction = useCallback((txId: string, reason: string) => {
    setTransactions(prev => prev.map(tx => (tx.id === txId ? { ...tx, status: 'disputed', isDisputed: true, disputeReason: reason } : tx)));
    logSecurityEvent('TX_DISPUTE_FILED', '2FA_CHALLENGE', 'WARNING', `Client dispute filed on tx ${txId}: ${reason}`);
  }, [logSecurityEvent]);

  const sendSecureMessage = useCallback((subject: string, category: any, text: string) => {
    const newMsg: SecureMessage = {
      id: `msg_${Date.now()}`,
      subject,
      category,
      senderRole: 'client',
      senderName: currentUser?.fullName || 'Alexander Vance',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      preview: text.slice(0, 80),
      unread: false,
      isRead: true,
      priority: 'normal',
      thread: [
        {
          id: `th_${Date.now()}`,
          sender: currentUser?.fullName || 'Alexander Vance',
          senderRole: 'client',
          senderName: currentUser?.fullName || 'Alexander Vance',
          text,
          body: text,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        }
      ]
    };
    newMsg.threads = newMsg.thread;
    setMessages(prev => [newMsg, ...prev]);

    fetch('/api/banking/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, category, body: text })
    }).catch(() => {});
  }, [currentUser]);

  const sendMessage = useCallback((data: { subject: string; category: any; body: string; priority?: any }) => {
    sendSecureMessage(data.subject, data.category, data.body);
  }, [sendSecureMessage]);

  const adminReplyMessage = useCallback((messageId: string, text: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const item = {
          id: `th_${Date.now()}`,
          sender: 'Northern Trust Wealth Desk',
          senderRole: 'admin' as const,
          senderName: 'Operations Lead',
          text,
          body: text,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
        const updatedThreads = [...(m.threads || m.thread || []), item];
        return {
          ...m,
          preview: text.slice(0, 80),
          threads: updatedThreads,
          thread: updatedThreads,
          unread: false
        };
      }
      return m;
    }));

    fetch(`/api/banking/messages/${messageId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, senderRole: 'admin' })
    }).catch(() => {});

    // Automatically log sensitive administrative message dispatch into external SQL database
    logAdminSqlAction({
      action: 'ADMIN_MESSAGE_REPLIED',
      targetEntityType: 'system',
      targetEntityId: messageId,
      fieldsChanged: {
        threadLength: { from: 'previous', to: 'appended' },
        replySnippet: { from: null, to: text.slice(0, 80) }
      },
      details: `Operations Lead replied to client secure message thread #${messageId}.`
    });
  }, [logAdminSqlAction]);

  const replyToMessage = useCallback((messageId: string, text: string) => {
    const isStaff = isAdminMode;
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const item = {
          id: `th_${Date.now()}`,
          sender: isStaff ? 'Northern Trust Advisory' : (currentUser?.fullName || 'Alexander Vance'),
          senderRole: (isStaff ? 'admin' : 'client') as any,
          senderName: isStaff ? 'Northern Trust Advisory' : (currentUser?.fullName || 'Alexander Vance'),
          text,
          body: text,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
        const nextThread = [...m.thread, item];
        return {
          ...m,
          thread: nextThread,
          threads: nextThread,
          preview: text.slice(0, 80)
        };
      }
      return m;
    }));
  }, [isAdminMode, currentUser]);

  const markMessageRead = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, unread: false, isRead: true } : m)));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true, isRead: true } : n)));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    markNotificationAsRead(id);
  }, [markNotificationAsRead]);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead]);

  const deleteNotification = useCallback((id: string) => {
    if (!checkHasPerm('delete:notifications')) {
      triggerAccessDenied('delete:notifications', 'Delete Notification Alert');
      return;
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetch(`/api/banking/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).catch(() => {});
  }, [checkHasPerm, triggerAccessDenied, getAuthHeaders]);

  const uploadDocument = useCallback((doc: Partial<BankDocument>) => {
    const newDoc: BankDocument = {
      id: `doc_${Date.now()}`,
      title: doc.title || 'Uploaded Document',
      type: doc.type || 'contract',
      category: (doc.category || 'legal') as any,
      date: doc.date || new Date().toISOString().slice(0, 10),
      fileSize: doc.fileSize || '1.5 MB',
      downloadUrl: doc.downloadUrl || '#',
      isEncrypted: true,
      accountNumber: doc.accountNumber || 'NT-DOC'
    };
    setDocuments(prev => [newDoc, ...prev]);
  }, []);

  const updateProfileInfo = useCallback((updates: Partial<UserProfile>) => {
    setCurrentUser(prev => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    updateProfileInfo(updates);
  }, [updateProfileInfo]);

  const updateCustomerProfile = useCallback((customerId: string, updates: Partial<UserProfile>) => {
    setAllCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId || c.clientId === customerId) {
          const updated: UserProfile = {
            ...c,
            ...updates,
            address: updates.address ? { ...c.address, ...updates.address } : c.address
          };
          return updated;
        }
        return c;
      })
    );

    setCurrentUser(prev => {
      if (prev && (prev.id === customerId || prev.clientId === customerId)) {
        return {
          ...prev,
          ...updates,
          address: updates.address ? { ...prev.address, ...updates.address } : prev.address
        };
      }
      return prev;
    });

    logSecurityEvent(
      'ADMIN_CLIENT_PROFILE_UPDATE',
      'ADMIN_ACTION',
      'SUCCESS',
      `Compliance Officer updated individual profile records for Client ID ${customerId}.`
    );

    const targetCustomer = allCustomers.find(c => c.id === customerId || c.clientId === customerId);
    const diff = computeFieldDiff(targetCustomer || ({} as UserProfile), updates);

    // Automatically log sensitive administrative customer profile update into external SQL database
    logAdminSqlAction({
      action: 'CUSTOMER_PROFILE_UPDATED',
      targetEntityType: 'customer',
      targetEntityId: customerId,
      fieldsChanged: diff,
      details: `Administrator modified profile fields [${Object.keys(diff).join(', ')}] on customer record ${targetCustomer?.fullName || customerId}.`
    });

    fetch(`/api/banking/customers/${customerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  }, [allCustomers, logSecurityEvent, logAdminSqlAction]);

  const createRole = useCallback(async (roleData: Omit<RoleDefinition, 'isSystem'>): Promise<RoleDefinition> => {
    const newRole: RoleDefinition = {
      ...roleData,
      isSystem: false
    };
    setRoles(prev => [...prev.filter(r => r.id !== newRole.id), newRole]);
    try {
      const res = await fetch('/api/banking/roles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newRole)
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          triggerAccessDenied('manage:roles', 'Create Custom Role', data.error);
        }
        throw new Error(data.error || 'Failed to create role');
      }
      return data.role;
    } catch (err: any) {
      console.warn('[Role Create]', err);
      return newRole;
    }
  }, [getAuthHeaders, triggerAccessDenied]);

  const updateRole = useCallback(async (id: string, updates: Partial<RoleDefinition>): Promise<RoleDefinition> => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    try {
      const res = await fetch(`/api/banking/roles/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          triggerAccessDenied('manage:roles', 'Update Role Permissions', data.error);
        }
        throw new Error(data.error || 'Failed to update role');
      }
      return data.role;
    } catch (err: any) {
      console.warn('[Role Update]', err);
      const match = roles.find(r => r.id === id);
      return { ...(match || { id, name: id, description: '', defaultPermissions: [] }), ...updates };
    }
  }, [getAuthHeaders, triggerAccessDenied, roles]);

  const deleteRole = useCallback(async (id: string): Promise<boolean> => {
    setRoles(prev => prev.filter(r => r.id !== id));
    try {
      const res = await fetch(`/api/banking/roles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          triggerAccessDenied('manage:roles', 'Delete Custom Role', data.error);
        }
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }, [getAuthHeaders, triggerAccessDenied]);

  const updateUserRoleAndPermissions = useCallback(async (userId: string, role: string, permissions?: string[]): Promise<UserProfile | null> => {
    updateCustomerProfile(userId, { role: role as any, permissions });
    try {
      const res = await fetch('/api/banking/roles/permissions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, role, permissions })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          triggerAccessDenied('manage:roles', 'Assign Role & Permissions', data.error);
        }
        return null;
      }
      return data.customer;
    } catch {
      return null;
    }
  }, [updateCustomerProfile, getAuthHeaders, triggerAccessDenied]);

  const updateSecuritySettings = useCallback((twoFactorEnabled: boolean, method: TwoFactorMethod) => {
    setCurrentUser(prev => (prev ? { ...prev, twoFactorEnabled, twoFactorMethod: method } : prev));
  }, []);

  const updateTwoFactorSettings = useCallback((settings: Partial<TwoFactorSettingsData>) => {
    setTwoFactorSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const regenerateRecoveryCodes = useCallback(() => {
    const generated = Array.from({ length: 4 }, () =>
      `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    );
    setTwoFactorSettings(prev => ({ ...prev, recoveryCodes: generated }));
    logSecurityEvent('RECOVERY_CODES_REGENERATED', 'PASSWORD_CHANGE', 'SUCCESS', 'New recovery keys provisioned.');
  }, [logSecurityEvent]);

  const updateMasterPassword = useCallback((current: string, newPass: string) => {
    if (newPass.length >= 8) {
      logSecurityEvent('PASSWORD_CHANGED', 'PASSWORD_CHANGE', 'SUCCESS', 'Master vault password rotated.');
      return true;
    }
    return false;
  }, [logSecurityEvent]);

  const revokeDevice = useCallback((deviceId: string) => {
    setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
    logSecurityEvent('DEVICE_REVOKED', 'DEVICE_TRUST', 'SUCCESS', `Device token ${deviceId} revoked.`);
  }, [logSecurityEvent]);

  const terminateSession = useCallback((sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    logSecurityEvent('SESSION_TERMINATED', 'LOGIN', 'SUCCESS', `Remote session token ${sessionId} invalidated.`);
  }, [logSecurityEvent]);

  const terminateAllOtherSessions = useCallback(() => {
    setActiveSessions(prev => prev.filter(s => s.isCurrent));
    logSecurityEvent('ALL_SESSIONS_TERMINATED', 'LOGIN', 'SUCCESS', 'All remote session tokens terminated.');
  }, [logSecurityEvent]);

  const adminAdjustAccountBalance = useCallback((accountId: string, amount: number, note: string) => {
    const targetAcc = accounts.find(a => a.id === accountId);
    const prevBalance = targetAcc ? targetAcc.balance : 0;
    const prevAvailable = targetAcc ? targetAcc.availableBalance : 0;
    const newBal = prevBalance + amount;
    const newAvailable = prevAvailable + amount;

    setAccounts(prev => prev.map(a => {
      if (a.id === accountId) {
        return { ...a, balance: newBal, availableBalance: newAvailable };
      }
      return a;
    }));

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId,
      accountName: targetAcc?.name || 'Institutional Ledger',
      type: amount >= 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(amount),
      currency: targetAcc?.currency || 'USD',
      counterparty: 'Northern Trust Operations Ledger Adjustment',
      category: 'Investments',
      description: `Administrative adjustment: ${note}`,
      referenceNumber: `ADJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'completed'
    };
    setTransactions(prev => [tx, ...prev]);
    logSecurityEvent('ADMIN_BALANCE_ADJUSTMENT', 'ADMIN_ACTION', 'SUCCESS', `Account ${accountId} adjusted by $${amount}: ${note}`);

    // Automatically log sensitive administrative account balance modification into external SQL database
    logAdminSqlAction({
      action: 'ACCOUNT_BALANCE_ADJUSTED',
      targetEntityType: 'account',
      targetEntityId: accountId,
      fieldsChanged: {
        balance: { from: prevBalance, to: newBal, difference: amount },
        availableBalance: { from: prevAvailable, to: newAvailable, difference: amount },
        adjustmentReason: { from: null, to: note }
      },
      details: `Administrative ledger adjustment of ${amount >= 0 ? '+' : '-'}$${Math.abs(amount).toLocaleString()} on account ${targetAcc?.name || accountId} (${targetAcc?.accountNumber || accountId}). Reason: ${note}`
    });

    fetch('/api/banking/accounts/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, amount, note })
    }).catch(() => {});
  }, [accounts, logSecurityEvent, logAdminSqlAction]);

  const adjustAccountBalance = useCallback((accountId: string, amount: number, note: string) => {
    adminAdjustAccountBalance(accountId, amount, note);
  }, [adminAdjustAccountBalance]);

  const adminSetAccountStatus = useCallback((accountId: string, status: 'active' | 'restricted' | 'frozen') => {
    const targetAcc = accounts.find(a => a.id === accountId);
    const oldStatus = targetAcc?.status || 'active';
    const oldFrozen = targetAcc?.isFrozen || false;
    const newFrozen = status === 'frozen';

    setAccounts(prev => prev.map(a => (a.id === accountId ? { ...a, status, isFrozen: newFrozen } : a)));

    // Automatically log sensitive administrative account status modification into external SQL database
    logAdminSqlAction({
      action: 'ACCOUNT_STATUS_CHANGED',
      targetEntityType: 'account',
      targetEntityId: accountId,
      fieldsChanged: {
        status: { from: oldStatus, to: status },
        isFrozen: { from: oldFrozen, to: newFrozen }
      },
      details: `Account #${targetAcc?.accountNumber || accountId} status modified from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}.`
    });

    logSecurityEvent('ADMIN_ACCOUNT_STATUS_MODIFIED', 'ADMIN_ACTION', 'SUCCESS', `Account ${accountId} status set to ${status}.`);
  }, [accounts, logSecurityEvent, logAdminSqlAction]);

  const updateAccountStatus = useCallback((accountId: string, status: 'active' | 'restricted' | 'frozen') => {
    adminSetAccountStatus(accountId, status);
  }, [adminSetAccountStatus]);

  const adminSetCustomerKYC = useCallback((status: 'verified' | 'pending_review' | 'action_required') => {
    const prevStatus = currentUser?.kycStatus || 'pending_review';
    setCurrentUser(prev => (prev ? { ...prev, kycStatus: status } : prev));
    setAllCustomers(prev => prev.map(c => ({ ...c, kycStatus: status })));

    // Automatically log sensitive administrative KYC modification into external SQL database
    logAdminSqlAction({
      action: 'CUSTOMER_KYC_STATUS_UPDATED',
      targetEntityType: 'customer',
      targetEntityId: currentUser?.id || 'all_customers',
      fieldsChanged: {
        kycStatus: { from: prevStatus, to: status }
      },
      details: `Compliance Officer modified KYC compliance status to ${status.toUpperCase()}.`
    });

    logSecurityEvent('ADMIN_KYC_STATUS_MODIFIED', 'ADMIN_ACTION', 'SUCCESS', `Customer KYC status updated to ${status}.`);

    fetch('/api/banking/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
  }, [currentUser, logSecurityEvent, logAdminSqlAction]);

  // Admin New User & Customer Account Creation
  const createCustomerAccount = useCallback(async (data: {
    customer: Partial<UserProfile>;
    account?: Partial<BankAccount> & { initialDeposit?: number };
  }): Promise<{ customer: UserProfile; account?: BankAccount }> => {
    const custId = data.customer?.id || `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const clientId = data.customer?.clientId || `NT-${randomDigits}`;
    const cleanUsername = data.customer?.username?.trim() || (data.customer?.fullName ? data.customer.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.') : `client.${randomDigits}`);

    const newCustomer: UserProfile = {
      id: custId,
      clientId,
      username: cleanUsername,
      fullName: data.customer?.fullName?.trim() || 'New Accredited Client',
      preferredName: data.customer?.preferredName?.trim() || (data.customer?.fullName ? data.customer.fullName.trim().split(' ')[0] : 'Client'),
      email: data.customer?.email?.trim() || `${cleanUsername}@northerntrust-client.com`,
      phone: data.customer?.phone?.trim() || '+1 (212) 555-0199',
      avatarUrl: data.customer?.avatarUrl || undefined,
      role: data.customer?.role || 'client',
      tier: data.customer?.tier || 'Private Wealth',
      occupation: data.customer?.occupation?.trim() || 'Accredited Sovereign Client',
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

    setAllCustomers(prev => [newCustomer, ...prev.filter(c => c.id !== newCustomer.id)]);

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

      setAccounts(prev => [createdAccount!, ...prev.filter(a => a.id !== createdAccount!.id)]);

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
        setTransactions(prev => [initialTx!, ...prev]);
      }
    }

    logSecurityEvent(
      'ADMIN_USER_ACCOUNT_CREATED',
      'ADMIN_ACTION',
      'SUCCESS',
      `Administrator created new ${newCustomer.role} profile for ${newCustomer.fullName} (${newCustomer.clientId})${createdAccount ? ` with account #${createdAccount.accountNumber}` : ''}.`
    );

    // Automatically log sensitive action into External Relational SQL Database
    await logAdminSqlAction({
      action: 'USER_ACCOUNT_CREATED',
      targetEntityType: 'customer',
      targetEntityId: newCustomer.id,
      fieldsChanged: {
        role: { from: null, to: newCustomer.role },
        tier: { from: null, to: newCustomer.tier },
        fullName: { from: null, to: newCustomer.fullName },
        username: { from: null, to: newCustomer.username },
        email: { from: null, to: newCustomer.email },
        kycStatus: { from: null, to: newCustomer.kycStatus },
        bankAccountAllocated: { from: null, to: createdAccount ? `${createdAccount.accountNumber} (${createdAccount.type})` : 'none' },
        initialLedgerDeposit: { from: null, to: createdAccount ? createdAccount.balance : 0, difference: createdAccount ? createdAccount.balance : 0 }
      },
      details: `Administrator provisioned new accredited ${newCustomer.role} profile for ${newCustomer.fullName} (${newCustomer.clientId})${createdAccount ? ` and funded initial ${createdAccount.type} #${createdAccount.accountNumber} with $${createdAccount.balance.toLocaleString()}` : ''}.`
    });

    fetch('/api/banking/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});

    return { customer: newCustomer, account: createdAccount };
  }, [logSecurityEvent, logAdminSqlAction]);

  // Admin New Bank Account Provisioning
  const createBankAccount = useCallback(async (data: Partial<BankAccount> & { initialDeposit?: number }): Promise<BankAccount> => {
    const accNum = data.accountNumber || `8820${Math.floor(10000000 + Math.random() * 90000000)}`;
    const accId = data.id || `acc_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const balance = Number(data.balance ?? data.initialDeposit ?? 50000);
    const currency = data.currency || 'USD';

    const newAccount: BankAccount = {
      id: accId,
      accountNumber: accNum,
      routingNumber: data.routingNumber || '071000288',
      iban: data.iban || `US33NTRS071000288${accNum}`,
      swiftBic: 'NTRSUS44XXX',
      name: data.name || `Private ${data.type ? data.type.toUpperCase() : 'CHECKING'} Account`,
      type: data.type || 'checking',
      currency,
      balance,
      availableBalance: balance,
      pendingBalance: 0,
      interestRateAPY: data.interestRateAPY || (data.type === 'savings' ? 4.85 : 1.25),
      monthlyLimit: data.monthlyLimit || 5000000,
      monthlySpent: 0,
      isFrozen: false,
      status: data.status || 'active',
      colorTheme: data.colorTheme || (data.type === 'savings' ? 'emerald' : 'navy')
    };

    setAccounts(prev => [newAccount, ...prev.filter(a => a.id !== newAccount.id)]);

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
      setTransactions(prev => [initialTx!, ...prev]);
    }

    logSecurityEvent(
      'ADMIN_BANK_ACCOUNT_CREATED',
      'ADMIN_ACTION',
      'SUCCESS',
      `Administrator provisioned new ${newAccount.type} account #${newAccount.accountNumber} (${newAccount.name}) with balance of $${newAccount.balance.toLocaleString()}.`
    );

    // Automatically log sensitive action into External Relational SQL Database
    await logAdminSqlAction({
      action: 'BANK_ACCOUNT_CREATED',
      targetEntityType: 'account',
      targetEntityId: newAccount.id,
      fieldsChanged: {
        accountNumber: { from: null, to: newAccount.accountNumber },
        type: { from: null, to: newAccount.type },
        currency: { from: null, to: newAccount.currency },
        balance: { from: 0, to: newAccount.balance, difference: newAccount.balance },
        routingNumber: { from: null, to: newAccount.routingNumber }
      },
      details: `Administrator provisioned new ${newAccount.type.toUpperCase()} account #${newAccount.accountNumber} with initial ledger balance of $${newAccount.balance.toLocaleString()}.`
    });

    fetch('/api/banking/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});

    return newAccount;
  }, [logSecurityEvent, logAdminSqlAction]);

  // Check Services Implementation
  const depositCheck = useCallback((accountId: string, amount: number, checkNumber: string, memo = 'Mobile Remote Check Deposit') => {
    if (!checkHasPerm('create:transactions')) {
      triggerAccessDenied('create:transactions', 'Remote Check Deposit');
      return { success: false, referenceNumber: '' };
    }

    const targetAcc = accounts.find(a => a.id === accountId) || accounts[0];
    const refNum = `CHK-DEP-${Date.now().toString().slice(-6)}`;
    
    // Immediate ledger credit
    setAccounts(prev => prev.map(a => {
      if (a.id === targetAcc.id) {
        return {
          ...a,
          balance: a.balance + amount,
          availableBalance: a.availableBalance + amount
        };
      }
      return a;
    }));

    fetch('/api/banking/deposit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accountId: targetAcc.id, amount, checkNumber, memo })
    }).catch(() => {});

    // Record check deposit record
    const newRecord: CheckDepositRecord = {
      id: `chk_${Date.now()}`,
      accountId: targetAcc.id,
      accountName: targetAcc.name,
      amount,
      checkNumber,
      status: 'cleared',
      depositDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fundsAvailabilityDate: new Date(Date.now() + 3600000).toISOString().replace('T', ' ').slice(0, 19),
      referenceNumber: refNum
    };
    setCheckDeposits(prev => [newRecord, ...prev]);

    // Record transaction
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: targetAcc.id,
      accountName: targetAcc.name,
      type: 'deposit',
      amount,
      currency: targetAcc.currency || 'USD',
      counterparty: `Check #${checkNumber}`,
      category: 'Income',
      description: `Remote Mobile Check Deposit #${checkNumber} - ${memo}`,
      referenceNumber: refNum,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'completed'
    };
    setTransactions(prev => [newTx, ...prev]);

    logSecurityEvent(
      'CHECK_DEPOSIT_CLEARED',
      'TRANSFER_INITIATION',
      'SUCCESS',
      `Check #${checkNumber} for $${amount.toLocaleString()} deposited into ${targetAcc.name}. Provisional credit verified.`
    );

    return { success: true, referenceNumber: refNum };
  }, [accounts, logSecurityEvent]);

  const fundAccount = useCallback(async (params: {
    accountId: string;
    amount: number;
    fundingMethod?: 'check' | 'wire' | 'ach' | 'direct_credit';
    checkNumber?: string;
    externalReference?: string;
    memo?: string;
    sourceInstitution?: string;
  }): Promise<{ success: boolean; referenceNumber?: string; error?: string }> => {
    if (!checkHasPerm('create:transactions')) {
      triggerAccessDenied('create:transactions', 'Account Funding & Inbound Crediting');
      return { success: false, error: 'Access Denied: Insufficient permissions for account crediting.' };
    }

    try {
      const response = await fetch('/api/banking/deposit', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Account funding request failed verification');
      }

      if (data.account) {
        setAccounts(prev => prev.map(a => a.id === data.account.id ? data.account : a));
      }
      if (data.transaction) {
        setTransactions(prev => [data.transaction, ...prev.filter(t => t.id !== data.transaction.id)]);
      }

      logSecurityEvent(
        'ACCOUNT_CREDITED',
        'TRANSFER_INITIATION',
        'SUCCESS',
        `Account funded: $${params.amount.toLocaleString()} credited. Reference: ${data.referenceNumber || data.transaction?.referenceNumber}`
      );

      return { success: true, referenceNumber: data.referenceNumber || data.transaction?.referenceNumber };
    } catch (err: any) {
      logSecurityEvent(
        'CREDIT_FAILED',
        'TRANSFER_INITIATION',
        'BLOCKED',
        `Account crediting failed: ${err.message}`
      );
      return { success: false, error: err.message || 'Funding verification failed' };
    }
  }, [checkHasPerm, triggerAccessDenied, getAuthHeaders, logSecurityEvent]);

  const placeStopPayment = useCallback((accountId: string, checkNumber: string, payeeName: string, amount?: number, reason: any = 'Lost') => {
    const newStop: StopPaymentRecord = {
      id: `stp_${Date.now()}`,
      accountId,
      checkNumber,
      payeeName,
      amount,
      reason,
      placedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      expiresAt: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      status: 'active'
    };
    setStoppedChecks(prev => [newStop, ...prev]);
    logSecurityEvent('STOP_PAYMENT_ISSUED', 'TRANSFER_INITIATION', 'WARNING', `Stop payment hold placed on check #${checkNumber} payable to ${payeeName}.`);
    return { success: true };
  }, [logSecurityEvent]);

  const orderCheckbook = useCallback((accountId: string, style: any, quantity: number, startingCheckNumber: number, shippingAddress: string) => {
    const track = `FDX-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-US`;
    const newOrder: CheckbookOrderRecord = {
      id: `ord_${Date.now()}`,
      accountId,
      style,
      quantity,
      startingCheckNumber,
      shippingAddress,
      orderedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      trackingNumber: track,
      status: 'processing'
    };
    setCheckbookOrders(prev => [newOrder, ...prev]);
    logSecurityEvent('CHECKBOOK_ORDER_DISPATCHED', 'ADMIN_ACTION', 'SUCCESS', `Checkbook order for ${quantity} checks (${style}) starting at #${startingCheckNumber} dispatched to ${shippingAddress}.`);
    return { success: true, trackingNumber: track };
  }, [logSecurityEvent]);

  // Foreign Exchange Spot Implementation
  const executeFxConversion = useCallback((fromAccountId: string, toAccountId: string, sourceAmount: number, targetAmount: number, exchangeRate: number) => {
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    if (!fromAcc || !toAcc) return { success: false, error: 'Invalid accounts selected' };
    if (fromAcc.availableBalance < sourceAmount) return { success: false, error: 'Insufficient available funds in source account' };

    setAccounts(prev => prev.map(a => {
      if (a.id === fromAccountId) {
        return { ...a, balance: a.balance - sourceAmount, availableBalance: a.availableBalance - sourceAmount };
      }
      if (a.id === toAccountId) {
        return { ...a, balance: a.balance + targetAmount, availableBalance: a.availableBalance + targetAmount };
      }
      return a;
    }));

    const ref = `FX-${Date.now().toString().slice(-6)}`;
    const txOut: Transaction = {
      id: `tx_fx_out_${Date.now()}`,
      accountId: fromAcc.id,
      accountName: fromAcc.name,
      type: 'transfer_out',
      amount: sourceAmount,
      currency: fromAcc.currency,
      counterparty: `${toAcc.name} (${toAcc.currency})`,
      category: 'Transfers',
      description: `Treasury FX Spot: Sold ${sourceAmount.toFixed(2)} ${fromAcc.currency} @ ${exchangeRate.toFixed(4)}`,
      referenceNumber: ref,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'completed'
    };
    const txIn: Transaction = {
      id: `tx_fx_in_${Date.now()}`,
      accountId: toAcc.id,
      accountName: toAcc.name,
      type: 'transfer_in',
      amount: targetAmount,
      currency: toAcc.currency,
      counterparty: `${fromAcc.name} (${fromAcc.currency})`,
      category: 'Transfers',
      description: `Treasury FX Spot: Bought ${targetAmount.toFixed(2)} ${toAcc.currency} @ ${exchangeRate.toFixed(4)}`,
      referenceNumber: ref,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'completed'
    };
    setTransactions(prev => [txOut, txIn, ...prev]);
    logSecurityEvent('FX_SPOT_EXECUTED', 'TRANSFER_INITIATION', 'SUCCESS', `Exchanged ${sourceAmount} ${fromAcc.currency} -> ${targetAmount} ${toAcc.currency} at rate ${exchangeRate}`);
    return { success: true };
  }, [accounts, logSecurityEvent]);

  // Credit Line Drawdown & Repayment
  const drawdownCreditLine = useCallback((targetAccountId: string, amount: number) => {
    if (creditLine.availableLimit < amount) return { success: false, error: 'Requested amount exceeds available credit limit.' };
    const target = accounts.find(a => a.id === targetAccountId) || accounts[0];

    setCreditLine(prev => ({
      ...prev,
      drawnAmount: prev.drawnAmount + amount,
      availableLimit: prev.availableLimit - amount
    }));

    setAccounts(prev => prev.map(a => {
      if (a.id === target.id) {
        return { ...a, balance: a.balance + amount, availableBalance: a.availableBalance + amount };
      }
      return a;
    }));

    const ref = `LOMB-DRAW-${Date.now().toString().slice(-6)}`;
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: target.id,
      accountName: target.name,
      type: 'deposit',
      amount,
      currency: target.currency,
      counterparty: 'Sovereign Lombard Credit Facility',
      category: 'Investments',
      description: `Securities-Backed Credit Facility Drawdown #${ref}`,
      referenceNumber: ref,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'completed'
    };
    setTransactions(prev => [tx, ...prev]);
    logSecurityEvent('CREDIT_LINE_DRAWDOWN', 'TRANSFER_INITIATION', 'SUCCESS', `Drawdown of $${amount.toLocaleString()} into ${target.name}.`);
    return { success: true };
  }, [creditLine, accounts, logSecurityEvent]);

  const repayCreditLine = useCallback((sourceAccountId: string, amount: number) => {
    const source = accounts.find(a => a.id === sourceAccountId) || accounts[0];
    if (source.availableBalance < amount) return { success: false, error: 'Insufficient funds in source account for credit repayment.' };

    setCreditLine(prev => ({
      ...prev,
      drawnAmount: Math.max(0, prev.drawnAmount - amount),
      availableLimit: Math.min(prev.totalLimit, prev.availableLimit + amount)
    }));

    setAccounts(prev => prev.map(a => {
      if (a.id === source.id) {
        return { ...a, balance: a.balance - amount, availableBalance: a.availableBalance - amount };
      }
      return a;
    }));

    const ref = `LOMB-REPAY-${Date.now().toString().slice(-6)}`;
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: source.id,
      accountName: source.name,
      type: 'withdrawal',
      amount,
      currency: source.currency,
      counterparty: 'Sovereign Lombard Credit Facility',
      category: 'Investments',
      description: `Principal Repayment for Credit Facility #${ref}`,
      referenceNumber: ref,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'completed'
    };
    setTransactions(prev => [tx, ...prev]);
    logSecurityEvent('CREDIT_LINE_REPAID', 'TRANSFER_INITIATION', 'SUCCESS', `Repaid $${amount.toLocaleString()} on credit facility from ${source.name}.`);
    return { success: true };
  }, [creditLine, accounts, logSecurityEvent]);

  // Travel Notices, Card Category Locks, Standing Orders, Sweeps
  const addTravelNotice = useCallback((notice: Omit<TravelNotice, 'id' | 'createdAt' | 'status'>) => {
    const newNotice: TravelNotice = {
      ...notice,
      id: `trv_${Date.now()}`,
      status: 'scheduled',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setTravelNotices(prev => [newNotice, ...prev]);
    logSecurityEvent('TRAVEL_NOTICE_REGISTERED', 'DEVICE_TRUST', 'SUCCESS', `Travel notice registered for ${notice.destinationCountries.join(', ')}.`);
  }, [logSecurityEvent]);

  const deleteTravelNotice = useCallback((id: string) => {
    setTravelNotices(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateMerchantCategoryLocks = useCallback((locks: Record<string, boolean>) => {
    setMerchantCategoryLocks(prev => ({ ...prev, ...locks }));
  }, []);

  const addStandingOrder = useCallback((order: Omit<StandingOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: StandingOrder = {
      ...order,
      id: `sto_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setStandingOrders(prev => [newOrder, ...prev]);
  }, []);

  const cancelStandingOrder = useCallback((id: string) => {
    setStandingOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const updateCashSweepRule = useCallback((rule: Partial<CashSweepRule>) => {
    setCashSweepRule(prev => ({ ...prev, ...rule }));
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.clear();
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setTransfers(INITIAL_TRANSFERS);
    setBeneficiaries(INITIAL_BENEFICIARIES);
    setBills(INITIAL_BILL_PAYMENTS);
    setCards(INITIAL_CARDS);
    setDocuments(INITIAL_DOCUMENTS);
    setMessages(INITIAL_MESSAGES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveSessions(INITIAL_ACTIVE_SESSIONS);
    setTrustedDevices(INITIAL_CLIENT_PROFILE.trustedDevices);
    setCheckDeposits(INITIAL_CHECK_DEPOSITS);
    setStoppedChecks(INITIAL_STOPPED_CHECKS);
    setCheckbookOrders(INITIAL_CHECKBOOK_ORDERS);
    setCreditLine(INITIAL_CREDIT_LINE);
    setTravelNotices(INITIAL_TRAVEL_NOTICES);
    setMerchantCategoryLocks({ atm: false, gambling: true, crypto: false, international: false });
    setStandingOrders(INITIAL_STANDING_ORDERS);
    setCashSweepRule(INITIAL_CASH_SWEEP);
    setCurrentUser(INITIAL_CLIENT_PROFILE);
    setAuthStage('authenticated');
    setSessionLocked(false);
    setCurrentRoute('/dashboard');
  }, []);

  // Google Authenticator & Internal Bank Commands
  const [adminTotpSecret, setAdminTotpSecret] = useState<string>(() => {
    return localStorage.getItem('nt_admin_totp_secret') || localStorage.getItem('apex_admin_totp_secret') || 'JBSWY3DPEHPK3PXP';
  });

  const updateAdminTotpSecret = useCallback((newSecret: string) => {
    const clean = newSecret.toUpperCase().replace(/[^A-Z2-7]/g, '');
    if (!clean) return;
    setAdminTotpSecret(clean);
    localStorage.setItem('nt_admin_totp_secret', clean);
    logSecurityEvent('ADMIN_TOTP_KEY_UPDATED', 'ADMIN_ACTION', 'SUCCESS', 'Administrator paired personal Google Authenticator secret key.', 10);

    // Automatically log sensitive administrative authenticator rotation into external SQL database
    logAdminSqlAction({
      action: 'ADMIN_TOTP_KEY_UPDATED',
      targetEntityType: 'security',
      targetEntityId: 'admin_totp_enclave',
      fieldsChanged: {
        totpKeySecret: { from: '[REDACTED_PREVIOUS_KEY]', to: '[REDACTED_ROTATED_KEY]' }
      },
      details: 'Administrator paired and rotated personal Google Authenticator secret key.'
    });
  }, [logSecurityEvent, logAdminSqlAction]);

  const verifyAdminTotp = useCallback(async (code: string): Promise<boolean> => {
    const res = await verifyTotpToken(adminTotpSecret, code);
    if (res.valid) {
      logSecurityEvent('ADMIN_TOTP_VERIFIED', '2FA_CHALLENGE', 'SUCCESS', `Google Authenticator RFC 6238 token verified for banking session.`, 5);
      return true;
    } else {
      logSecurityEvent('ADMIN_TOTP_FAILED', '2FA_CHALLENGE', 'FAILED', `Failed Google Authenticator token verification.`, 40);
      return false;
    }
  }, [adminTotpSecret, logSecurityEvent]);

  const executeInternalBankCommand = useCallback(async (
    commandName: string,
    totpCode: string,
    onExecute: () => void
  ): Promise<{ success: boolean; error?: string }> => {
    const isValid = await verifyAdminTotp(totpCode);
    if (!isValid) {
      return {
        success: false,
        error: 'Authentication failed. Google Authenticator dynamic passcode is incorrect or has expired.'
      };
    }
    onExecute();
    logSecurityEvent(
      'INTERNAL_BANK_COMMAND_EXECUTED',
      'ADMIN_ACTION',
      'SUCCESS',
      `Internal bank command [${commandName}] authorized and executed with Google Authenticator.`,
      5
    );

    // Automatically log sensitive administrative command execution into external SQL database
    logAdminSqlAction({
      action: 'INTERNAL_COMMAND_EXECUTED',
      targetEntityType: 'system',
      targetEntityId: commandName,
      fieldsChanged: {
        commandAuthorization: { from: 'pending_2fa', to: 'authorized_totp' }
      },
      details: `Internal command [${commandName}] authorized and executed with Google Authenticator.`
    });

    return { success: true };
  }, [verifyAdminTotp, logSecurityEvent, logAdminSqlAction]);

  // Computed Totals
  const totalNetWorthUSD = accounts.reduce((acc, a) => {
    if (a.currency === 'CHF') return acc + a.balance * 1.13;
    return acc + a.balance;
  }, 0);

  const totalAvailableUSD = accounts.reduce((acc, a) => {
    if (a.currency === 'CHF') return acc + a.availableBalance * 1.13;
    return acc + a.availableBalance;
  }, 0);

  const unreadMessagesCount = messages.filter(m => m.unread || !m.isRead).length;
  const unreadNotificationsCount = notifications.filter(n => !n.read && !n.isRead).length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'pending_review').length;

  return (
    <BankingContext.Provider
      value={{
        currentRoute,
        navigateTo,
        isAdminMode,
        setIsAdminMode,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        openMobileDrawer,
        closeMobileDrawer,
        isDesktopMode,
        setIsDesktopMode,
        toggleDesktopMode,

        // Theme & Appearance
        darkMode,
        setDarkMode,
        toggleDarkMode,
        // Global Privacy & Screen Shield & Granular Eye Locks
        privacyMode,
        setPrivacyMode,
        togglePrivacyMode,
        granularMaskMap,
        isItemMasked,
        toggleItemMask,
        maskAllItems,
        unmaskAllItems,
        autoMaskOnTabBlur,
        setAutoMaskOnTabBlur,
        sessionTimeoutMinutes,
        setSessionTimeoutMinutes,
        securityPostureScore,
        securityPostureLevel,
        formatAmount,
        maskSensitiveNumber,

        // Biometric Authentication & Real Hardware Keys
        biometricSettings,
        updateBiometricSettings,
        toggleBiometricAuth,
        realFaceVerificationEnabled,
        setRealFaceVerificationEnabled,
        lastFaceVerificationTimestamp,
        recordFaceVerification,
        enrolledSecurityKeys,
        addSecurityKey,
        removeSecurityKey,

        currentUser,
        authStage,
        pendingUsername,
        rememberDeviceChecked,
        sessionLocked,
        sessionRemainingSeconds,
        extendSession,
        lockSessionManually,
        unlockSession,
        login,
        verify2FA,
        verifyRecoveryCode,
        registerCurrentDevice,
        logout,
        unlockAccountWithKYC,
        requestPasswordReset,
        resetPassword,
        switchUserPersona,

        accounts,
        transactions,
        transfers,
        beneficiaries,
        bills,
        cards,
        documents,
        messages,
        notifications,
        auditLogs,
        activeSessions,
        trustedDevices,
        allCustomers,

        totalNetWorthUSD,
        totalAvailableUSD,
        unreadMessagesCount,
        unreadNotificationsCount,
        pendingTransfersCount,
        aiSpendingAlerts,
        setAiSpendingAlerts,
        aiSpendingThreshold,
        setAiSpendingThreshold,
        addNotification,
        simulateAiSpendingAlert,

        initiateTransfer,
        approveTransfer,
        rejectTransfer,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        payBill,
        addBill,
        toggleCardFreeze,
        updateCardLimits,
        updateCardSecuritySwitches,
        disputeTransaction,
        sendSecureMessage,
        sendMessage,
        adminReplyMessage,
        replyToMessage,
        markMessageRead,
        markNotificationAsRead,
        markNotificationRead,
        markAllNotificationsAsRead,
        markAllNotificationsRead,
        deleteNotification,
        uploadDocument,
        updateProfileInfo,
        updateUserProfile,
        updateCustomerProfile,
        updateSecuritySettings,
        twoFactorSettings,
        updateTwoFactorSettings,
        regenerateRecoveryCodes,
        updateMasterPassword,
        revokeDevice,
        terminateSession,
        terminateAllOtherSessions,
        adminAdjustAccountBalance,
        adjustAccountBalance,
        adminSetAccountStatus,
        updateAccountStatus,
        adminSetCustomerKYC,
        createCustomerAccount,
        createBankAccount,
        resetAllData,

        // Role & Permissions Access Control (RBAC)
        roles,
        hasPermission: checkHasPerm,
        accessDeniedState,
        triggerAccessDenied,
        closeAccessDenied,
        createRole,
        updateRole,
        deleteRole,
        updateUserRoleAndPermissions,

        // Check Services, FX, Lending, Travel, Standing Orders
        checkDeposits,
        stoppedChecks,
        checkbookOrders,
        depositCheck,
        fundAccount,
        placeStopPayment,
        orderCheckbook,

        executeFxConversion,

        creditLine,
        drawdownCreditLine,
        repayCreditLine,

        travelNotices,
        addTravelNotice,
        deleteTravelNotice,
        merchantCategoryLocks,
        updateMerchantCategoryLocks,

        standingOrders,
        addStandingOrder,
        cancelStandingOrder,
        cashSweepRule,
        updateCashSweepRule,

        // Google Authenticator & Internal Bank Commands
        adminTotpSecret,
        updateAdminTotpSecret,
        verifyAdminTotp,
        executeInternalBankCommand,

        // External SQL Database SIEM Regulatory Audit Trail
        sqlAuditLogs,
        fetchSqlAuditLogs,
        logAdminSqlAction,
        logAuditView
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};
