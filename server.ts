import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { BankingDB, registerSSEClient, unregisterSSEClient, broadcastEvent } from './server/db.js';
import { ExternalSqlAuditDB } from './server/sqlDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// CORS & Real-time headers for local testing
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Healthcheck endpoints
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', database: 'online', clientsCount: 1 });
});

// ============================================================================
// Real-Time Banking Database API Endpoints
// ============================================================================

// 1. Get entire current banking state snapshot
app.get('/api/banking/state', (_req, res) => {
  res.json(BankingDB.getState());
});

// 2. Real-Time Server-Sent Events (SSE) Stream
app.get('/api/banking/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  registerSSEClient(clientId, res);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, timestamp: new Date().toISOString() })}\n\n`);

  // Heartbeat ping every 20 seconds to prevent timeout
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      unregisterSSEClient(clientId);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unregisterSSEClient(clientId);
  });
});

// ============================================================================
// Granular Permission Verification Helper
// ============================================================================
function checkPermission(req: any, requiredPermission: string): { allowed: boolean; reason?: string } {
  const callerId = req.headers['x-user-id'] || req.headers['x-admin-id'];
  const callerRole = (req.headers['x-user-role'] || req.headers['x-admin-role'] || '').toString().toLowerCase();

  let effectiveRole = callerRole;
  let customPermissions: string[] | undefined;

  if (callerId) {
    const user = BankingDB.getCustomer(callerId.toString());
    if (user) {
      effectiveRole = user.role;
      customPermissions = user.permissions;
    }
  }

  // Admin / Full Access root clearance
  if (effectiveRole === 'admin' || callerRole === 'admin' || (customPermissions && (customPermissions.includes('full_access') || customPermissions.includes('*')))) {
    return { allowed: true };
  }

  const [reqAction] = requiredPermission.split(':');

  // Check custom granular permissions if explicitly assigned to this user
  if (customPermissions && Array.isArray(customPermissions) && customPermissions.length > 0) {
    if (
      customPermissions.includes('full_access') ||
      customPermissions.includes('*') ||
      customPermissions.includes(requiredPermission) ||
      customPermissions.includes(`${reqAction}:*`)
    ) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Account '${callerId || 'User'}' lacks specific permission '${requiredPermission}'`
    };
  }

  // Lookup assigned role definition from database
  const roles = BankingDB.getRoles();
  const roleDef = roles.find(r => r.id === effectiveRole);
  if (roleDef) {
    const perms = roleDef.defaultPermissions || [];
    if (
      perms.includes('full_access') ||
      perms.includes('*') ||
      perms.includes(requiredPermission) ||
      perms.includes(`${reqAction}:*`)
    ) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Role '${roleDef.name}' is not authorized to execute '${requiredPermission}'`
    };
  }

  // Fallback checks for standard built-ins
  if (effectiveRole === 'restricted_client') {
    if (reqAction === 'create' || reqAction === 'edit' || reqAction === 'delete' || reqAction === 'manage') {
      return { allowed: false, reason: `Role 'restricted_client' is restricted to read-only access` };
    }
  }

  if (effectiveRole === 'auditor') {
    if (!requiredPermission.startsWith('view:')) {
      return { allowed: false, reason: `Role 'auditor' has read-only oversight clearance` };
    }
  }

  if (effectiveRole === 'client') {
    if (requiredPermission.startsWith('manage:') || requiredPermission === 'create:users' || requiredPermission === 'create:accounts') {
      return { allowed: false, reason: `Role 'client' does not have administrative clearance for '${requiredPermission}'` };
    }
  }

  return { allowed: true };
}

// 3. Create Transfer
app.post('/api/banking/transfers', (req, res) => {
  try {
    const perm = checkPermission(req, 'create:transfers');
    if (!perm.allowed) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: ${perm.reason || 'Insufficient permissions for fund transfers'}`,
        requiredPermission: 'create:transfers'
      });
    }

    const transfer = BankingDB.createTransfer(req.body);
    res.status(201).json({ success: true, transfer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || 'Transfer failed' });
  }
});

// 4. Approve Transfer (Admin)
app.post('/api/banking/transfers/:id/approve', (req, res) => {
  const perm = checkPermission(req, 'manage:ledger');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to approve transfers'}`,
      requiredPermission: 'manage:ledger'
    });
  }

  const result = BankingDB.approveTransfer(req.params.id, req.body?.notes);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Transfer not found or not in pending review' });
  }
  res.json({ success: true, transfer: result });
});

