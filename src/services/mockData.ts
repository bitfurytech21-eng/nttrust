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
  DeviceInfo
} from '../types/banking';

export const INITIAL_CLIENT_PROFILE: UserProfile = {
  id: 'usr_client_001',
  clientId: 'NT-VIP-JOLIE-7724',
  username: 'angelina.jolie',
  fullName: 'Angelina Jolie',
  preferredName: 'Angelina',
  email: 'a.jolie@joliepas.com',
  phone: '+1 (310) 555-7724',
  avatarUrl: '',
  role: 'client',
  tier: 'Executive Sovereign',
  occupation: 'Filmmaker, Humanitarian & Special Envoy (Maddox Jolie-Pitt Foundation)',
  accountOpenedDate: '2021-03-15',
  dateOfBirth: '1975-06-04',
  ssnLast4: '7724',
  address: {
    street: '2620 Los Feliz Blvd',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90027',
    country: 'United States'
  },
  kycStatus: 'verified',
  kycTier: 'Tier 3 (Institutional/Private)',
  taxIdMasked: '•••-••-7724',
  twoFactorEnabled: true,
  twoFactorMethod: 'authenticator',
  trustedDevices: [
    {
      id: 'dev_01',
      name: 'MacBook Pro 16" M3 Max (Private Studio - Los Feliz)',
      browser: 'Chrome 129.0 / macOS Sequoia',
      os: 'macOS 15.0',
      ip: '198.51.100.44',
      location: 'Los Angeles, CA',
      lastActive: 'Active now (September 25, 2026 at 3:16 PM)',
      isCurrent: true,
      isTrusted: true,
      fingerprint: 'fp_a982f1bc9948201a0'
    },
    {
      id: 'dev_02',
      name: 'iPhone 16 Pro (Angelina Jolie Secure Key)',
      browser: 'Mobile iOS 18.1',
      os: 'iOS 18.1',
      ip: '172.56.21.90',
      location: 'Los Angeles, CA',
      lastActive: '15 minutes ago',
      isCurrent: false,
      isTrusted: true,
      fingerprint: 'fp_38bf8820acbe01'
    }
  ],
  securityQuestionsSet: true,
  accountLocked: false,
  failedLoginAttempts: 0
};

export const INITIAL_ADMIN_PROFILE: UserProfile = {
  id: 'usr_admin_001',
  clientId: 'OPS-LEAD-9912',
  username: 'sarah.jenkins',
  fullName: 'Sarah Jenkins',
  preferredName: 'Sarah',
  email: 's.jenkins@northerntrust.com',
  phone: '+1 (555) 902-1144',
  role: 'admin',
  tier: 'Operations Lead',
  address: {
    street: '1 Wall Street, Floor 48',
    city: 'New York',
    state: 'NY',
    postalCode: '10005',
    country: 'United States'
  },
  kycStatus: 'verified',
  kycTier: 'Tier 3 (Institutional/Private)',
  taxIdMasked: '•••-••-4412',
  twoFactorEnabled: true,
  twoFactorMethod: 'authenticator',
  trustedDevices: [
    {
      id: 'dev_admin_01',
      name: 'Northern Trust Authorized Workstation (YubiKey Hardware Enforced)',
      browser: 'Enterprise Secure Chromium',
      os: 'Northern Trust Secure Linux 6.8',
      ip: '10.240.12.88',
      location: 'New York Headquarters (Ops Room A)',
      lastActive: 'Active now',
      isCurrent: true,
      isTrusted: true,
      fingerprint: 'fp_corp_sec_0989'
    }
  ],
  securityQuestionsSet: true,
  accountLocked: false,
  failedLoginAttempts: 0
};

export const MOCK_CUSTOMERS_LIST: UserProfile[] = [
  INITIAL_CLIENT_PROFILE,
  INITIAL_ADMIN_PROFILE
];

// =========================================================================
// ACCOUNTS CONFIGURATION (VANCE CAPITAL)
// Base balance cleared leaving $4,500.00 + September Bitfurytech ACH Inflows
// - Sept 16: +$9,646.00
// - Sept 23: +$997,863.00, +$396,645.00, +$600,000.00
// Settled Available Balance = $4,500 + $9,646 + $997,863 + $396,645 + $600,000 = $2,008,654.00
// Pending ACH (Sept 23) = $378,899.00
// =========================================================================
export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc_chk_01',
    accountNumber: '882049102741',
    routingNumber: '021000089',
    iban: 'US89NT021000089882049102741',
    swiftBic: 'NTCOUS33NYC',
    name: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'checking',
    currency: 'USD',
    balance: 2008654.00,
    availableBalance: 2008654.00,
    pendingBalance: 378899.00,
    interestRateAPY: 2.15,
    monthlyLimit: 5000000.00,
    monthlySpent: 0.00,
    isFrozen: false,
    status: 'active',
    colorTheme: 'cyan'
  },
  {
    id: 'acc_sav_01',
    accountNumber: '994810283719',
    routingNumber: '021000089',
    iban: 'US89NT021000089994810283719',
    swiftBic: 'NTCOUS33NYC',
    name: 'Jolie-Pitt Humanitarian Global Reserve',
    type: 'savings',
    currency: 'USD',
    balance: 0.00,
    availableBalance: 0.00,
    pendingBalance: 0.00,
    interestRateAPY: 5.25,
    monthlyLimit: 10000000.00,
    monthlySpent: 0.00,
    isFrozen: false,
    status: 'active',
    colorTheme: 'emerald'
  },
  {
    id: 'acc_fx_01',
    accountNumber: '552910483921',
    routingNumber: '021000089',
    iban: 'FR763000600001552910483921',
    swiftBic: 'NTCOFRPPA',
    name: 'Maddox Jolie-Pitt Foundation Multi-Currency (EUR)',
    type: 'multicurrency',
    currency: 'EUR',
    balance: 0.00,
    availableBalance: 0.00,
    pendingBalance: 0.00,
    interestRateAPY: 2.50,
    isFrozen: false,
    status: 'active',
    colorTheme: 'indigo'
  },
  {
    id: 'acc_inv_01',
    accountNumber: '771920485012',
    routingNumber: '021000089',
    name: 'Angelina Jolie Sovereign Trust & Atelier Jolie Film Fund',
    type: 'investment',
    currency: 'USD',
    balance: 0.00,
    availableBalance: 0.00,
    pendingBalance: 0.00,
    interestRateAPY: 8.85,
    isFrozen: false,
    status: 'active',
    colorTheme: 'gold'
  },
  {
    id: 'acc_cd_01',
    accountNumber: '331892014755',
    routingNumber: '021000089',
    name: '24-Month Sovereign Fixed CD',
    type: 'cd',
    currency: 'USD',
    balance: 0.00,
    availableBalance: 0.00,
    pendingBalance: 0.00,
    interestRateAPY: 5.40,
    isFrozen: false,
    status: 'active',
    colorTheme: 'slate'
  }
];

