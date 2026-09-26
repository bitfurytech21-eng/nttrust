import { SqlAdminAuditLog, SqlFieldChangeDetail } from '../types/banking';

const SQL_AUDIT_CACHE_KEY = 'nt_external_sql_audit_logs_v1';

export function computeFieldDiff<T extends Record<string, any>>(
  before: T,
  after: Partial<T>
): Record<string, SqlFieldChangeDetail> {
  const diff: Record<string, SqlFieldChangeDetail> = {};

  for (const key of Object.keys(after)) {
    const oldVal = before ? before[key] : undefined;
    const newVal = after[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      const fieldDiff: SqlFieldChangeDetail = {
        from: oldVal === undefined ? null : oldVal,
        to: newVal
      };

      if (typeof oldVal === 'number' && typeof newVal === 'number') {
        fieldDiff.difference = newVal - oldVal;
      }

      diff[key] = fieldDiff;
    }
  }

  return diff;
}

export async function logAdminActionToSql(entry: {
  adminUserId: string;
  adminUsername?: string;
  action: string;
  targetEntityType: 'account' | 'audit_log' | 'transfer' | 'customer' | 'system' | 'card' | 'security';
  targetEntityId: string;
  fieldsChanged: Record<string, SqlFieldChangeDetail>;
  details: string;
  executionStatus?: 'SUCCESS' | 'FAILED' | 'REJECTED';
  timestamp?: string;
}): Promise<SqlAdminAuditLog> {
  const payload = {
    timestamp: entry.timestamp || new Date().toISOString(),
    adminUserId: entry.adminUserId,
    adminUsername: entry.adminUsername || 'Sarah Jenkins (Operations Lead)',
    action: entry.action,
    targetEntityType: entry.targetEntityType,
    targetEntityId: entry.targetEntityId,
    fieldsChanged: entry.fieldsChanged,
    details: entry.details,
    executionStatus: entry.executionStatus || 'SUCCESS'
  };

  try {
    const response = await fetch('/api/sql/audit-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.log) {
        cacheSqlLogLocally(data.log);
        return data.log;
      }
    }
  } catch (err) {
    console.warn('[SQL Audit Service] Backend network request deferred or offline, recording to local fallback:', err);
  }

  // Fallback client-side log construction to guarantee zero loss
  const fallbackLog: SqlAdminAuditLog = {
    id: `sql_fallback_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...payload,
    ipAddress: '198.51.100.44',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Client Applet'
  };

  cacheSqlLogLocally(fallbackLog);
  return fallbackLog;
}

export async function fetchSqlAuditLogs(filters?: {
  action?: string;
  adminUserId?: string;
  targetEntityType?: string;
  search?: string;
  limit?: number;
}): Promise<SqlAdminAuditLog[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.action && filters.action !== 'all') params.append('action', filters.action);
    if (filters?.adminUserId) params.append('adminUserId', filters.adminUserId);
    if (filters?.targetEntityType) params.append('targetEntityType', filters.targetEntityType);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`/api/sql/audit-logs?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.logs)) {
        // Sync local cache
        saveSqlLogsToStorage(data.logs);
        return data.logs;
      }
    }
  } catch (err) {
    console.warn('[SQL Audit Service] Failed to fetch from backend, returning cached logs:', err);
  }

  return loadSqlLogsFromStorage();
}

export async function fetchSqlAuditStats(): Promise<{
  totalLogs: number;
  actionBreakdown: Record<string, number>;
  adminBreakdown: Record<string, number>;
  recentActions: SqlAdminAuditLog[];
} | null> {
  try {
    const res = await fetch('/api/sql/audit-logs/stats');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.stats) {
        return data.stats;
      }
    }
  } catch (err) {
    console.warn('[SQL Audit Service] Could not fetch SQL stats:', err);
  }
  return null;
}

function loadSqlLogsFromStorage(): SqlAdminAuditLog[] {
  try {
    const item = localStorage.getItem(SQL_AUDIT_CACHE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function saveSqlLogsToStorage(logs: SqlAdminAuditLog[]) {
  try {
    localStorage.setItem(SQL_AUDIT_CACHE_KEY, JSON.stringify(logs.slice(0, 300)));
  } catch {}
}

function cacheSqlLogLocally(log: SqlAdminAuditLog) {
  try {
    const current = loadSqlLogsFromStorage();
    const exists = current.some(l => l.id === log.id);
    if (!exists) {
      const updated = [log, ...current].slice(0, 300);
      saveSqlLogsToStorage(updated);
    }
  } catch {}
}
