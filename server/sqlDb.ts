import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { SqlAdminAuditLog } from '../src/types/banking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const SQL_DB_FILE = path.join(DATA_DIR, 'external_banking_audit.sqlite');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getSqlDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(SQL_DB_FILE);
    initializeSchema(dbInstance);
  }
  return dbInstance;
}

function initializeSchema(db: DatabaseSync) {
  // Create admin_audit_logs table in external SQL database
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      admin_user_id TEXT NOT NULL,
      admin_username TEXT NOT NULL,
      action TEXT NOT NULL,
      target_entity_type TEXT NOT NULL,
      target_entity_id TEXT NOT NULL,
      fields_changed TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      execution_status TEXT DEFAULT 'SUCCESS',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_audit_admin_user_id ON admin_audit_logs (admin_user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs (action);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON admin_audit_logs (timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_target_entity ON admin_audit_logs (target_entity_type, target_entity_id);
  `);

  // Seed sample initial regulatory logs if table is brand new
  const countRow = db.prepare('SELECT COUNT(*) as count FROM admin_audit_logs').get() as { count: number } | undefined;
  if (!countRow || countRow.count === 0) {
    seedInitialSqlLogs(db);
  }
}

function seedInitialSqlLogs(db: DatabaseSync) {
  const insertStmt = db.prepare(`
    INSERT INTO admin_audit_logs (
      id, timestamp, admin_user_id, admin_username, action,
      target_entity_type, target_entity_id, fields_changed,
      details, ip_address, user_agent, execution_status
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  const initialLogs = [
    {
      id: `sql_log_${Date.now() - 3600000 * 24}`,
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      admin_user_id: 'usr_admin_001',
      admin_username: 'Sarah Jenkins (Operations Lead)',
      action: 'SYSTEM_INITIALIZATION',
      target_entity_type: 'system',
      target_entity_id: 'sys_core_01',
      fields_changed: JSON.stringify({
        databaseState: { from: 'uninitialized', to: 'active', difference: 'Provisioned' },
        auditPipeline: { from: 'inactive', to: 'enforced', difference: 'Enabled' }
      }),
      details: 'Central External SQL Audit Ledger provisioned with immutable logging tables.',
      ip_address: '10.0.4.12',
      user_agent: 'Northern-Trust-Core/9.2',
      execution_status: 'SUCCESS'
    },
    {
      id: `sql_log_${Date.now() - 3600000 * 12}`,
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      admin_user_id: 'usr_admin_001',
      admin_username: 'Sarah Jenkins (Operations Lead)',
      action: 'ACCOUNT_LIMIT_REVIEW',
      target_entity_type: 'account',
      target_entity_id: 'acc_chk_01',
      fields_changed: JSON.stringify({
        monthlyLimit: { from: 2500000, to: 5000000, difference: 2500000 },
        reviewStatus: { from: 'pending', to: 'approved' }
      }),
      details: 'Authorized institutional monthly overdraft and transaction ceiling increase to $5,000,000.',
      ip_address: '10.0.4.12',
      user_agent: 'Northern-Trust-Admin-Enclave/1.0',
      execution_status: 'SUCCESS'
    },
    {
      id: `sql_log_${Date.now() - 3600000 * 3}`,
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      admin_user_id: 'usr_admin_001',
      admin_username: 'Sarah Jenkins (Operations Lead)',
      action: 'VIEW_AUDIT_LOGS',
      target_entity_type: 'audit_log',
      target_entity_id: 'audit_vault_all',
      fields_changed: JSON.stringify({
        accessMode: { from: null, to: 'FORENSIC_READ_ONLY' },
        sessionScope: { from: null, to: 'regulatory_compliance_inspection' }
      }),
      details: 'Audit trail inspection performed by Compliance Officer Sarah Jenkins.',
      ip_address: '10.0.4.12',
      user_agent: 'Northern-Trust-Admin-Enclave/1.0',
      execution_status: 'SUCCESS'
    }
  ];

  for (const log of initialLogs) {
    insertStmt.run(
      log.id,
      log.timestamp,
      log.admin_user_id,
      log.admin_username,
      log.action,
      log.target_entity_type,
      log.target_entity_id,
      log.fields_changed,
      log.details,
      log.ip_address,
      log.user_agent,
      log.execution_status
    );
  }
}

export const ExternalSqlAuditDB = {
  insert(logData: {
    id?: string;
    timestamp?: string;
    adminUserId: string;
    adminUsername?: string;
    action: string;
    targetEntityType: string;
    targetEntityId: string;
    fieldsChanged: Record<string, any>;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    executionStatus?: 'SUCCESS' | 'FAILED' | 'REJECTED';
  }): SqlAdminAuditLog {
    const db = getSqlDatabase();
    const id = logData.id || `sql_log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const timestamp = logData.timestamp || new Date().toISOString();
    const adminUsername = logData.adminUsername || 'Sarah Jenkins (Operations Lead)';
    const ipAddress = logData.ipAddress || '198.51.100.44';
    const userAgent = logData.userAgent || 'Northern Trust Institutional Portal (Admin Console)';
    const executionStatus = logData.executionStatus || 'SUCCESS';
    const fieldsChangedJson = JSON.stringify(logData.fieldsChanged || {});

    const stmt = db.prepare(`
      INSERT INTO admin_audit_logs (
        id, timestamp, admin_user_id, admin_username, action,
        target_entity_type, target_entity_id, fields_changed,
        details, ip_address, user_agent, execution_status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    stmt.run(
      id,
      timestamp,
      logData.adminUserId,
      adminUsername,
      logData.action,
      logData.targetEntityType,
      logData.targetEntityId,
      fieldsChangedJson,
      logData.details,
      ipAddress,
      userAgent,
      executionStatus
    );

    return {
      id,
      timestamp,
      adminUserId: logData.adminUserId,
      adminUsername,
      action: logData.action,
      targetEntityType: logData.targetEntityType as any,
      targetEntityId: logData.targetEntityId,
      fieldsChanged: logData.fieldsChanged,
      details: logData.details,
      ipAddress,
      userAgent,
      executionStatus
    };
  },

  getAll(options?: {
    action?: string;
    adminUserId?: string;
    targetEntityType?: string;
    search?: string;
    limit?: number;
  }): SqlAdminAuditLog[] {
    const db = getSqlDatabase();
    let query = 'SELECT * FROM admin_audit_logs';
    const conditions: string[] = [];
    const params: any[] = [];

    if (options?.action && options.action !== 'all') {
      conditions.push('action = ?');
      params.push(options.action);
    }

    if (options?.adminUserId) {
      conditions.push('admin_user_id = ?');
      params.push(options.adminUserId);
    }

    if (options?.targetEntityType) {
      conditions.push('target_entity_type = ?');
      params.push(options.targetEntityType);
    }

    if (options?.search) {
      conditions.push('(action LIKE ? OR details LIKE ? OR target_entity_id LIKE ? OR admin_username LIKE ? OR fields_changed LIKE ?)');
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY timestamp DESC';

    const limit = options?.limit || 200;
    query += ` LIMIT ${limit}`;

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map((row) => {
      let parsedFields: Record<string, any> = {};
      try {
        parsedFields = JSON.parse(row.fields_changed || '{}');
      } catch {
        parsedFields = { raw: row.fields_changed };
      }

      return {
        id: row.id,
        timestamp: row.timestamp,
        adminUserId: row.admin_user_id,
        adminUsername: row.admin_username,
        action: row.action,
        targetEntityType: row.target_entity_type,
        targetEntityId: row.target_entity_id,
        fieldsChanged: parsedFields,
        details: row.details,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        executionStatus: row.execution_status
      };
    });
  },

  getStats(): {
    totalLogs: number;
    actionBreakdown: Record<string, number>;
    adminBreakdown: Record<string, number>;
    recentActions: SqlAdminAuditLog[];
  } {
    const db = getSqlDatabase();
    const countRow = db.prepare('SELECT COUNT(*) as count FROM admin_audit_logs').get() as { count: number };
    const actionRows = db.prepare('SELECT action, COUNT(*) as count FROM admin_audit_logs GROUP BY action').all() as { action: string; count: number }[];
    const adminRows = db.prepare('SELECT admin_username, COUNT(*) as count FROM admin_audit_logs GROUP BY admin_username').all() as { admin_username: string; count: number }[];

    const actionBreakdown: Record<string, number> = {};
    for (const r of actionRows) {
      actionBreakdown[r.action] = r.count;
    }

    const adminBreakdown: Record<string, number> = {};
    for (const r of adminRows) {
      adminBreakdown[r.admin_username] = r.count;
    }

    const recentActions = this.getAll({ limit: 10 });

    return {
      totalLogs: countRow?.count || 0,
      actionBreakdown,
      adminBreakdown,
      recentActions
    };
  }
};