// =========================================================================
// 3-YEAR TRANSACTION LEDGER (2023 - SEPTEMBER 2026)
// Featuring Bitfurytech Holdings ACH Transactions:
// - 3 Transactions 3 Years Ago (2023) from Bitfurytech Holdings
// - 2 Transactions Last Year (2025) from Bitfurytech Holdings
// - September 16, 2026: +$9,646 (ACH from Bitfurytech Holdings)
// - September 23, 2026: +$997,863, +$396,645, +$600,000 (ACH from Bitfurytech Holdings)
// - September 23, 2026 Pending: $378,899 (ACH from Bitfurytech Holdings)
// =========================================================================
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // ----------------------- SEPTEMBER 2026 CURRENT ACH TRANSACTIONS -----------------------
  {
    id: 'tx_2026_sep23_04',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 378899.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Pending Inbound Transfer - Bitfurytech Holdings Clearing Settlement',
    referenceNumber: 'ACH-TX-2026-0923-378899',
    timestamp: '2026-09-23 16:50:00',
    status: 'pending',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2026_sep23_03',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 600000.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Corporate Capital Credit - Bitfurytech Holdings Tranche B',
    referenceNumber: 'ACH-TX-2026-0923-600000',
    timestamp: '2026-09-23 14:20:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2026_sep23_02',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 396645.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Direct Transfer - Bitfurytech Holdings Capital Disbursal',
    referenceNumber: 'ACH-TX-2026-0923-396645',
    timestamp: '2026-09-23 11:42:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2026_sep23_01',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 997863.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Institutional Credit Settlement - Bitfurytech Holdings Tranche A',
    referenceNumber: 'ACH-TX-2026-0923-997863',
    timestamp: '2026-09-23 09:15:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2026_sep16_01',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 9646.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Direct Deposit - Bitfurytech Holdings Monthly Allocation',
    referenceNumber: 'ACH-TX-2026-0916-9646',
    timestamp: '2026-09-16 10:30:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },

  // ----------------------- 2026 EARLIER TRANSACTIONS (JAN - MAR 2026) -----------------------
  {
    id: 'tx_2026_01',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 125000.00,
    currency: 'USD',
    counterparty: 'Vance Global Studio NYC',
    counterpartyAccount: 'ACCT-WRIGHT-9921',
    category: 'Transfers',
    description: 'Vance Global NYC Collective Artisan & Tailor Workshop Grant',
    referenceNumber: 'REF-TX-2026-03319',
    timestamp: '2026-03-31 16:45:00',
    status: 'completed',
    fee: 0.00,
    location: 'New York, NY'
  },
  {
    id: 'tx_2026_02',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 250000.00,
    currency: 'USD',
    counterparty: 'Vance Global Conservation Trust Cambodia',
    counterpartyAccount: 'WIRE-CAM-008912',
    category: 'Transfers',
    description: 'Samlout Wildlife Sanctuary Conservation & Community Healthcare',
    referenceNumber: 'REF-TX-2026-03291',
    timestamp: '2026-03-29 11:20:00',
    status: 'completed',
    fee: 35.00,
    location: 'Battambang, Cambodia'
  },
  {
    id: 'tx_2026_03',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 1850000.00,
    currency: 'USD',
    counterparty: 'Universal Pictures International',
    counterpartyAccount: 'WIRE-US-UNI-8849',
    category: 'Income',
    description: 'Directing & Production Profit Participation Royalty Distribution',
    referenceNumber: 'REF-TX-2026-03264',
    timestamp: '2026-03-26 14:10:00',
    status: 'completed',
    fee: 0.00,
    location: 'Los Angeles, CA'
  },
  {
    id: 'tx_2026_04',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'card_purchase',
    amount: 38450.00,
    currency: 'USD',
    counterparty: 'NetJets Private Aviation Charter',
    category: 'Dining & Travel',
    description: 'Northern Trust Black Metal Card •• 8921 - Transatlantic Mission Flight',
    referenceNumber: 'REF-POS-2026-03241',
    timestamp: '2026-03-24 09:30:00',
    status: 'completed',
    location: 'Geneva / LAX'
  },
  {
    id: 'tx_2026_07',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'bill_payment',
    amount: 42100.00,
    currency: 'USD',
    counterparty: 'Los Feliz Historic Estate Property & Security Services',
    counterpartyAccount: 'ACCT-LF-ESTATE-99',
    category: 'Utilities',
    description: 'Monthly Estate Management, Private Security & Landscaping Services',
    referenceNumber: 'REF-BILL-2026-03154',
    timestamp: '2026-03-15 15:40:00',
    status: 'completed'
  },
  {
    id: 'tx_2026_09',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 750000.00,
    currency: 'USD',
    counterparty: 'Maison Guerlain Paris',
    counterpartyAccount: 'FR763000600001992019',
    category: 'Income',
    description: 'Mon Guerlain Sustainable Bee Protection Campaign Partnership',
    referenceNumber: 'REF-TX-2026-03088',
    timestamp: '2026-03-08 19:30:00',
    status: 'completed',
    fee: 0.00,
    location: 'Paris, France'
  },
  {
    id: 'tx_2026_14',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 2400000.00,
    currency: 'USD',
    counterparty: 'FilmNation Entertainment LLC',
    counterpartyAccount: 'WIRE-US-FN-4491',
    category: 'Income',
    description: 'Biographical Drama Feature Film Production Milestone Advance',
    referenceNumber: 'REF-TX-2026-02188',
    timestamp: '2026-02-18 16:30:00',
    status: 'completed',
    fee: 0.00,
    location: 'Los Angeles, CA'
  },

  // ----------------------- 2025 TRANSACTIONS (INCLUDING 2 BITFURYTECH TRANSACTIONS) -----------------------
  {
    id: 'tx_2025_bitfury_02',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 450000.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Corporate Capital Disbursal - Bitfurytech Holdings',
    referenceNumber: 'REF-ACH-2025-11120',
    timestamp: '2025-11-12 11:05:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2025_02',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 600000.00,
    currency: 'USD',
    counterparty: 'UNHCR Winterization Emergency Relief',
    counterpartyAccount: 'CH930024091823000',
    category: 'Transfers',
    description: 'Annual Year-End Winter Refugee Shelter Endowment Wire',
    referenceNumber: 'REF-WIRE-2025-12201',
    timestamp: '2025-12-20 15:10:00',
    status: 'completed',
    fee: 0.00,
    location: 'Geneva, Switzerland'
  },
  {
    id: 'tx_2025_03',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 3200000.00,
    currency: 'USD',
    counterparty: 'Warner Bros. Discovery International',
    counterpartyAccount: 'WIRE-WB-LA-9021',
    category: 'Income',
    description: 'Global Theatrical & Streaming Performance Royalty Settlement',
    referenceNumber: 'REF-DEP-2025-11150',
    timestamp: '2025-11-15 14:00:00',
    status: 'completed',
    fee: 0.00,
    location: 'Burbank, CA'
  },
  {
    id: 'tx_2025_04',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 250000.00,
    currency: 'USD',
    counterparty: 'Vance Global Conservation Trust Cambodia',
    counterpartyAccount: 'WIRE-CAM-008912',
    category: 'Transfers',
    description: 'Q4 Community Forest Protection & Ranger Stipends',
    referenceNumber: 'REF-WIRE-2025-10280',
    timestamp: '2025-10-28 10:45:00',
    status: 'completed',
    fee: 35.00,
    location: 'Battambang, Cambodia'
  },
  {
    id: 'tx_2025_bitfury_01',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 285000.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Direct Credit Settlement - Bitfurytech Holdings Corp',
    referenceNumber: 'REF-ACH-2025-06180',
    timestamp: '2025-06-18 14:22:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2025_06',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 1500000.00,
    currency: 'USD',
    counterparty: 'Maison Guerlain Paris',
    counterpartyAccount: 'FR763000600001992019',
    category: 'Income',
    description: 'Global Biodiversity & Women for Bees Annual Campaign Honorarium',
    referenceNumber: 'REF-DEP-2025-08220',
    timestamp: '2025-08-22 16:15:00',
    status: 'completed',
    fee: 0.00,
    location: 'Paris, France'
  },
  {
    id: 'tx_2025_07',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 110000.00,
    currency: 'USD',
    counterparty: 'Vance Global Studio NYC LLC',
    counterpartyAccount: 'ACCT-WRIGHT-9921',
    category: 'Transfers',
    description: 'Great Jones Space Tailor Residency & Craftsperson Apprenticeship',
    referenceNumber: 'REF-TX-2025-07150',
    timestamp: '2025-07-15 13:40:00',
    status: 'completed',
    location: 'New York, NY'
  },
  {
    id: 'tx_2025_11',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 2800000.00,
    currency: 'USD',
    counterparty: 'Universal Pictures International',
    counterpartyAccount: 'WIRE-US-UNI-8849',
    category: 'Income',
    description: 'International Theatrical Syndication Royalty Payout',
    referenceNumber: 'REF-DEP-2025-03250',
    timestamp: '2025-03-25 15:30:00',
    status: 'completed',
    location: 'Los Angeles, CA'
  },

  // ----------------------- 2024 TRANSACTIONS (FULL YEAR 2024) -----------------------
  {
    id: 'tx_2024_02',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 500000.00,
    currency: 'USD',
    counterparty: 'UNHCR UN Refugee Agency Geneva',
    counterpartyAccount: 'CH930024091823000',
    category: 'Transfers',
    description: 'Global Refugee Emergency Education Fund Annual Wire',
    referenceNumber: 'REF-WIRE-2024-12150',
    timestamp: '2024-12-15 14:00:00',
    status: 'completed',
    location: 'Geneva, Switzerland'
  },
  {
    id: 'tx_2024_03',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 4500000.00,
    currency: 'USD',
    counterparty: 'StudioCanal & Fremantle Media Group',
    counterpartyAccount: 'GB88FREM40019283',
    category: 'Income',
    description: 'Without Blood Principal Feature Direction & Executive Rights',
    referenceNumber: 'REF-DEP-2024-11050',
    timestamp: '2024-11-05 17:20:00',
    status: 'completed',
    location: 'Rome, Italy'
  },
  {
    id: 'tx_2024_04',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 250000.00,
    currency: 'USD',
    counterparty: 'Vance Global Conservation Trust Cambodia',
    counterpartyAccount: 'WIRE-CAM-008912',
    category: 'Transfers',
    description: 'Samlout Primary Schools Clean Solar & Computer Labs Wire',
    referenceNumber: 'REF-WIRE-2024-09200',
    timestamp: '2024-09-20 10:15:00',
    status: 'completed',
    fee: 35.00,
    location: 'Battambang, Cambodia'
  },
  {
    id: 'tx_2024_06',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 1200000.00,
    currency: 'USD',
    counterparty: 'Maison Guerlain Paris',
    counterpartyAccount: 'FR763000600001992019',
    category: 'Income',
    description: 'International Guerlain Campaign & Conservation Endowment',
    referenceNumber: 'REF-DEP-2024-07180',
    timestamp: '2024-07-18 15:45:00',
    status: 'completed',
    location: 'Paris, France'
  },
  {
    id: 'tx_2024_09',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 250000.00,
    currency: 'USD',
    counterparty: 'Vance Global Conservation Trust Cambodia',
    counterpartyAccount: 'WIRE-CAM-008912',
    category: 'Transfers',
    description: 'Q1 Samlout Wildlife Ranger Anti-Poaching Operations Wire',
    referenceNumber: 'REF-WIRE-2024-03120',
    timestamp: '2024-03-12 11:30:00',
    status: 'completed',
    fee: 35.00,
    location: 'Battambang, Cambodia'
  },

  // ----------------------- 2023 TRANSACTIONS (INCLUDING 3 BITFURYTECH TRANSACTIONS) -----------------------
  {
    id: 'tx_2023_bitfury_03',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 510000.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Year-End Liquidity Settlement - Bitfurytech Holdings',
    referenceNumber: 'REF-ACH-2023-12050',
    timestamp: '2023-12-05 13:20:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2023_02',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 500000.00,
    currency: 'USD',
    counterparty: 'UNHCR UN Refugee Agency Geneva',
    counterpartyAccount: 'CH930024091823000',
    category: 'Transfers',
    description: 'Special Envoy Global Refugee Emergency Relief Endowment',
    referenceNumber: 'REF-WIRE-2023-12100',
    timestamp: '2023-12-10 16:00:00',
    status: 'completed',
    location: 'Geneva, Switzerland'
  },
  {
    id: 'tx_2023_03',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 3800000.00,
    currency: 'USD',
    counterparty: 'Universal Pictures International',
    counterpartyAccount: 'WIRE-US-UNI-8849',
    category: 'Income',
    description: 'Maria Biographical Feature Advance & Production Distribution',
    referenceNumber: 'REF-DEP-2023-10250',
    timestamp: '2023-10-25 15:00:00',
    status: 'completed',
    location: 'Budapest / Paris'
  },
  {
    id: 'tx_2023_bitfury_02',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 3200000.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Corporate Distribution - Bitfurytech Holdings',
    referenceNumber: 'REF-ACH-2023-08220',
    timestamp: '2023-08-22 15:40:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2023_05',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'transfer_out',
    amount: 250000.00,
    currency: 'USD',
    counterparty: 'Vance Global Conservation Trust Cambodia',
    counterpartyAccount: 'WIRE-CAM-008912',
    category: 'Transfers',
    description: 'Samlout Protected Area Land Conservation & Tree Planting',
    referenceNumber: 'REF-WIRE-2023-08050',
    timestamp: '2023-08-05 09:45:00',
    status: 'completed',
    fee: 35.00,
    location: 'Battambang, Cambodia'
  },
  {
    id: 'tx_2023_bitfury_01',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 175000.00,
    currency: 'USD',
    counterparty: 'Bitfurytech Holdings',
    counterpartyAccount: 'ACH-BITFURY-HOLDINGS-910',
    category: 'Income',
    description: 'ACH Inbound Deposit - Bitfurytech Holdings Digital Assets Tranche',
    referenceNumber: 'REF-ACH-2023-04140',
    timestamp: '2023-04-14 10:15:00',
    status: 'completed',
    fee: 0.00,
    location: 'Wilmington, DE'
  },
  {
    id: 'tx_2023_07',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    type: 'deposit',
    amount: 1500000.00,
    currency: 'USD',
    counterparty: 'Maison Guerlain Paris',
    counterpartyAccount: 'FR763000600001992019',
    category: 'Income',
    description: 'Mon Guerlain Partnership & UNESCO Women for Bees Program',
    referenceNumber: 'REF-DEP-2023-05120',
    timestamp: '2023-05-12 11:30:00',
    status: 'completed',
    location: 'Paris, France'
  }
];

