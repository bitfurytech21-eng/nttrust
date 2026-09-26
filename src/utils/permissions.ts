import { UserProfile, PermissionAction, PermissionResource, PermissionDefinition, RoleDefinition } from '../types/banking';

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // --- 1. VIEW PERMISSIONS ---
  {
    id: 'view:dashboard',
    name: 'View Dashboard',
    action: 'view',
    resource: 'dashboard',
    category: 'View',
    description: 'Access the main client or operations dashboard and portfolio summaries.'
  },
  {
    id: 'view:accounts',
    name: 'View Accounts',
    action: 'view',
    resource: 'accounts',
    category: 'View',
    description: 'Inspect depository, custody, and treasury account details and balances.'
  },
  {
    id: 'view:transactions',
    name: 'View Transactions',
    action: 'view',
    resource: 'transactions',
    category: 'View',
    description: 'Access real-time transaction history, clearing slips, and receipts.'
  },
  {
    id: 'view:transfers',
    name: 'View Transfers',
    action: 'view',
    resource: 'transfers',
    category: 'View',
    description: 'View Fedwire, ACH, and internal ledger transfer statuses.'
  },
  {
    id: 'view:cards',
    name: 'View Cards',
    action: 'view',
    resource: 'cards',
    category: 'View',
    description: 'Access debit card numbers, CVVs, and spending status.'
  },
  {
    id: 'view:documents',
    name: 'View Documents & Tax Forms',
    action: 'view',
    resource: 'documents',
    category: 'View',
    description: 'Download monthly bank statements and official IRS 1099 tax forms.'
  },
  {
    id: 'view:messages',
    name: 'View Messages',
    action: 'view',
    resource: 'messages',
    category: 'View',
    description: 'Read secure end-to-end encrypted concierge communications.'
  },
  {
    id: 'view:audit_logs',
    name: 'View SIEM Audit Logs',
    action: 'view',
    resource: 'audit_logs',
    category: 'View',
    description: 'Audit immutable external SQL regulatory SIEM logs and access traces.'
  },
  {
    id: 'view:customers',
    name: 'View Customer Profiles',
    action: 'view',
    resource: 'customers',
    category: 'View',
    description: 'Browse client directory, accredited CIF identity files, and accounts.'
  },
  {
    id: 'view:notifications',
    name: 'View Security Notifications',
    action: 'view',
    resource: 'notifications',
    category: 'View',
    description: 'Access real-time security alerts and institutional notices.'
  },
  {
    id: 'view:profile',
    name: 'View Personal Profile',
    action: 'view',
    resource: 'profile',
    category: 'View',
    description: 'Inspect personal CIF profile, address, and accredited tier.'
  },

  // --- 2. CREATE PERMISSIONS ---
  {
    id: 'create:transfers',
    name: 'Initiate Transfers & Fedwires',
    action: 'create',
    resource: 'transfers',
    category: 'Create',
    description: 'Authorize and transmit external wires and internal liquidity transfers.'
  },
  {
    id: 'create:transactions',
    name: 'Create Depository & Bill Payments',
    action: 'create',
    resource: 'transactions',
    category: 'Create',
    description: 'Initiate payments, check deposits, and ledger transactions.'
  },
  {
    id: 'create:accounts',
    name: 'Open New Accounts',
    action: 'create',
    resource: 'accounts',
    category: 'Create',
    description: 'Provision new depository, savings, and investment portfolio accounts.'
  },
  {
    id: 'create:users',
    name: 'Onboard New Users',
    action: 'create',
    resource: 'customers',
    category: 'Create',
    description: 'Create new accredited client profiles and assign credentials.'
  },
  {
    id: 'create:cards',
    name: 'Issue New Cards',
    action: 'create',
    resource: 'cards',
    category: 'Create',
    description: 'Order physical and instant virtual Northern Trust cards.'
  },
  {
    id: 'create:beneficiaries',
    name: 'Register Beneficiaries',
    action: 'create',
    resource: 'beneficiaries',
    category: 'Create',
    description: 'Add new domestic and international wire beneficiaries.'
  },
  {
    id: 'create:messages',
    name: 'Compose Secure Messages',
    action: 'create',
    resource: 'messages',
    category: 'Create',
    description: 'Compose and transmit encrypted concierge communications.'
  },

  // --- 3. EDIT PERMISSIONS ---
  {
    id: 'edit:profile',
    name: 'Edit Personal Profile',
    action: 'edit',
    resource: 'profile',
    category: 'Edit',
    description: 'Update phone number, mailing address, and contact details.'
  },
  {
    id: 'edit:accounts',
    name: 'Edit Account Configurations',
    action: 'edit',
    resource: 'accounts',
    category: 'Edit',
    description: 'Update account names, spending alerts, and color themes.'
  },
  {
    id: 'edit:customers',
    name: 'Edit Customer Directory',
    action: 'edit',
    resource: 'customers',
    category: 'Edit',
    description: 'Modify accredited client profiles, contact data, and photos.'
  },
  {
    id: 'edit:cards',
    name: 'Edit Card Controls & Limits',
    action: 'edit',
    resource: 'cards',
    category: 'Edit',
    description: 'Freeze/unfreeze cards and adjust daily spending and ATM limits.'
  },
  {
    id: 'edit:security',
    name: 'Edit Security & 2FA Settings',
    action: 'edit',
    resource: 'security',
    category: 'Edit',
    description: 'Configure multi-factor authentication, security keys, and passwords.'
  },
  {
    id: 'edit:beneficiaries',
    name: 'Edit Beneficiary Details',
    action: 'edit',
    resource: 'beneficiaries',
    category: 'Edit',
    description: 'Modify saved beneficiary routing information and nicknames.'
  },

  // --- 4. DELETE PERMISSIONS ---
  {
    id: 'delete:beneficiaries',
    name: 'Delete Beneficiaries',
    action: 'delete',
    resource: 'beneficiaries',
    category: 'Delete',
    description: 'Remove saved wire payees and external bank routing instructions.'
  },
  {
    id: 'delete:notifications',
    name: 'Delete Notifications',
    action: 'delete',
    resource: 'notifications',
    category: 'Delete',
    description: 'Purge security alerts and activity notices from feed.'
  },
  {
    id: 'delete:records',
    name: 'Archive / Delete Records',
    action: 'delete',
    resource: 'documents',
    category: 'Delete',
    description: 'Remove authorized documents and standing orders.'
  },
  {
    id: 'delete:users',
    name: 'Delete / Suspend Users',
    action: 'delete',
    resource: 'customers',
    category: 'Delete',
    description: 'Remove or archive accredited user profiles from registry.'
  },

  // --- 5. MANAGE PERMISSIONS ---
  {
    id: 'manage:users',
    name: 'Manage User Accounts & Security',
    action: 'manage',
    resource: 'customers',
    category: 'Manage',
    description: 'Lock/unlock accounts, enforce password resets, and suspend access.'
  },
  {
    id: 'manage:roles',
    name: 'Manage Roles & Permissions',
    action: 'manage',
    resource: 'roles',
    category: 'Manage',
    description: 'Assign and customize permission-based access control rules.'
  },
  {
    id: 'manage:kyc',
    name: 'Manage KYC Compliance',
    action: 'manage',
    resource: 'customers',
    category: 'Manage',
    description: 'Review and approve/reject Tier 1-3 KYC verification statuses.'
  },
  {
    id: 'manage:ledger',
    name: 'Manage Central Bank Ledger',
    action: 'manage',
    resource: 'ledger',
    category: 'Manage',
    description: 'Perform ledger adjustments and apply FinCEN legal hold freezes.'
  },
  {
    id: 'manage:system',
    name: 'Manage System & Infrastructure',
    action: 'manage',
    resource: 'system',
    category: 'Manage',
    description: 'Configure institutional clearance enclave parameters.'
  },

  // --- 6. FULL ACCESS ---
  {
    id: 'full_access',
    name: 'Supervisory Full Access',
    action: 'full_access',
    resource: 'system',
    category: 'Full Access',
    description: 'Unrestricted supervisory authority across all bank features and ledgers.'
  }
];