// 5. Reject Transfer (Admin)
app.post('/api/banking/transfers/:id/reject', (req, res) => {
  const perm = checkPermission(req, 'manage:ledger');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to reject transfers'}`,
      requiredPermission: 'manage:ledger'
    });
  }

  const result = BankingDB.rejectTransfer(req.params.id, req.body?.reason);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Transfer not found' });
  }
  res.json({ success: true, transfer: result });
});

// 6. Adjust Account Balance (Admin Ledger)
app.post('/api/banking/accounts/adjust', (req, res) => {
  const perm = checkPermission(req, 'manage:ledger');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions for ledger adjustments'}`,
      requiredPermission: 'manage:ledger'
    });
  }

  const { accountId, amount, note } = req.body;
  const updatedAccount = BankingDB.adjustAccountBalance(accountId, Number(amount), note);
  if (!updatedAccount) {
    return res.status(404).json({ success: false, error: 'Account not found' });
  }
  res.json({ success: true, account: updatedAccount });
});

// 7. Secure Account Deposit & Funding Inflow
app.post('/api/banking/deposit', (req, res) => {
  const perm = checkPermission(req, 'create:transactions');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions for deposit and funding operations'}`,
      requiredPermission: 'create:transactions'
    });
  }

  try {
    const {
      accountId,
      amount,
      fundingMethod = 'check',
      checkNumber,
      externalReference,
      sourceInstitution,
      description,
      memo,
      currency = 'USD'
    } = req.body;

    if (!accountId) {
      return res.status(400).json({ success: false, error: 'Destination account identifier is required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Deposit amount must be a positive number greater than $0.00' });
    }

    const callerId = (req.headers['x-user-id'] || '').toString();
    const callerRole = (req.headers['x-user-role'] || '').toString().toLowerCase();

    const result = BankingDB.creditAccount({
      accountId,
      userId: callerId,
      amount: numAmount,
      currency,
      fundingMethod: (fundingMethod as any) || 'check',
      externalReference,
      checkNumber,
      sourceInstitution,
      description,
      memo
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || 'Deposit verification failed' });
  }
});

// 7a. Direct Institutional Credit
app.post('/api/banking/credit', (req, res) => {
  const perm = checkPermission(req, 'create:transactions');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions for credit operations'}`,
      requiredPermission: 'create:transactions'
    });
  }

  try {
    const {
      accountId,
      amount,
      currency = 'USD',
      fundingMethod = 'direct_credit',
      externalReference,
      description,
      memo
    } = req.body;

    const callerId = (req.headers['x-user-id'] || '').toString();

    const result = BankingDB.creditAccount({
      accountId,
      userId: callerId,
      amount: Number(amount),
      currency,
      fundingMethod: (fundingMethod as any) || 'direct_credit',
      externalReference,
      description,
      memo
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || 'Credit operation failed' });
  }
});

// 7b. Outbound Withdrawal / Liquidation
app.post('/api/banking/withdraw', (req, res) => {
  const perm = checkPermission(req, 'create:transfers');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions for fund withdrawals'}`,
      requiredPermission: 'create:transfers'
    });
  }

  try {
    const { accountId, amount, method, destination, memo } = req.body;
    const result = BankingDB.withdrawFunds(accountId, Number(amount), method, destination, memo);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || 'Withdrawal failed' });
  }
});

// 8. Card Freeze Toggle
app.post('/api/banking/cards/:id/freeze', (req, res) => {
  const perm = checkPermission(req, 'edit:cards');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to modify card freeze state'}`,
      requiredPermission: 'edit:cards'
    });
  }

  const card = BankingDB.toggleCardFreeze(req.params.id);
  if (!card) {
    return res.status(404).json({ success: false, error: 'Card not found' });
  }
  res.json({ success: true, card });
});

// 9. Card Limits Update
app.post('/api/banking/cards/:id/limits', (req, res) => {
  const perm = checkPermission(req, 'edit:cards');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to modify card spending limits'}`,
      requiredPermission: 'edit:cards'
    });
  }

  const { dailySpend, dailyAtm } = req.body;
  const card = BankingDB.updateCardLimits(req.params.id, Number(dailySpend), Number(dailyAtm));
  if (!card) {
    return res.status(404).json({ success: false, error: 'Card not found' });
  }
  res.json({ success: true, card });
});