export const INITIAL_TRANSFERS: TransferRequest[] = [
  {
    id: 'trf_000_ach',
    type: 'external_ach',
    fromAccountId: 'acc_chk_01',
    fromAccountName: 'Bitfurytech Holdings Corp (ACH Network)',
    toAccountName: 'Angelina Jolie Private Wealth Reserve Checking',
    toAccountNumber: '882049102741',
    toRoutingOrBic: '021000089',
    beneficiaryName: 'Angelina Jolie',
    beneficiaryBank: 'Northern Trust Sovereign Wealth',
    beneficiaryCountry: 'United States',
    amount: 997863.00,
    sourceCurrency: 'USD',
    targetCurrency: 'USD',
    fee: 0.00,
    scheduledDate: '2026-09-23',
    isRecurring: false,
    purpose: 'ACH Tranche Alpha Settlement - Bitfurytech Holdings',
    status: 'completed',
    riskScore: 'LOW',
    createdAt: '2026-09-23 09:15:00',
    referenceId: 'ACH-TX-2026-0923-997863'
  },
  {
    id: 'trf_001',
    type: 'international_swift',
    fromAccountId: 'acc_chk_01',
    fromAccountName: 'Angelina Jolie Private Wealth Reserve Checking',
    toAccountName: 'Vance Global Conservation Trust (Battambang)',
    toAccountNumber: 'WIRE-CAM-008912',
    toRoutingOrBic: 'FTBKHPPXXX',
    beneficiaryName: 'Vance Global Wildlife Conservation Project',
    beneficiaryBank: 'Foreign Trade Bank of Cambodia',
    beneficiaryCountry: 'Cambodia',
    amount: 250000.00,
    sourceCurrency: 'USD',
    targetCurrency: 'USD',
    fee: 35.00,
    scheduledDate: '2026-03-29',
    isRecurring: false,
    purpose: 'Samlout Wildlife Sanctuary Conservation & Community Support',
    status: 'completed',
    riskScore: 'LOW',
    createdAt: '2026-03-29 11:20:00',
    referenceId: 'NT-SWIFT-2026-03291'
  },
  {
    id: 'trf_003',
    type: 'external_wire',
    fromAccountId: 'acc_chk_01',
    fromAccountName: 'Angelina Jolie Private Wealth Reserve Checking',
    toAccountName: 'Vance Global Studio NYC LLC',
    toAccountNumber: '021000021-998812',
    toRoutingOrBic: '021000021',
    beneficiaryName: 'Vance Global NYC Collective',
    beneficiaryBank: 'JPMorgan Chase NY',
    beneficiaryCountry: 'United States',
    amount: 125000.00,
    sourceCurrency: 'USD',
    targetCurrency: 'USD',
    fee: 0.00,
    scheduledDate: '2026-03-31',
    isRecurring: false,
    purpose: 'Artisan Workshop & Tailor Fellowship Funding',
    status: 'completed',
    riskScore: 'LOW',
    createdAt: '2026-03-31 16:45:00',
    referenceId: 'NT-WIRE-2026-03319'
  }
];

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben_bitfury',
    nickname: 'Bitfurytech Holdings ACH Desk',
    fullName: 'Bitfurytech Holdings Corporation',
    bankName: 'Northern Trust ACH Network / Institutional Clearing',
    accountNumber: 'ACH-BITFURY-HOLDINGS-910',
    routingOrSwift: '021000089',
    country: 'United States',
    currency: 'USD',
    type: 'domestic',
    verified: true,
    lastTransferDate: '2026-09-23'
  },
  {
    id: 'ben_01',
    nickname: 'Vance Global Conservation Trust Cambodia',
    fullName: 'Vance Global Wildlife Conservation Project',
    bankName: 'Foreign Trade Bank of Cambodia',
    accountNumber: 'WIRE-CAM-008912',
    routingOrSwift: 'FTBKHPPXXX',
    country: 'Cambodia',
    currency: 'USD',
    type: 'international',
    verified: true,
    lastTransferDate: '2026-03-29'
  },
  {
    id: 'ben_02',
    nickname: 'UNHCR UN Refugee Agency Geneva',
    fullName: 'United Nations High Commissioner for Refugees',
    bankName: 'UBS Switzerland AG Geneva HQ',
    accountNumber: 'CH930024091823000',
    routingOrSwift: 'UBSWCHZH80A',
    country: 'Switzerland',
    currency: 'USD',
    type: 'international',
    verified: true,
    lastTransferDate: '2026-03-20'
  },
  {
    id: 'ben_03',
    nickname: 'Vance Global NYC Studio',
    fullName: 'Vance Global Studio LLC',
    bankName: 'JPMorgan Chase Bank, N.A.',
    accountNumber: '9988120491',
    routingOrSwift: '021000021',
    country: 'United States',
    currency: 'USD',
    type: 'domestic',
    verified: true,
    lastTransferDate: '2026-03-31'
  },
  {
    id: 'ben_04',
    nickname: 'Sotheby’s Fine Art London',
    fullName: 'Sotheby’s International Art Advisory',
    bankName: 'HSBC Bank PLC London Mayfair',
    accountNumber: 'GB29MIDL40051512345678',
    routingOrSwift: 'MIDLGB22',
    country: 'United Kingdom',
    currency: 'GBP',
    type: 'international',
    verified: true,
    lastTransferDate: '2026-03-12'
  }
];