export const SYSTEM_ROLES: RoleDefinition[] = [
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
    description: 'View-only access for family beneficiaries or trustees; cannot initiate transfers.',
    isSystem: true,
    defaultPermissions: [
      'view:dashboard',
      'view:accounts',
      'view:transactions',
      'view:documents'
    ]
  }
];

/**
 * Returns effective permission strings for a user profile
 */
export function getEffectivePermissions(user: UserProfile | null): string[] {
  if (!user) return [];

  // If user profile has custom explicit permissions, return them
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }

  // Otherwise, fallback to the role's default permissions
  const roleDef = SYSTEM_ROLES.find(r => r.id === user.role);
  if (roleDef) {
    return roleDef.defaultPermissions;
  }

  // Default fallback for client
  if (user.role === 'admin') {
    return ['full_access'];
  }

  const clientRole = SYSTEM_ROLES.find(r => r.id === 'client');
  return clientRole ? clientRole.defaultPermissions : [];
}

/**
 * Checks if a user has a specific permission
 */
export function hasPermission(
  user: UserProfile | null,
  required: string | { action: PermissionAction; resource?: PermissionResource }
): boolean {
  if (!user) return false;

  const permissions = getEffectivePermissions(user);

  // If user has full_access, permit everything
  if (permissions.includes('full_access') || permissions.includes('*')) {
    return true;
  }

  // Normalize requirement
  let targetPermission = typeof required === 'string' ? required : `${required.action}:${required.resource || '*'}`;
  const [reqAction, reqResource] = targetPermission.split(':');

  if (targetPermission === 'full_access') {
    return permissions.includes('full_access');
  }

  // Exact match
  if (permissions.includes(targetPermission)) {
    return true;
  }

  // Action wildcard (e.g. 'view:*' matches 'view:transfers')
  if (permissions.includes(`${reqAction}:*`)) {
    return true;
  }

  return false;
}

/**
 * Helper to check route permissions
 */
