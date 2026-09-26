import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Building2,
  Users,
  Wallet,
  ShieldAlert,
  SendHorizontal,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Sliders,
  Clock,
  UserPlus
} from 'lucide-react';
import { AdminCreateUserModal } from './AdminCreateUserModal';

export const AdminDashboardView: React.FC = () => {
  const {
    accounts,
    transfers,
    transactions,
    allCustomers,
    pendingTransfersCount,
    approveTransfer,
    rejectTransfer,
    navigateTo
  } = useBanking();

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const totalVaultCustody = accounts.reduce((acc, a) => acc + a.balance, 0);
  const pendingTransfers = transfers.filter((t) => t.status === 'pending_review');

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <Sliders className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> Institutional Clearing &amp; Surveillance Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#20242A] tracking-tight">
            Bank Operations &amp; Risk Control Desk
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Real-time multi-sign wire authorizations, liquidity reserve oversight, and AML risk triage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateUserOpen(true)}
            className="px-4.5 py-2.5 rounded-xl bg-[#147A52] hover:bg-[#0f6040] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4 stroke-[2.25]" /> Onboard New User &amp; Account
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/admin/transfers')}
            className="px-5 py-2.5 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <SendHorizontal className="w-4 h-4 stroke-[2.25]" /> Open Approval Queue ({pendingTransfersCount})
          </button>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ledger Under Custody */}
        <div className="bg-white rounded-2xl p-5 border-2 border-[#D8DEE8] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#5F6670] uppercase tracking-wider font-mono">Total Vault Custody</span>
            <span className="text-xs font-mono font-black text-[#147A52]">100% Reserve</span>
          </div>
          <div className="text-2xl font-black text-[#20242A] font-mono">
            ${totalVaultCustody.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-[#5F6670] font-medium">Audited across active client vaults</p>
        </div>

        {/* Pending Wire Authorizations */}
        <div className="bg-white rounded-2xl p-5 border-2 border-[#D8DEE8] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#5F6670] uppercase tracking-wider font-mono">Pending Wires</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-red-50 text-[#B42318] border-2 border-red-200 font-mono font-black">
              Action Required
            </span>
          </div>
          <div className="text-2xl font-black text-[#B42318] font-mono">
            {pendingTransfersCount} Wires
          </div>
          <p className="text-xs text-[#5F6670] font-medium">Threshold: &ge; $40,000 USD</p>
        </div>

        {/* Active Client Profiles */}
        <div className="bg-white rounded-2xl p-5 border-2 border-[#D8DEE8] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#5F6670] uppercase tracking-wider font-mono">Enrolled Clients</span>
            <span className="text-xs text-[#147A52] font-mono font-black">Tier-3 KYC</span>
          </div>
          <div className="text-2xl font-black text-[#20242A] font-mono">
            {allCustomers.length} Institutional
          </div>
          <p className="text-xs text-[#5F6670] font-medium">Zero active account freezes</p>
        </div>

        {/* Real-time Settled Today */}
        <div className="bg-white rounded-2xl p-5 border-2 border-[#D8DEE8] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#5F6670] uppercase tracking-wider font-mono">Settled Wires (24h)</span>
            <span className="text-xs text-[#147A52] font-mono font-black">100% OK</span>
          </div>
          <div className="text-2xl font-black text-[#147A52] font-mono">
            ${transfers.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.amount, 0).toLocaleString()} USD
          </div>
          <p className="text-xs text-[#5F6670] font-medium">FedWire &amp; SWIFT channels</p>
        </div>
      </div>

      {/* Main Grid: Pending Approval Queue & Operations Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Wire Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#20242A] tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#B42318] stroke-[2.25]" /> High-Value AML Clearance Queue
            </h2>
            <button
              type="button"
              onClick={() => navigateTo('/admin/transfers')}
              className="text-xs font-bold text-[#147A52] hover:underline cursor-pointer"
            >
              View Full Queue &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {pendingTransfers.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border-2 border-[#D8DEE8] text-[#5F6670] text-xs font-medium shadow-sm">
                All high-value wire transfers have been verified and cleared.
              </div>
            ) : (
              pendingTransfers.map((trf) => (
                <div
                  key={trf.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#D8DEE8] space-y-3.5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#20242A]">{trf.beneficiaryName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#147A52]/10 text-[#147A52] text-[10px] font-mono font-black border-2 border-emerald-300">
                          {trf.type.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#B42318] text-[10px] font-mono font-black border-2 border-red-200">
                          RISK SCORE: {trf.riskScore}
                        </span>
                      </div>
                      <p className="text-xs text-[#5F6670] font-medium mt-1">
                        Originator: <strong className="text-[#20242A]">{trf.fromAccountName}</strong> • Target: {trf.toAccountNumber || 'SWIFT Verified'}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-lg font-black text-[#20242A]">
                        ${trf.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {trf.sourceCurrency}
                      </div>
                      <span className="text-xs text-[#5F6670] font-medium">{trf.createdAt}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-xs text-[#5F6670] flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[#5F6670]">Purpose:</span> <strong className="text-[#20242A]">{trf.purpose}</strong>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#5F6670]">REF: {trf.referenceId}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-[#F5F7FA]">
                    <button
                      type="button"
                      onClick={() => rejectTransfer(trf.id, 'Compliance AML check failed')}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 border-2 border-[#D8DEE8] hover:border-red-300 text-[#B42318] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Reject &amp; Flag AML
                    </button>
                    <button
                      type="button"
                      onClick={() => approveTransfer(trf.id, 'Supervisory clearance granted by Sarah Jenkins')}
                      className="px-5 py-2 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      Authorize Clearance
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Actions (1 col) */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#20242A] tracking-tight">
            Supervisory Operations Modules
          </h2>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#D8DEE8] space-y-3.5 shadow-sm text-xs">
            {[
              {
                title: 'Customer Directory & KYC',
                desc: 'Manage accredited investor profiles and account freeze status.',
                route: '/admin/customers',
                icon: Users
              },
              {
                title: 'Account Ledger Balances',
                desc: 'Inspect multicurrency vaults and daily liquidity reserves.',
                route: '/admin/accounts',
                icon: Wallet
              },
              {
                title: 'Transaction Surveillance',
                desc: 'Real-time telemetry and audit anomaly scoring.',
                route: '/admin/transactions',
                icon: TrendingUp
              },
              {
                title: 'KYC & Legal Documentation',
                desc: 'Review submitted passports, W-8BEN, and corporate filings.',
                route: '/admin/documents',
                icon: FileCheck
              },
              {
                title: 'Roles & Permission Access Controls',
                desc: 'Configure granular View, Create, Edit, Delete, and Manage access rules.',
                route: '/admin/roles',
                icon: ShieldCheck
              }
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.route}
                  onClick={() => navigateTo(m.route)}
                  className="p-4 rounded-xl border-2 border-[#D8DEE8] bg-[#F5F7FA] hover:bg-[#081552]/10 hover:border-[#147A52] transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-white border-2 border-[#D8DEE8] flex items-center justify-center text-[#147A52] shadow-2xs shrink-0">
                      <Icon className="w-4 h-4 stroke-[2.25]" />
                    </div>
                    <span className="font-extrabold text-sm text-[#20242A] group-hover:text-[#147A52] transition-colors">{m.title}</span>
                  </div>
                  <p className="text-xs text-[#5F6670] font-medium pl-11">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin User & Account Onboarding Modal */}
      <AdminCreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSuccess={() => {
          setIsCreateUserOpen(false);
        }}
      />
    </div>
  );
};