export const INITIAL_BILL_PAYMENTS: BillPayment[] = [
  {
    id: 'bill_01',
    payeeName: 'Los Feliz Historic Estate Management & Security',
    category: 'Utilities',
    accountNumber: 'ACCT-LF-ESTATE-99',
    amount: 42100.00,
    dueDate: '2026-10-01',
    autoPayEnabled: true,
    status: 'scheduled',
    lastPaidDate: '2026-09-15',
    confirmationCode: 'LF-AUTOPAY-2026-09'
  },
  {
    id: 'bill_02',
    payeeName: 'Vance Global NYC Historic Great Jones Lease',
    category: 'Utilities',
    accountNumber: 'LEASE-GJ-57-NYC',
    amount: 35000.00,
    dueDate: '2026-10-05',
    autoPayEnabled: true,
    status: 'scheduled',
    lastPaidDate: '2026-09-05',
    confirmationCode: 'AJ-LEASE-2026-09'
  },
  {
    id: 'bill_03',
    payeeName: 'Chubb Masterpiece Fine Art & Jewelry Global Policy',
    category: 'Insurance',
    accountNumber: 'CHUBB-POL-WRIGHT-991',
    amount: 28500.00,
    dueDate: '2026-10-15',
    autoPayEnabled: true,
    status: 'scheduled',
    lastPaidDate: '2026-09-15'
  }
];

