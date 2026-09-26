import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Calendar,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Clock,
  X,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Check
} from 'lucide-react';

export interface TaxAlertItem {
  id: string;
  type: 'deadline' | 'missing_document' | 'compliance_notice';
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  dueDate?: string;
  daysRemaining?: number;
  actionLabel?: string;
  actionType?: 'pay_tax' | 'upload_w9' | 'view_form';
  isRead?: boolean;
}

const defaultTaxAlerts: TaxAlertItem[] = [
  {
    id: 'alert-deadline-q4',
    type: 'deadline',
    severity: 'urgent',
    title: 'Q4 2026 Estimated Tax Deadline Approaching',
    description: 'Federal Form 1040-ES and California FTB Form 540-ES Q4 estimated payments must be settled by January 15.',
    dueDate: 'Jan 15, 2027',
    daysRemaining: 18,
    actionLabel: 'Settle via EFTPS',
    actionType: 'pay_tax'
  },
  {
    id: 'alert-doc-w9',
    type: 'missing_document',
    severity: 'warning',
    title: 'Triennial Form W-9 Electronic Re-certification',
    description: 'Under FinCEN Rule 31 CFR §1010.312, periodic digital TIN attestation is required to maintain exempt withholding status.',
    dueDate: 'Oct 31, 2026',
    daysRemaining: 35,
    actionLabel: 'Sign Electronic W-9',
    actionType: 'upload_w9'
  },
  {
    id: 'alert-notice-fbar',
    type: 'compliance_notice',
    severity: 'info',
    title: 'FinCEN Form 114 (FBAR) Multi-Depository Record',
    description: 'All offshore and Zurich sub-custody cash balances have been successfully consolidated into your 2025 electronic disclosure envelope.',
    actionLabel: 'View FBAR Certificate',
    actionType: 'view_form'
  }
];

interface TaxDeadlineNotificationBadgeProps {
  onActionClick?: (actionType: 'pay_tax' | 'upload_w9' | 'view_form') => void;
  className?: string;
}

export const TaxDeadlineNotificationBadge: React.FC<TaxDeadlineNotificationBadgeProps> = ({
  onActionClick,
  className = ''
}) => {
  const [alerts, setAlerts] = useState<TaxAlertItem[]>(defaultTaxAlerts);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const hasUrgent = alerts.some(a => a.severity === 'urgent' && !a.isRead);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const handleAction = (alert: TaxAlertItem) => {
    if (alert.actionType && onActionClick) {
      onActionClick(alert.actionType);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Notification Toggle Button */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Tax alerts and filing deadlines: ${unreadCount} active notifications`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden ${
          hasUrgent
            ? 'bg-amber-50/90 hover:bg-amber-100 text-amber-900 border-amber-300'
            : unreadCount > 0
            ? 'bg-blue-50/90 hover:bg-blue-100 text-[#0B1F6A] border-blue-200'
            : 'bg-slate-50 hover:bg-slate-100 text-[#5F6670] border-[#D8DEE8]'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <Bell className={`w-4 h-4 ${hasUrgent ? 'text-amber-700 animate-pulse' : 'text-[#0B1F6A]'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                hasUrgent ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 text-[9px] font-bold text-white items-center justify-center ${
                hasUrgent ? 'bg-amber-600' : 'bg-[#0B1F6A]'
              }`}>
                {unreadCount}
              </span>
            </span>
          )}
        </div>

        <span className="hidden sm:inline font-sans">
          {hasUrgent ? 'Tax Deadlines & Action Required' : unreadCount > 0 ? `${unreadCount} Filing Alerts` : 'Tax Alerts'}
        </span>
      </motion.button>

      {/* Floating Tax Alerts Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[340px] sm:w-[410px] bg-white rounded-2xl border-2 border-[#D8DEE8] shadow-2xl z-50 p-4 space-y-3.5 text-xs text-[#20242A]"
            role="dialog"
            aria-label="Tax Filing Deadlines & Missing Documentation Alerts"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#D8DEE8]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0B1F6A]/10 text-[#0B1F6A] flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4 stroke-[2.25]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B1F6A]">Filing Deadlines &amp; Tax Notices</h3>
                  <p className="text-[10px] text-[#5F6670]">IRS &amp; California FTB Real-Time Ledger Monitor</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close tax notifications"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#5F6670] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Items List */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-0.5">
              {alerts.length === 0 || unreadCount === 0 ? (
                <div className="py-6 text-center text-[#5F6670] space-y-1">
                  <CheckCircle2 className="w-7 h-7 text-[#147A52] mx-auto" />
                  <p className="font-bold text-xs text-[#20242A]">All Tax Filings &amp; Documents Up to Date</p>
                  <p className="text-[11px]">No pending deadlines or required documentation actions.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border transition-all ${
                      alert.isRead
                        ? 'bg-slate-50/60 border-slate-200 opacity-60'
                        : alert.severity === 'urgent'
                        ? 'bg-amber-50/80 border-amber-200 hover:border-amber-300'
                        : alert.severity === 'warning'
                        ? 'bg-orange-50/70 border-orange-200 hover:border-orange-300'
                        : 'bg-blue-50/60 border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {alert.type === 'deadline' ? (
                          <Clock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                        ) : alert.type === 'missing_document' ? (
                          <FileWarning className="w-4 h-4 text-orange-700 mt-0.5 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-[#0B1F6A] mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-xs text-[#0B1F6A]">{alert.title}</h4>
                            {alert.daysRemaining !== undefined && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                                Due in {alert.daysRemaining}d
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#5F6670] mt-1 leading-relaxed">
                            {alert.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDismiss(alert.id, e)}
                        title={alert.isRead ? 'Marked as read' : 'Dismiss alert'}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Action Button */}
                    {!alert.isRead && alert.actionLabel && (
                      <div className="pt-2 mt-2 border-t border-black/5 flex items-center justify-between">
                        {alert.dueDate && (
                          <span className="text-[10px] font-mono text-[#5F6670]">
                            Target: <strong className="text-[#20242A]">{alert.dueDate}</strong>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleAction(alert)}
                          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-[10.5px] transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>{alert.actionLabel}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Popover Footer */}
            <div className="pt-2 border-t border-[#D8DEE8] flex items-center justify-between text-[11px]">
              <span className="text-[#5F6670] font-mono text-[10px]">
                Direct IRS EFTPS Clearance Node
              </span>
              <button
                type="button"
                onClick={() => setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))}
                className="font-bold text-[#0B1F6A] hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