// 10. Update KYC Status
app.post('/api/banking/kyc', (req, res) => {
  const perm = checkPermission(req, 'manage:kyc');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to modify KYC compliance status'}`,
      requiredPermission: 'manage:kyc'
    });
  }

  const customers = BankingDB.updateKYC(req.body.status);
  res.json({ success: true, customers });
});

// 11. Update Customer Profile
app.post('/api/banking/customers/:id', (req, res) => {
  const callerId = req.headers['x-user-id'] || req.headers['x-admin-id'];
  const isSelf = callerId && (callerId === req.params.id || callerId === req.params.id.toLowerCase());
  const requiredPerm = isSelf ? 'edit:profile' : 'edit:customers';

  const perm = checkPermission(req, requiredPerm);
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to update customer profile'}`,
      requiredPermission: requiredPerm
    });
  }

  const customer = BankingDB.updateCustomerProfile(req.params.id, req.body);
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Customer not found' });
  }
  res.json({ success: true, customer });
});

// 11-RBAC. Update User Role & Specific Permissions
app.post('/api/banking/roles/permissions', (req, res) => {
  const perm = checkPermission(req, 'manage:roles');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to manage roles'}`,
      requiredPermission: 'manage:roles'
    });
  }

  const { userId, role, permissions } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ success: false, error: 'userId and role are required' });
  }

  const updatedCustomer = BankingDB.updateUserPermissions(userId, role, permissions);
  if (!updatedCustomer) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({ success: true, customer: updatedCustomer });
});

// 11-ROLES. Get All Defined System and Custom Roles
app.get('/api/banking/roles', (_req, res) => {
  res.json({ success: true, roles: BankingDB.getRoles() });
});

// 11-ROLES-CREATE. Create New Custom Role
app.post('/api/banking/roles', (req, res) => {
  const perm = checkPermission(req, 'manage:roles');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to create roles'}`,
      requiredPermission: 'manage:roles'
    });
  }

  try {
    const role = BankingDB.createRole(req.body);
    res.status(201).json({ success: true, role });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || 'Failed to create role' });
  }
});

// 11-ROLES-UPDATE. Update Role Permissions
app.put('/api/banking/roles/:id', (req, res) => {
  const perm = checkPermission(req, 'manage:roles');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to update role'}`,
      requiredPermission: 'manage:roles'
    });
  }

  const role = BankingDB.updateRole(req.params.id, req.body);
  if (!role) {
    return res.status(404).json({ success: false, error: 'Role not found' });
  }
  res.json({ success: true, role });
});

// 11-ROLES-DELETE. Delete Custom Role
app.delete('/api/banking/roles/:id', (req, res) => {
  const perm = checkPermission(req, 'manage:roles');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to delete role'}`,
      requiredPermission: 'manage:roles'
    });
  }

  const deleted = BankingDB.deleteRole(req.params.id);
  if (!deleted) {
    return res.status(400).json({ success: false, error: 'Cannot delete system role or role not found' });
  }
  res.json({ success: true, message: 'Role deleted successfully' });
});

// 11b. Create New Customer / User Profile with optional initial Bank Account
app.post('/api/banking/customers', (req, res) => {
  const perm = checkPermission(req, 'create:users');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to onboard new users'}`,
      requiredPermission: 'create:users'
    });
  }

  try {
    const result = BankingDB.createCustomer(req.body);
    res.status(201).json({
      success: true,
      customer: result.customer,
      account: result.account,
      transaction: result.transaction
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to create customer' });
  }
});

// 11c. Create New Bank Account
app.post('/api/banking/accounts', (req, res) => {
  const perm = checkPermission(req, 'create:accounts');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to provision new bank accounts'}`,
      requiredPermission: 'create:accounts'
    });
  }

  try {
    const result = BankingDB.createAccount(req.body);
    res.status(201).json({
      success: true,
      account: result.account,
      transaction: result.transaction
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to create account' });
  }
});

// 12. Send Secure Message
app.post('/api/banking/messages', (req, res) => {
  const perm = checkPermission(req, 'create:messages');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to compose messages'}`,
      requiredPermission: 'create:messages'
    });
  }

  const message = BankingDB.addMessage(req.body);
  res.status(201).json({ success: true, message });
});

// 13. Reply to Message
app.post('/api/banking/messages/:id/reply', (req, res) => {
  const perm = checkPermission(req, 'create:messages');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to send replies'}`,
      requiredPermission: 'create:messages'
    });
  }

  const { text, senderRole } = req.body;
  const message = BankingDB.replyMessage(req.params.id, text, senderRole || 'client');
  if (!message) {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }
  res.json({ success: true, message });
});