export const INITIAL_CARDS: BankCard[] = [
  {
    id: 'crd_01',
    cardholderName: 'ANGELINA JOLIE',
    cardNumber: '4902881299408921',
    cardType: 'debit',
    tier: 'black_metal',
    expiryMonth: '11',
    expiryYear: '29',
    cvv: '849',
    pinMasked: '••••',
    isFrozen: false,
    dailySpendingLimit: 200000,
    dailyWithdrawalLimit: 25000,
    currentDaySpent: 0,
    allowInternational: true,
    allowOnlineTransactions: true,
    allowAtmWithdrawals: true,
    allowContactless: true,
    linkedAccountId: 'acc_chk_01'
  },
  {
    id: 'crd_02',
    cardholderName: 'ANGELINA JOLIE',
    cardNumber: '5420199482017734',
    cardType: 'credit',
    tier: 'gold_reserve',
    expiryMonth: '08',
    expiryYear: '30',
    cvv: '391',
    pinMasked: '••••',
    isFrozen: false,
    dailySpendingLimit: 500000,
    dailyWithdrawalLimit: 50000,
    currentDaySpent: 0,
    allowInternational: true,
    allowOnlineTransactions: true,
    allowAtmWithdrawals: true,
    allowContactless: true,
    linkedAccountId: 'acc_chk_01'
  }
];

// =========================================================================
// 3-YEAR FULL TAX HISTORIES & STATEMENTS (2023 - 2026 SEPTEMBER)
// =========================================================================
export const INITIAL_DOCUMENTS: BankDocument[] = [
  // ----------------- 2026 STATEMENTS & TAX SUITE -----------------
  {
    id: 'doc_2026_sep_stmt',
    title: 'September 2026 Northern Trust Client Statement (Bitfurytech ACH)',
    type: 'statement',
    category: 'statement',
    date: '2026-09-24',
    fileSize: '2.8 MB PDF',
    period: 'Sep 01, 2026 - Sep 24, 2026',
    downloadUrl: '#statement-sep-2026',
    isEncrypted: true
  },
  {
    id: 'doc_2026_01',
    title: 'March 2026 Northern Trust Client Consolidated Statement',
    type: 'statement',
    category: 'statement',
    date: '2026-03-31',
    fileSize: '2.4 MB PDF',
    period: 'Mar 01, 2026 - Mar 31, 2026',
    downloadUrl: '#statement-mar-2026',
    isEncrypted: true
  },
  {
    id: 'doc_2026_02',
    title: 'February 2026 Northern Trust Client Consolidated Statement',
    type: 'statement',
    category: 'statement',
    date: '2026-02-28',
    fileSize: '2.1 MB PDF',
    period: 'Feb 01, 2026 - Feb 28, 2026',
    downloadUrl: '#statement-feb-2026',
    isEncrypted: true
  },
  {
    id: 'doc_2026_03',
    title: 'January 2026 Northern Trust Client Consolidated Statement',
    type: 'statement',
    category: 'statement',
    date: '2026-01-31',
    fileSize: '1.9 MB PDF',
    period: 'Jan 01, 2026 - Jan 31, 2026',
    downloadUrl: '#statement-jan-2026',
    isEncrypted: true
  },
  {
    id: 'doc_2026_tax_01',
    title: 'Q1 2026 Estimated Tax Liability Certificate & Withholding Ledger',
    type: 'tax',
    category: 'tax',
    date: '2026-03-31',
    fileSize: '1.4 MB PDF',
    period: 'Q1 2026 (Jan - Mar 2026)',
    downloadUrl: '#tax-q1-2026',
    isEncrypted: true
  },

  // ----------------- 2025 COMPLETE TAX YEAR SUITE -----------------
  {
    id: 'doc_2025_tax_01',
    title: '2025 Form 1099-INT: Sovereign Interest Income ($981,540.25)',
    type: 'tax',
    category: 'tax',
    date: '2026-01-31',
    fileSize: '1.5 MB PDF',
    period: 'Tax Year 2025',
    downloadUrl: '#tax-1099-int-2025',
    isEncrypted: true
  },
  {
    id: 'doc_2025_tax_02',
    title: '2025 Form 1099-DIV: Trust & Portfolio Dividends ($512,400.00)',
    type: 'tax',
    category: 'tax',
    date: '2026-01-31',
    fileSize: '1.6 MB PDF',
    period: 'Tax Year 2025',
    downloadUrl: '#tax-1099-div-2025',
    isEncrypted: true
  },
  {
    id: 'doc_2025_tax_03',
    title: '2025 Form 1099-B: Proceeds From Brokerage & Barter ($640,000.00)',
    type: 'tax',
    category: 'tax',
    date: '2026-01-31',
    fileSize: '1.7 MB PDF',
    period: 'Tax Year 2025',
    downloadUrl: '#tax-1099-b-2025',
    isEncrypted: true
  },
  {
    id: 'doc_2025_tax_04',
    title: '2025 Schedule K-1 (Form 1041): Vance Sovereign Trust Allocation',
    type: 'tax',
    category: 'tax',
    date: '2026-02-15',
    fileSize: '2.2 MB PDF',
    period: 'Tax Year 2025',
    downloadUrl: '#tax-k1-2025',
    isEncrypted: true
  },
  {
    id: 'doc_2025_tax_05',
    title: '2025 Form 1042-S: Cross-Border Foreign Income & Swiss Treaty Relief',
    type: 'tax',
    category: 'tax',
    date: '2026-02-15',
    fileSize: '1.3 MB PDF',
    period: 'Tax Year 2025',
    downloadUrl: '#tax-1042s-2025',
    isEncrypted: true
  },
  {
    id: 'doc_2025_tax_06',
    title: '2025 Year-End Consolidated Tax Package & FBAR FinCEN 114 Attestation',
    type: 'tax',
    category: 'tax',
    date: '2026-02-28',
    fileSize: '5.8 MB PDF',
    period: 'Tax Year 2025',
    downloadUrl: '#tax-package-2025',
    isEncrypted: true
  },
  {
    id: 'doc_2025_stmt_01',
    title: '2025 Year-End Consolidated Annual Account Statement',
    type: 'statement',
    category: 'statement',
    date: '2025-12-31',
    fileSize: '4.2 MB PDF',
    period: 'Jan 01, 2025 - Dec 31, 2025',
    downloadUrl: '#statement-annual-2025',
    isEncrypted: true
  },

  // ----------------- 2024 COMPLETE TAX YEAR SUITE -----------------
  {
    id: 'doc_2024_tax_01',
    title: '2024 Form 1099-INT: Sovereign Interest Income ($894,220.10)',
    type: 'tax',
    category: 'tax',
    date: '2025-01-31',
    fileSize: '1.4 MB PDF',
    period: 'Tax Year 2024',
    downloadUrl: '#tax-1099-int-2024',
    isEncrypted: true
  },
  {
    id: 'doc_2024_tax_02',
    title: '2024 Form 1099-DIV: Trust & Portfolio Dividends ($468,900.00)',
    type: 'tax',
    category: 'tax',
    date: '2025-01-31',
    fileSize: '1.5 MB PDF',
    period: 'Tax Year 2024',
    downloadUrl: '#tax-1099-div-2024',
    isEncrypted: true
  },
  {
    id: 'doc_2024_tax_03',
    title: '2024 Form 1099-B: Proceeds From Brokerage & Barter ($520,000.00)',
    type: 'tax',
    category: 'tax',
    date: '2025-01-31',
    fileSize: '1.6 MB PDF',
    period: 'Tax Year 2024',
    downloadUrl: '#tax-1099-b-2024',
    isEncrypted: true
  },
  {
    id: 'doc_2024_tax_04',
    title: '2024 Schedule K-1 (Form 1041): Vance Sovereign Trust Allocation',
    type: 'tax',
    category: 'tax',
    date: '2025-02-15',
    fileSize: '2.1 MB PDF',
    period: 'Tax Year 2024',
    downloadUrl: '#tax-k1-2024',
    isEncrypted: true
  },
  {
    id: 'doc_2024_tax_05',
    title: '2024 Form 1042-S: International Fiduciary Withholding Certificate',
    type: 'tax',
    category: 'tax',
    date: '2025-02-15',
    fileSize: '1.2 MB PDF',
    period: 'Tax Year 2024',
    downloadUrl: '#tax-1042s-2024',
    isEncrypted: true
  },
  {
    id: 'doc_2024_tax_06',
    title: '2024 Year-End Consolidated Tax Package & FBAR FinCEN 114 Attestation',
    type: 'tax',
    category: 'tax',
    date: '2025-02-28',
    fileSize: '5.4 MB PDF',
    period: 'Tax Year 2024',
    downloadUrl: '#tax-package-2024',
    isEncrypted: true
  },
  {
    id: 'doc_2024_stmt_01',
    title: '2024 Year-End Consolidated Annual Account Statement',
    type: 'statement',
    category: 'statement',
    date: '2024-12-31',
    fileSize: '3.9 MB PDF',
    period: 'Jan 01, 2024 - Dec 31, 2024',
    downloadUrl: '#statement-annual-2024',
    isEncrypted: true
  },

  // ----------------- 2023 COMPLETE TAX YEAR SUITE -----------------
  {
    id: 'doc_2023_tax_01',
    title: '2023 Form 1099-INT: Sovereign Interest Income ($742,880.50)',
    type: 'tax',
    category: 'tax',
    date: '2024-01-31',
    fileSize: '1.3 MB PDF',
    period: 'Tax Year 2023',
    downloadUrl: '#tax-1099-int-2023',
    isEncrypted: true
  },
  {
    id: 'doc_2023_tax_02',
    title: '2023 Form 1099-DIV: Trust & Portfolio Dividends ($395,000.00)',
    type: 'tax',
    category: 'tax',
    date: '2024-01-31',
    fileSize: '1.4 MB PDF',
    period: 'Tax Year 2023',
    downloadUrl: '#tax-1099-div-2023',
    isEncrypted: true
  },
  {
    id: 'doc_2023_tax_03',
    title: '2023 Form 1099-B: Proceeds From Brokerage & Barter ($410,000.00)',
    type: 'tax',
    category: 'tax',
    date: '2024-01-31',
    fileSize: '1.5 MB PDF',
    period: 'Tax Year 2023',
    downloadUrl: '#tax-1099-b-2023',
    isEncrypted: true
  },
  {
    id: 'doc_2023_tax_04',
    title: '2023 Schedule K-1 (Form 1041): Vance Sovereign Trust Allocation',
    type: 'tax',
    category: 'tax',
    date: '2024-02-15',
    fileSize: '1.9 MB PDF',
    period: 'Tax Year 2023',
    downloadUrl: '#tax-k1-2023',
    isEncrypted: true
  },
  {
    id: 'doc_2023_tax_05',
    title: '2023 Form 1042-S: International Fiduciary Withholding Certificate',
    type: 'tax',
    category: 'tax',
    date: '2024-02-15',
    fileSize: '1.1 MB PDF',
    period: 'Tax Year 2023',
    downloadUrl: '#tax-1042s-2023',
    isEncrypted: true
  },
  {
    id: 'doc_2023_tax_06',
    title: '2023 Year-End Consolidated Tax Package & FBAR FinCEN 114 Attestation',
    type: 'tax',
    category: 'tax',
    date: '2024-02-28',
    fileSize: '5.1 MB PDF',
    period: 'Tax Year 2023',
    downloadUrl: '#tax-package-2023',
    isEncrypted: true
  },
  {
    id: 'doc_2023_stmt_01',
    title: '2023 Year-End Consolidated Annual Account Statement',
    type: 'statement',
    category: 'statement',
    date: '2023-12-31',
    fileSize: '3.6 MB PDF',
    period: 'Jan 01, 2023 - Dec 31, 2023',
    downloadUrl: '#statement-annual-2023',
    isEncrypted: true
  },

  // ----------------- OFFICIAL CONFIRMATIONS & CERTIFICATES -----------------
  {
    id: 'doc_cert_ach_01',
    title: 'ACH Direct Settlement Advice - Bitfurytech Holdings ($997,863.00 USD)',
    type: 'confirmation',
    category: 'legal',
    date: '2026-09-23',
    fileSize: '410 KB PDF',
    downloadUrl: '#ach-confirm-2026-0923',
    isEncrypted: true
  },
  {
    id: 'doc_cert_01',
    title: 'Official SWIFT Wire Confirmation - Samlout Wildlife ($250,000 USD)',
    type: 'confirmation',
    category: 'legal',
    date: '2026-03-29',
    fileSize: '340 KB PDF',
    downloadUrl: '#wire-confirm-2026-0329',
    isEncrypted: true
  },
  {
    id: 'doc_cert_02',
    title: 'Institutional KYC Verification & Source of Wealth Sovereign Certificate',
    type: 'kyc_proof',
    category: 'legal',
    date: '2026-03-15',
    fileSize: '4.8 MB PDF',
    downloadUrl: '#kyc-attestation-client',
    isEncrypted: true
  }
];

