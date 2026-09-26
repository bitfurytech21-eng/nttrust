import React, { useState, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  History,
  Search,
  Download,
  Database,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileCode,
  Eye,
  X
} from 'lucide-react';
import { SqlAdminAuditLog } from '../../types/banking';

export const AdminAuditView: React.FC = () => {
  const {
    auditLogs,
    sqlAuditLogs,
    fetchSqlAuditLogs,
    logAuditView
  } = useBanking();

  const [activeTab, setActiveTab] = useState<'sql_ledger' | 'telemetry'>('sql_ledger');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSqlLog, setSelectedSqlLog] = useState<SqlAdminAuditLog | null>(null);

  // Trigger automated SQL audit view logging on component mount
  useEffect(() => {
    logAuditView('Admin navigation to SIEM Security & Forensic Audit Logs.');
  }, [logAuditView]);

  const handleRefreshSql = async () => {
    setIsRefreshing(true);
    try {
      await fetchSqlAuditLogs();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Filter SQL Audit Logs
  const filteredSqlLogs = sqlAuditLogs.filter((log) => {
    const matchesSearch =
      (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.adminUserId || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.adminUsername || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.targetEntityId || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.fieldsChanged || {}).toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // Filter Legacy SIEM Telemetry Logs
  const filteredTelemetry = auditLogs.filter((log) => {
    const actionDesc = log.action || log.event || log.details || '';
    const ipStr = log.ip || log.ipAddress || '';
    const matchesSearch =
      actionDesc.toLowerCase().includes(search.toLowerCase()) ||
      ipStr.includes(search) ||
      log.location.toLowerCase().includes(search.toLowerCase()) ||
      log.device.toLowerCase().includes(search.toLowerCase());

    const risk = log.riskScore || (log.threatScore > 50 ? 'HIGH' : log.threatScore > 20 ? 'MEDIUM' : 'LOW');
    const matchesRisk = riskFilter === 'all' || risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleExportSqlCsv = () => {
    const headers = ['ID', 'Timestamp', 'Admin User ID', 'Admin Name', 'Action', 'Target Entity', 'Target ID', 'Specific Fields Changed', 'Details', 'Status'];
    const rows = filteredSqlLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.adminUserId}"`,
      `"${l.adminUsername}"`,
      `"${l.action}"`,
      `"${l.targetEntityType}"`,
      `"${l.targetEntityId}"`,
      `"${JSON.stringify(l.fieldsChanged || {}).replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.executionStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Northern_Trust_External_SQL_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTelemetryCsv = () => {
    const headers = ['Timestamp', 'Action', 'Device', 'IP', 'Location', 'Status', 'RiskScore'];
    const rows = filteredTelemetry.map((l) => [
      l.timestamp,
      `"${l.action || l.event}"`,
      `"${l.device}"`,
      l.ip || l.ipAddress,
      `"${l.location}"`,
      l.status,
      l.riskScore || (l.threatScore > 50 ? 'HIGH' : 'LOW')
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Northern_Trust_SIEM_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFieldDiffBadges = (fieldsChanged: Record<string, any>) => {
    if (!fieldsChanged || Object.keys(fieldsChanged).length === 0) {
      return <span className="text-[#5F6670] italic text-[11px]">No fields modified</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5 max-w-md">
        {Object.entries(fieldsChanged).map(([fieldName, change]) => {
          const fromVal = change?.from !== undefined && change?.from !== null ? String(change.from) : 'null';
          const toVal = change?.to !== undefined && change?.to !== null ? String(change.to) : 'null';
          const hasDifference = change?.difference !== undefined;

          return (
            <div
              key={fieldName}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-[#D8DEE8] text-[10px] font-mono text-[#20242A]"
              title={`${fieldName}: ${fromVal} -> ${toVal}`}
            >
              <span className="font-semibold text-[#147A52]">{fieldName}:</span>
              <span className="text-red-600 line-through opacity-75">{fromVal.length > 15 ? fromVal.slice(0, 12) + '...' : fromVal}</span>
              <span>&rarr;</span>
              <span className="text-emerald-700 font-bold">{toVal.length > 18 ? toVal.slice(0, 15) + '...' : toVal}</span>
              {hasDifference && (
                <span className="ml-0.5 px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  {typeof change.difference === 'number' && change.difference > 0 ? `+${change.difference.toLocaleString()}` : change.difference}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-md border border-[#D8DEE8] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-1">
            <Database className="w-3.5 h-3.5" /> External Relational SQL Database &amp; SIEM Audit Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20242A] tracking-tight">
            Security &amp; Forensic System Logs
          </h1>
          <p className="text-xs text-[#5F6670] mt-0.5">
            Automated relational SQL ledger recording timestamps, admin user IDs, and specific field mutations across accounts, transfers, and audit views.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'sql_ledger' ? (
            <>
              <button
                type="button"
                onClick={handleRefreshSql}
                disabled={isRefreshing}
                className="px-3 py-2 rounded bg-white hover:bg-slate-50 text-[#20242A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#147A52] ${isRefreshing ? 'animate-spin' : ''}`} />
                Query Database
              </button>
              <button
                type="button"
                onClick={handleExportSqlCsv}
                className="px-4 py-2 rounded bg-[#147A52] hover:bg-[#0f6040] text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Export SQL CSV
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleExportTelemetryCsv}
              className="px-4 py-2 rounded bg-white hover:bg-slate-50 text-[#20242A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#147A52]" /> Export Forensic CSV
            </button>
          )}
        </div>
      </div>

      {/* Database Status Banner */}
      <div className="bg-[#F5F7FA] rounded-md border border-[#D8DEE8] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#20242A]">External SQL Database Engine:</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#D8DEE8] text-[#147A52] font-medium">
            SQLite 3 / admin_audit_logs
          </span>
          <span className="text-[#5F6670] hidden md:inline">
            ({sqlAuditLogs.length} total sensitive administrative records indexed)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#5F6670] font-mono text-[11px]">
          <span>Table: <strong className="text-[#20242A]">admin_audit_logs</strong></span>
          <span>Schema: <strong className="text-[#20242A]">ISO Timestamps &bull; Admin UID &bull; Field Diffs</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8DEE8] gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('sql_ledger')}
          className={`pb-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
            activeTab === 'sql_ledger'
              ? 'border-[#147A52] text-[#147A52]'
              : 'border-transparent text-[#5F6670] hover:text-[#20242A]'
          }`}
        >
          <Database className="w-4 h-4" />
          External SQL Database Audit Ledger ({sqlAuditLogs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`pb-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
            activeTab === 'telemetry'
              ? 'border-[#147A52] text-[#147A52]'
              : 'border-transparent text-[#5F6670] hover:text-[#20242A]'
          }`}
        >
          <History className="w-4 h-4" />
          SIEM Telemetry Stream ({auditLogs.length})
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-md p-4 border border-[#D8DEE8] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#5F6670] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'sql_ledger'
                ? 'Search SQL actions, admin user IDs, changed fields...'
                : 'Search audit actions, IP addresses, locations...'
            }
            className="w-full pl-10 pr-4 py-2 rounded bg-[#F5F7FA] border border-[#D8DEE8] text-[#20242A] text-xs placeholder-[#5F6670] focus:outline-none focus:border-[#147A52]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'sql_ledger' ? (
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All SQL Admin Actions</option>
              <option value="ACCOUNT_BALANCE_ADJUSTED">Account Balance Adjusted</option>
              <option value="ACCOUNT_STATUS_CHANGED">Account Status Changed</option>
              <option value="VIEW_AUDIT_LOGS">View Audit Logs</option>
              <option value="TRANSFER_APPROVED">Transfer Approved</option>
              <option value="TRANSFER_REJECTED">Transfer Rejected</option>
              <option value="CUSTOMER_KYC_STATUS_UPDATED">Customer KYC Updated</option>
              <option value="CUSTOMER_PROFILE_UPDATED">Customer Profile Updated</option>
              <option value="ADMIN_TOTP_KEY_UPDATED">Admin TOTP Key Updated</option>
              <option value="INTERNAL_COMMAND_EXECUTED">Internal Command Executed</option>
            </select>
          ) : (
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Risk Tiers</option>
              <option value="LOW">LOW Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="HIGH">HIGH Risk</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab === 'sql_ledger' ? (
        <div className="bg-white rounded-md border border-[#D8DEE8] overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-[#F5F7FA] border-b border-[#D8DEE8] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#20242A]">
              Relational SQL Audit Trail (Captured from BankingContext sensitive admin invocations)
            </span>
            <span className="text-[#5F6670] font-mono text-[11px]">
              Showing {filteredSqlLogs.length} of {sqlAuditLogs.length} SQL records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#D8DEE8] text-[#5F6670] uppercase font-mono text-[11px]">
                  <th className="py-3 px-4 font-bold whitespace-nowrap">Timestamp</th>
                  <th className="py-3 px-4 font-bold whitespace-nowrap">Admin User ID &amp; Name</th>
                  <th className="py-3 px-4 font-bold">Administrative Action</th>
                  <th className="py-3 px-4 font-bold">Target Entity</th>
                  <th className="py-3 px-4 font-bold min-w-[260px]">Specific Fields Changed</th>
                  <th className="py-3 px-4 text-center font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE8] text-[11px]">
                {filteredSqlLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#5F6670]">
                      <Database className="w-8 h-8 text-[#5F6670]/50 mx-auto mb-2" />
                      No SQL audit records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredSqlLogs.map((log) => {
                    const isAuditView = log.action === 'VIEW_AUDIT_LOGS';
                    const isBalanceAdj = log.action === 'ACCOUNT_BALANCE_ADJUSTED';
                    const isStatusMod = log.action === 'ACCOUNT_STATUS_CHANGED';

                    return (
                      <tr key={log.id} className="hover:bg-[#F5F7FA] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[#5F6670] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-[#20242A]">{log.adminUserId}</div>
                          <div className="text-[10px] text-[#5F6670] font-sans">{log.adminUsername}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              isAuditView
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : isBalanceAdj
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isStatusMod
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20'
                            }`}
                          >
                            {log.action}
                          </span>
                          <p className="text-[11px] text-[#5F6670] mt-1 max-w-xs truncate" title={log.details}>
                            {log.details}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-semibold text-[#20242A] uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 mr-1">
                            {log.targetEntityType}
                          </span>
                          <span className="text-[#5F6670]">{log.targetEntityId}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {renderFieldDiffBadges(log.fieldsChanged)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {log.executionStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSqlLog(log)}
                            className="p-1.5 rounded hover:bg-slate-200 text-[#5F6670] hover:text-[#20242A] transition-colors cursor-pointer"
                            title="Inspect SQL Row JSON"
                          >
                            <Eye className="w-4 h-4 text-[#147A52]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Legacy SIEM Telemetry Table */
        <div className="bg-white rounded-md border border-[#D8DEE8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#D8DEE8] text-[#5F6670] uppercase font-mono text-[11px]">
                  <th className="py-3 px-4 font-bold">Event Timestamp</th>
                  <th className="py-3 px-4 font-bold">Action Description</th>
                  <th className="py-3 px-4 font-bold">Origin Workstation / Browser</th>
                  <th className="py-3 px-4 font-bold">IP &amp; Geolocation</th>
                  <th className="py-3 px-4 text-center font-bold">Outcome</th>
                  <th className="py-3 px-4 text-right font-bold">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE8] font-mono text-[11px]">
                {filteredTelemetry.map((log) => {
                  const isSuccess = log.status === 'SUCCESS';
                  const risk = log.riskScore || (log.threatScore > 50 ? 'HIGH' : log.threatScore > 20 ? 'MEDIUM' : 'LOW');
                  return (
                    <tr key={log.id} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3.5 px-4 text-[#5F6670] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-[#20242A]">{log.action || log.event || log.details}</td>
                      <td className="py-3.5 px-4 text-[#5F6670]">{log.device}</td>
                      <td className="py-3.5 px-4 text-[#147A52]">{log.ip || log.ipAddress} ({log.location})</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20'
                              : 'bg-red-50 text-[#B42318] border border-red-200'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                            risk === 'LOW'
                              ? 'text-[#147A52] bg-[#147A52]/10 border border-[#147A52]/20'
                              : risk === 'MEDIUM'
                              ? 'text-[#B87500] bg-amber-50 border border-amber-200'
                              : 'text-[#B42318] bg-red-50 border border-red-200'
                          }`}
                        >
                          {risk} RISK
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SQL Record Inspector Modal */}
      {selectedSqlLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D8DEE8] max-w-2xl w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#D8DEE8] pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#147A52]" />
                <h3 className="font-bold text-base text-[#20242A]">
                  SQL Audit Record Inspector: {selectedSqlLog.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSqlLog(null)}
                className="p-1 rounded hover:bg-slate-100 text-[#5F6670] hover:text-[#20242A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#F5F7FA] p-3 rounded border border-[#D8DEE8]">
              <div>
                <span className="text-[#5F6670] block">Timestamp:</span>
                <span className="font-bold text-[#20242A]">{selectedSqlLog.timestamp}</span>
              </div>
              <div>
                <span className="text-[#5F6670] block">Admin User ID:</span>
                <span className="font-bold text-[#147A52]">{selectedSqlLog.adminUserId} ({selectedSqlLog.adminUsername})</span>
              </div>
              <div>
                <span className="text-[#5F6670] block">Action:</span>
                <span className="font-bold text-[#20242A]">{selectedSqlLog.action}</span>
              </div>
              <div>
                <span className="text-[#5F6670] block">Target Entity:</span>
                <span className="font-bold text-[#20242A]">{selectedSqlLog.targetEntityType} / {selectedSqlLog.targetEntityId}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#20242A] mb-1.5 uppercase font-mono">
                Specific Fields Changed (JSON Diff):
              </h4>
              <pre className="p-3 bg-[#1e2229] text-emerald-400 rounded text-xs font-mono overflow-x-auto max-h-52">
                {JSON.stringify(selectedSqlLog.fieldsChanged, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#20242A] mb-1.5 uppercase font-mono">
                Full Database Row:
              </h4>
              <pre className="p-3 bg-[#F5F7FA] text-[#20242A] border border-[#D8DEE8] rounded text-[11px] font-mono overflow-x-auto max-h-40">
                {JSON.stringify(selectedSqlLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSqlLog(null)}
                className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-[#20242A] text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