export function isRoutePermitted(user: UserProfile | null, route: string): { permitted: boolean; requiredPermission?: string } {
  if (!user) return { permitted: false, requiredPermission: 'view:dashboard' };

  const permissions = getEffectivePermissions(user);
  if (permissions.includes('full_access') || permissions.includes('*')) {
    return { permitted: true };
  }

  // Admin Routes
  if (route.startsWith('/admin')) {
    if (user.role === 'client' || user.role === 'restricted_client') {
      return { permitted: false, requiredPermission: 'manage:users' };
    }
    if (route === '/admin/audit' && !hasPermission(user, 'view:audit_logs')) {
      return { permitted: false, requiredPermission: 'view:audit_logs' };
    }
    if (route === '/admin/customers' && !hasPermission(user, 'view:customers')) {
      return { permitted: false, requiredPermission: 'view:customers' };
    }
    if (route === '/admin/accounts' && !hasPermission(user, 'view:accounts')) {
      return { permitted: false, requiredPermission: 'view:accounts' };
    }
    if (route === '/admin/transactions' && !hasPermission(user, 'view:transactions')) {
      return { permitted: false, requiredPermission: 'view:transactions' };
    }
    if (route === '/admin/roles' && !hasPermission(user, 'manage:roles')) {
      return { permitted: false, requiredPermission: 'manage:roles' };
    }
    if (route === '/admin/transfers' && !hasPermission(user, 'view:transfers') && !hasPermission(user, 'manage:ledger')) {
      return { permitted: false, requiredPermission: 'view:transfers' };
    }
    if (route === '/admin/documents' && !hasPermission(user, 'view:documents')) {
      return { permitted: false, requiredPermission: 'view:documents' };
    }
    if (route === '/admin/support' && !hasPermission(user, 'view:messages') && !hasPermission(user, 'manage:users')) {
      return { permitted: false, requiredPermission: 'view:messages' };
    }
    if (route === '/admin/authenticator' && !hasPermission(user, 'edit:security') && !hasPermission(user, 'manage:system')) {
      return { permitted: false, requiredPermission: 'edit:security' };
    }
    if ((route === '/admin' || route === '/admin/dashboard') && !hasPermission(user, 'view:dashboard') && !hasPermission(user, 'manage:system')) {
      return { permitted: false, requiredPermission: 'view:dashboard' };
    }
    return { permitted: true };
  }

  // Client Routes
  if ((route === '/dashboard' || route === '/') && !hasPermission(user, 'view:dashboard')) {
    return { permitted: false, requiredPermission: 'view:dashboard' };
  }
  if (route === '/accounts' && !hasPermission(user, 'view:accounts')) {
    return { permitted: false, requiredPermission: 'view:accounts' };
  }
  if (route === '/transactions' && !hasPermission(user, 'view:transactions')) {
    return { permitted: false, requiredPermission: 'view:transactions' };
  }
  if ((route === '/transfers' || route.startsWith('/transfers')) && !hasPermission(user, 'view:transfers') && !hasPermission(user, 'create:transfers')) {
    return { permitted: false, requiredPermission: 'view:transfers' };
  }
  if (route === '/payments' && !hasPermission(user, 'create:transactions') && !hasPermission(user, 'view:transactions')) {
    return { permitted: false, requiredPermission: 'create:transactions' };
  }
  if ((route === '/cards' || route.startsWith('/cards')) && !hasPermission(user, 'view:cards')) {
    return { permitted: false, requiredPermission: 'view:cards' };
  }
  if ((route === '/documents' || route === '/tax' || route.startsWith('/tax')) && !hasPermission(user, 'view:documents')) {
    return { permitted: false, requiredPermission: 'view:documents' };
  }
  if (route === '/beneficiaries' && !hasPermission(user, 'create:beneficiaries') && !hasPermission(user, 'view:accounts')) {
    return { permitted: false, requiredPermission: 'view:accounts' };
  }
  if (route === '/messages' && !hasPermission(user, 'view:messages')) {
    return { permitted: false, requiredPermission: 'view:messages' };
  }
  if (route === '/notifications' && !hasPermission(user, 'view:notifications') && !hasPermission(user, 'view:dashboard')) {
    return { permitted: false, requiredPermission: 'view:notifications' };
  }
  if ((route === '/profile' || route === '/settings') && !hasPermission(user, 'view:profile') && !hasPermission(user, 'edit:profile')) {
    return { permitted: false, requiredPermission: 'view:profile' };
  }
  if (route === '/security-settings' && !hasPermission(user, 'edit:security')) {
    return { permitted: false, requiredPermission: 'edit:security' };
  }
  if ((route === '/checks' || route.startsWith('/checks')) && !hasPermission(user, 'create:transactions') && !hasPermission(user, 'view:accounts')) {
    return { permitted: false, requiredPermission: 'create:transactions' };
  }
  if ((route === '/fx' || route.startsWith('/fx')) && !hasPermission(user, 'view:transfers') && !hasPermission(user, 'create:transfers')) {
    return { permitted: false, requiredPermission: 'view:transfers' };
  }
  if ((route === '/lending' || route.startsWith('/lending') || route === '/credit') && !hasPermission(user, 'view:accounts')) {
    return { permitted: false, requiredPermission: 'view:accounts' };
  }

  return { permitted: true };
}