export const INITIAL_MESSAGES: SecureMessage[] = [
  {
    id: 'msg_01_bitfury',
    subject: 'Bitfurytech Holdings ACH Inflow Confirmation & Balance Credit',
    category: 'Wire & Transfer',
    senderRole: 'officer',
    senderName: 'Sarah Jenkins (Compliance Lead)',
    timestamp: 'September 23, 2026 at 4:55 PM',
    preview: 'Ms. Jolie, the ACH credit batches from Bitfurytech Holdings ($997,863.00, $396,645.00, $600,000.00) have posted to your Checking account...',
    unread: true,
    priority: 'urgent',
    thread: [
      {
        id: 'th_01_b',
        sender: 'Sarah Jenkins (Compliance Lead)',
        senderRole: 'officer',
        text: 'Good afternoon Ms. Jolie. The scheduled ACH transfers from Bitfurytech Holdings have posted to your Checking account (••2741). In addition to the September 16 deposit of $9,646.00, three tranches ($997,863.00, $396,645.00, and $600,000.00) have cleared and settled immediately into your available balance ($2,008,654.00). An additional ACH deposit of $378,899.00 from Bitfurytech Holdings is currently pending clearing overnight.',
        timestamp: 'September 23, 2026 at 4:55 PM'
      }
    ]
  },
  {
    id: 'msg_01',
    subject: 'Vance Global Conservation Trust Wire Clearance & Confirmation',
    category: 'Wire & Transfer',
    senderRole: 'officer',
    senderName: 'Sarah Jenkins (Compliance Lead)',
    timestamp: 'March 29, 2026 at 11:35 AM',
    preview: 'Ms. Jolie, the outgoing SWIFT wire for $250,000 to the Cambodia Wildlife Conservation desk has cleared...',
    unread: false,
    priority: 'urgent',
    thread: [
      {
        id: 'th_01',
        sender: 'Angelina Jolie',
        senderRole: 'client',
        text: 'Good morning Sarah. I authorized the monthly humanitarian conservation wire for $250,000 to the Samlout project. Kindly ensure immediate settlement.',
        timestamp: 'March 29, 2026 at 11:20 AM'
      },
      {
        id: 'th_02',
        sender: 'Sarah Jenkins (Compliance Lead)',
        senderRole: 'officer',
        text: 'Good morning Ms. Jolie. The $250,000 SWIFT wire has cleared our Tier-3 compliance protocols and Fedwire settlement is complete. The official advice certificate is available in your Statements vault.',
        timestamp: 'March 29, 2026 at 11:35 AM'
      }
    ]
  },
  {
    id: 'msg_02',
    subject: '3-Year Sovereign Performance & 2023–2025 Tax Reporting Summary',
    category: 'Wealth Management',
    senderRole: 'officer',
    senderName: 'Lord Henry Sterling (Senior Private Banker)',
    timestamp: 'March 25, 2026 at 2:15 PM',
    preview: 'Dear Angelina, looking at our 3-year performance spanning 2023 to 2026...',
    unread: false,
    priority: 'normal',
    thread: [
      {
        id: 'th_10',
        sender: 'Lord Henry Sterling (Senior Private Banker)',
        senderRole: 'officer',
        text: 'Dear Angelina, all certified 1099-INT, 1099-DIV, and Schedule K-1 forms for Tax Years 2023, 2024, and 2025 are finalized in your tax repository along with historical corporate distributions.',
        timestamp: 'March 25, 2026 at 2:15 PM'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_ai_01',
    title: 'AI Sentinel: High-Value Wire Clearance Verified',
    message: 'AI behavioral engine confirmed outgoing wire anomaly of 50,000.00 USD matched trusted conservation beneficiary baseline with zero fraud indicators.',
    category: 'ai_alert',
    type: 'ai_alert',
    severity: 'medium',
    timestamp: 'September 24, 2026',
    read: false,
    linkRoute: '/notifications'
  },
  {
    id: 'notif_00_bitfury',
    title: 'ACH Credit Deposits Settled from Bitfurytech Holdings',
    message: 'Three ACH tranches totaling $1,994,508.00 USD ($997,863.00, $396,645.00, $600,000.00) from Bitfurytech Holdings have settled. Pending ACH: $378,899.00 USD.',
    category: 'transaction',
    severity: 'low',
    timestamp: 'September 23, 2026',
    read: false,
    linkRoute: '/transactions'
  },
  {
    id: 'notif_00_bitfury_sep16',
    title: 'ACH Deposit Credited ($9,646.00 USD)',
    message: 'Direct ACH deposit of $9,646.00 USD from Bitfurytech Holdings has posted to Checking ••2741.',
    category: 'transaction',
    severity: 'low',
    timestamp: 'September 16, 2026',
    read: false,
    linkRoute: '/transactions'
  },
  {
    id: 'notif_01',
    title: 'International SWIFT Wire Settled',
    message: 'Wire transfer #NT-SWIFT-2026-03291 ($250,000.00 USD) to Vance Global Conservation Trust settled successfully.',
    category: 'transaction',
    severity: 'low',
    timestamp: 'March 29, 2026',
    read: true,
    linkRoute: '/transfers'
  },
  {
    id: 'notif_03',
    title: 'Tax Documents Available for Download',
    message: 'Official IRS Form 1099-INT, 1099-DIV, and 1099-B filings for Tax Years 2023, 2024, and 2025 are ready.',
    category: 'account',
    severity: 'low',
    timestamp: 'March 15, 2026',
    read: true,
    linkRoute: '/documents'
  },
  {
    id: 'notif_04',
    title: 'Hardware Biometric Enclave Verified',
    message: 'MacBook Pro 16" (Private Studio) was authenticated with FaceID cryptotoken fp_a982f1bc.',
    category: 'security',
    severity: 'medium',
    timestamp: 'March 15, 2026',
    read: true,
    linkRoute: '/security-settings'
  }
];

export const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'aud_00',
    timestamp: '2026-09-23 16:50:10',
    event: 'ACH_TRANSACTION_PROCESSED',
    category: 'TRANSFER_INITIATION',
    ipAddress: '198.51.100.44',
    location: 'Los Angeles, CA',
    device: 'MacBook Pro 16" (Private Studio)',
    status: 'SUCCESS',
    threatScore: 2,
    details: 'ACH Inflow from Bitfurytech Holdings ($378,899.00 USD) queued for standard ACH settlement.'
  },
  {
    id: 'aud_01',
    timestamp: '2026-09-23 14:20:00',
    event: 'ACH_CREDIT_SETTLED',
    category: 'TRANSFER_INITIATION',
    ipAddress: '198.51.100.44',
    location: 'Los Angeles, CA',
    device: 'MacBook Pro 16" (Private Studio)',
    status: 'SUCCESS',
    threatScore: 2,
    details: 'ACH Credit from Bitfurytech Holdings ($600,000.00 USD) settled and posted to balance.'
  },
  {
    id: 'aud_02',
    timestamp: '2026-09-23 09:15:00',
    event: 'PORTAL_LOGIN_2FA_SUCCESS',
    category: 'LOGIN',
    ipAddress: '198.51.100.44',
    location: 'Los Angeles, CA',
    device: 'MacBook Pro 16" (Private Studio)',
    status: 'SUCCESS',
    threatScore: 2,
    details: 'User alexander.wright authenticated successfully via Account Number (••2741) and password. Session established.'
  }
];

