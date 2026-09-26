import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  ShieldCheck,
  CreditCard,
  Building2,
  AlertTriangle,
  Info,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { NotificationType } from '../../types/banking';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateTo,
    aiSpendingAlerts
  } = useBanking();
  const [activeTab, setActiveTab] = useState<'all' | NotificationType>('all');

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => (n.type || n.category) === activeTab);

  const getNotificationIcon = (cat?: NotificationType | string) => {
    switch (cat) {
      case 'ai_alert':
        return Sparkles;
      case 'security':
        return AlertTriangle;
      case 'transaction':
        return CreditCard;
      case 'account':
        return Building2;
      default:
        return Info;
    }
  };

  const aiAlertsCount = notifications.filter(n => (n.type || n.category) === 'ai_alert').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> Real-Time Security &amp; Transaction Feeds
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Notifications &amp; Security Alerts
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Real-time telemetry on wire executions, AI spending anomalies, debit authorizations, and biometric logins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo('/settings')}
            className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Configure Alert Rules & AI Spending Thresholds"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2.25]" />
            <span>Alert Settings</span>
          </button>
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2.5 rounded-lg bg-white hover:bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold text-xs flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 stroke-[2.25]" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* AI Spending Sentinel Active Banner */}
      {aiSpendingAlerts && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#147A52] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-[#0B1F6A] flex items-center gap-1.5">
                AI-Driven Spending Sentinel Active
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-emerald-600 text-white font-mono uppercase">Live</span>
              </span>
              <p className="text-[11.5px] text-[#5F6670] mt-0.5">
                Autonomous machine learning monitor actively screening for suspicious velocity spikes, anomalous merchants, and high-value transfers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('ai_alert')}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-300 text-[#147A52] font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-2xs"
          >
            Filter AI Alerts ({aiAlertsCount})
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#F5F7FA] p-1.5 rounded-xl border-2 border-[#D8DEE8] text-xs w-fit shadow-2xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'ai_alert', label: `AI Spending Alerts ${aiAlertsCount > 0 ? `(${aiAlertsCount})` : ''}` },
          { id: 'security', label: 'Security & Auth' },
          { id: 'transaction', label: 'Transactions' },
          { id: 'account', label: 'Account System' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? tab.id === 'ai_alert'
                  ? 'bg-gradient-to-r from-emerald-700 to-indigo-800 text-white shadow-2xs'
                  : 'bg-[#147A52] text-white shadow-2xs'
                : 'text-[#5F6670] hover:text-[#20242A] hover:bg-slate-200'
            }`}
          >
            {tab.id === 'ai_alert' && <Sparkles className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] shadow-sm divide-y-2 divide-[#F5F7FA] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-[#5F6670] text-xs">
            <Bell className="w-10 h-10 mx-auto text-[#D8DEE8] stroke-[1.75]" />
            <p className="font-extrabold text-sm text-[#20242A]">No notifications in this category</p>
            <p className="font-medium">All system components and ledger operations are clear.</p>
          </div>
        ) : (
          filtered.map((n) => {
            const Icon = getNotificationIcon(n.type || n.category);
            const isRead = n.read ?? n.isRead;
            const route = n.linkRoute || n.actionUrl;
            const isAiAlert = (n.type || n.category) === 'ai_alert';

            return (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationAsRead(n.id);
                  if (route) navigateTo(route);
                }}
                className={`p-5 flex items-start justify-between gap-4 transition-all cursor-pointer text-xs ${
                  isAiAlert
                    ? isRead
                      ? 'bg-gradient-to-r from-emerald-50/40 via-white to-indigo-50/20 hover:bg-slate-50'
                      : 'bg-gradient-to-r from-emerald-100/50 via-teal-50/50 to-indigo-50/40 hover:bg-emerald-100/70 border-l-4 border-l-emerald-600'
                    : isRead
                    ? 'bg-white hover:bg-[#F5F7FA]'
                    : 'bg-[#147A52]/5 hover:bg-[#081552]/10 border-l-4 border-l-[#147A52]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-2xs ${
                    isAiAlert
                      ? 'bg-gradient-to-br from-emerald-600 to-indigo-700 text-white border-emerald-400'
                      : n.category === 'security'
                      ? 'bg-amber-50 text-[#B87500] border-amber-300'
                      : n.category === 'transaction'
                      ? 'bg-[#147A52]/10 text-[#147A52] border-emerald-300'
                      : 'bg-[#147A52]/10 text-[#147A52] border-emerald-300'
                  }`}>
                    <Icon className="w-5 h-5 stroke-[2.25]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-sm text-[#20242A]">{n.title}</span>
                      {isAiAlert && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>AI Sentinel</span>
                        </span>
                      )}
                      {!isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#147A52] animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-[#5F6670] font-medium leading-relaxed max-w-2xl">{n.message}</p>
                    <span className="text-[11px] text-[#5F6670] font-mono font-medium block pt-0.5">{n.timestamp}</span>
                  </div>
                </div>
                {route && (
                  <div className="shrink-0 flex items-center text-[#147A52] font-bold text-xs gap-1.5 hover:underline">
                    <span>View</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