// 14. Pay Bill
app.post('/api/banking/bills/:id/pay', (req, res) => {
  const perm = checkPermission(req, 'create:transactions');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions for bill payments'}`,
      requiredPermission: 'create:transactions'
    });
  }

  const bill = BankingDB.payBill(req.params.id, req.body?.amount ? Number(req.body.amount) : undefined);
  if (!bill) {
    return res.status(404).json({ success: false, error: 'Bill not found' });
  }
  res.json({ success: true, bill });
});

// 14b. Delete Beneficiary
app.delete('/api/banking/beneficiaries/:id', (req, res) => {
  const perm = checkPermission(req, 'delete:beneficiaries');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to delete beneficiaries'}`,
      requiredPermission: 'delete:beneficiaries'
    });
  }

  const deleted = BankingDB.deleteBeneficiary(req.params.id);
  res.json({ success: deleted });
});

// 14c. Delete Notification
app.delete('/api/banking/notifications/:id', (req, res) => {
  const perm = checkPermission(req, 'delete:notifications');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions to delete notifications'}`,
      requiredPermission: 'delete:notifications'
    });
  }

  const deleted = BankingDB.deleteNotification(req.params.id);
  res.json({ success: deleted });
});

// 15. Reset Database
app.post('/api/banking/reset', (req, res) => {
  const perm = checkPermission(req, 'manage:system');
  if (!perm.allowed) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: ${perm.reason || 'Insufficient permissions for database reset'}`,
      requiredPermission: 'manage:system'
    });
  }

  const state = BankingDB.resetToDefault();
  res.json({ success: true, state });
});

// ============================================================================
// External SQL Database - Immutable Regulatory SIEM Audit Ledger Endpoints
// ============================================================================

// 16. Get SQL Audit Logs (Filterable by action, adminUserId, targetEntityType, search, limit)
app.get('/api/sql/audit-logs', (req, res) => {
  try {
    const { action, adminUserId, targetEntityType, search, limit } = req.query;
    const logs = ExternalSqlAuditDB.getAll({
      action: action as string | undefined,
      adminUserId: adminUserId as string | undefined,
      targetEntityType: targetEntityType as string | undefined,
      search: search as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : 200
    });
    res.json({ success: true, logs });
  } catch (err: any) {
    console.error('[SQL Audit DB Error]', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to query SQL database' });
  }
});

// 17. Insert Admin Audit Log into External SQL Database
app.post('/api/sql/audit-logs', (req, res) => {
  try {
    const {
      adminUserId,
      adminUsername,
      action,
      targetEntityType,
      targetEntityId,
      fieldsChanged,
      details,
      timestamp,
      executionStatus
    } = req.body;

    if (!adminUserId || !action || !targetEntityType || !targetEntityId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required audit parameters: adminUserId, action, targetEntityType, targetEntityId'
      });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '198.51.100.44';
    const userAgent = req.headers['user-agent'] || 'Northern Trust Institutional Portal';

    const logEntry = ExternalSqlAuditDB.insert({
      timestamp: timestamp || new Date().toISOString(),
      adminUserId,
      adminUsername: adminUsername || 'Sarah Jenkins (Operations Lead)',
      action,
      targetEntityType,
      targetEntityId,
      fieldsChanged: fieldsChanged || {},
      details: details || `Administrative action ${action} executed`,
      ipAddress: clientIp,
      userAgent,
      executionStatus: executionStatus || 'SUCCESS'
    });

    // Broadcast real-time SSE event to all connected admin consoles
    broadcastEvent('SQL_AUDIT_LOG_CREATED', { log: logEntry });

    res.status(201).json({ success: true, log: logEntry });
  } catch (err: any) {
    console.error('[SQL Audit DB Insert Error]', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to insert into SQL database' });
  }
});

// 18. Get External SQL Database Statistics & Action Breakdown
app.get('/api/sql/audit-logs/stats', (_req, res) => {
  try {
    const stats = ExternalSqlAuditDB.getStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    console.error('[SQL Audit DB Stats Error]', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to retrieve SQL database stats' });
  }
});

// ============================================================================
// Frontend Integration (Vite in Dev, Static in Prod)
// ============================================================================
async function startServer() {
  if (!isProduction) {
    // Development: Mount Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve pre-built files from dist
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { maxAge: '1h' }));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Northern Trust Server] Real-Time Banking Database running on http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server Error]', err);
  process.exit(1);
});