export const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: 'sess_01',
    device: 'MacBook Pro 16" M3 Max (Private Studio)',
    ip: '198.51.100.44',
    location: 'Los Angeles, CA, USA',
    startedAt: 'September 24, 2026 at 11:05 AM',
    lastActivity: 'Active now (Current session)',
    isCurrent: true
  },
  {
    id: 'sess_02',
    device: 'iPhone 16 Pro (Vance Global Secure Key)',
    ip: '172.56.21.90',
    location: 'Los Angeles, CA, USA',
    startedAt: 'September 24, 2026 at 09:12 AM',
    lastActivity: '2 hours ago',
    isCurrent: false
  }
];

export const INITIAL_CHECK_DEPOSITS: import('../types/banking').CheckDepositRecord[] = [
  {
    id: 'chk_dep_01',
    accountId: 'acc_chk_01',
    accountName: 'Angelina Jolie Private Wealth Reserve Checking',
    amount: 150000.00,
    checkNumber: '8820',
    status: 'cleared',
    depositDate: '2026-03-18 10:14:00',
    fundsAvailabilityDate: '2026-03-18 14:00:00',
    referenceNumber: 'CHK-DEP-2026-0318'
  }
];

export const INITIAL_STOPPED_CHECKS: import('../types/banking').StopPaymentRecord[] = [];

export const INITIAL_CHECKBOOK_ORDERS: import('../types/banking').CheckbookOrderRecord[] = [
  {
    id: 'ord_chk_01',
    accountId: 'acc_chk_01',
    style: 'Executive Navy Blue',
    quantity: 200,
    startingCheckNumber: 1001,
    shippingAddress: '2620 Los Feliz Blvd, Los Angeles, CA 90027',
    orderedAt: '2026-03-10 09:40:00',
    trackingNumber: 'FDX-7749-0192-US',
    status: 'delivered'
  }
];

export const INITIAL_TRAVEL_NOTICES: import('../types/banking').TravelNotice[] = [
  {
    id: 'trv_01',
    cardId: 'crd_01',
    cardName: 'Northern Trust Sovereign Black Metal Reserve',
    destinationCountries: ['Switzerland', 'France', 'Cambodia', 'Italy'],
    departureDate: '2026-10-05',
    returnDate: '2026-10-28',
    contactPhone: '+1 (310) 555-8920',
    status: 'scheduled',
    createdAt: '2026-09-20'
  }
];

export const INITIAL_CREDIT_LINE: import('../types/banking').CreditLineFacility = {
  facilityId: 'CRE-LOMB-8820-01',
  facilityName: 'Sovereign Lombard & Securities-Backed Credit Line',
  totalLimit: 5000000.00,
  drawnAmount: 0.00,
  availableLimit: 5000000.00,
  apr: 6.75,
  primeRate: 6.50,
  spread: 0.25,
  linkedCollateralValue: 2008654.00,
  minimumMonthlyPayment: 0.00,
  paymentDueDate: '2026-10-15'
};

export const INITIAL_STANDING_ORDERS: import('../types/banking').StandingOrder[] = [
  {
    id: 'sto_01',
    fromAccountId: 'acc_chk_01',
    fromAccountName: 'Angelina Jolie Private Wealth Reserve Checking',
    beneficiaryName: 'Los Feliz Historic Estate Management',
    beneficiaryAccount: '9920194821',
    beneficiaryBank: 'JPMorgan Chase LA',
    amount: 42100.00,
    currency: 'USD',
    frequency: 'monthly',
    nextExecutionDate: '2026-10-01',
    status: 'active',
    purpose: 'Monthly Estate Management & Security Staff Retainer',
    createdAt: '2026-01-15'
  }
];

export const INITIAL_CASH_SWEEP: import('../types/banking').CashSweepRule = {
  enabled: false,
  sourceAccountId: 'acc_chk_01',
  targetAccountId: 'acc_sav_01',
  thresholdAmount: 100000.00,
  frequency: 'daily',
  lastExecuted: '2026-09-23 23:59:00',
  totalSweptYTD: 0.00
};

export const INITIAL_CD_RECORDS: import('../types/banking').CdAccountRecord[] = [
  {
    id: 'cd_rec_01',
    accountId: 'acc_cd_01',
    accountNumber: '331892014755',
    certificateName: '24-Month Sovereign Fixed CD (5.40% APY)',
    principalAmount: 0.00,
    interestRateAPY: 5.40,
    termMonths: 24,
    issueDate: '2025-03-15',
    maturityDate: '2027-03-15',
    projectedInterestYield: 0.00,
    accruedInterestToDate: 0.00,
    maturityInstruction: 'renew_principal',
    payoutAccountId: 'acc_chk_01',
    penaltyForEarlyWithdrawal: '90 days of simple interest on principal withdrawn'
  }
];

export const INITIAL_BRANCH_LOCATIONS: import('../types/banking').BankBranchLocation[] = [
  {
    id: 'loc_la_01',
    name: 'Los Angeles Century City Private Wealth Enclave',
    type: 'Private Wealth Flagship',
    address: '1999 Avenue of the Stars, Suite 3200',
    city: 'Los Angeles',
    stateOrRegion: 'CA',
    country: 'United States',
    postalCode: '90067',
    phone: '+1 (310) 555-NTCO',
    hours: 'Mon-Fri: 8:30 AM - 5:30 PM PST',
    amenities: ['Private Wealth Suites', 'Safe Deposit Vault', 'Entertainment Advisory Desk', 'Foreign Currency Exchange'],
    hasSafeDepositBoxes: true,
    hasBullionVault: true,
    hasNotaryMedallion: true,
    hasAtm24h: true,
    coordinates: { lat: 34.0594, lng: -118.4180 }
  },
  {
    id: 'loc_ny_01',
    name: 'New York Wall Street Operations & Vault Enclave',
    type: 'Private Wealth Flagship',
    address: '1 Wall Street, Floor 48',
    city: 'New York',
    stateOrRegion: 'NY',
    country: 'United States',
    postalCode: '10005',
    phone: '+1 (212) 555-NTCO',
    hours: 'Mon-Fri: 8:30 AM - 5:30 PM EST',
    amenities: ['Private Advisory Suites', 'High-Security Safe Deposit Boxes', 'Bullion Vault Enclave', '24/7 Biometric ATM'],
    hasSafeDepositBoxes: true,
    hasBullionVault: true,
    hasNotaryMedallion: true,
    hasAtm24h: true,
    coordinates: { lat: 40.7071, lng: -74.0090 }
  },
  {
    id: 'loc_chi_01',
    name: 'Chicago LaSalle Global Headquarters',
    type: 'Private Wealth Flagship',
    address: '50 South LaSalle Street',
    city: 'Chicago',
    stateOrRegion: 'IL',
    country: 'United States',
    postalCode: '60603',
    phone: '+1 (312) 630-6000',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM CST',
    amenities: ['Executive Boardrooms', 'Safe Deposit Vault', 'Trust & Estate Advisory', 'Foreign Currency Cash Exchange'],
    hasSafeDepositBoxes: true,
    hasBullionVault: false,
    hasNotaryMedallion: true,
    hasAtm24h: true,
    coordinates: { lat: 41.8812, lng: -87.6324 }
  },
  {
    id: 'loc_gva_01',
    name: 'Geneva Private Wealth & Swiss Custody',
    type: 'Custody & Bullion Vault',
    address: '14 Rue du Rhône, Suite 600',
    city: 'Geneva',
    stateOrRegion: 'Geneva',
    country: 'Switzerland',
    postalCode: '1204',
    phone: '+41 22 819 4000',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM CET',
    amenities: ['Swiss Bank Vault Custody', 'Allocated Physical Gold Bullion', 'Multi-Currency Clearing Desk'],
    hasSafeDepositBoxes: true,
    hasBullionVault: true,
    hasNotaryMedallion: true,
    hasAtm24h: false,
    coordinates: { lat: 46.2044, lng: 6.1432 }
  }
];

export const INITIAL_WIRE_LIMITS: import('../types/banking').WireLimitSettings = {
  dailyFedwireLimit: 5000000.00,
  singleWireLimit: 2500000.00,
  swiftDailyLimit: 2500000.00,
  internalSweepLimit: 50000000.00,
  todayFedwireUsed: 0.00,
  tempIncreaseActive: false
};
