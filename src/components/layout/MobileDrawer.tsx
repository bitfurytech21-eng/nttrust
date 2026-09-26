import React from 'react';
import { useBanking } from '../../context/BankingContext';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import {
  X,
  LayoutDashboard,
  Wallet,
  SendHorizontal,
  CreditCard,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  PhoneCall,
  Lock,
  Receipt,
  Users,
  Layers,
  CheckSquare,
  Globe2,
  Landmark,
  Calendar,
  LucideIcon
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerNavItem {
  label: string;
  route: string;
  icon: LucideIcon;
  badge?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentRoute,
    navigateTo,
    logout,
    unreadMessagesCount,
    unreadNotificationsCount,
    pendingTransfersCount,
    lockSessionManually
  } = useBanking();

  if (!isOpen) return null;

  const handleNav = (route: string) => {
    navigateTo(route);
    onClose();
  };

  const isCurrentActive = (itemRoute: string) => {
    if (itemRoute.includes('?')) {
      return currentRoute === itemRoute.split('?')[0];
    }
    return currentRoute === itemRoute;
  };

  const primaryNav: DrawerNavItem[] = [
    { label: 'Client Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Banking & Custody Services', route: '/services', icon: Layers },
    { label: 'Events & Bank Appointments', route: '/events', icon: Calendar },
    { label: 'Deposit & Custody Accounts', route: '/accounts', icon: Wallet },
    {
      label: 'Domestic & Global Wires',
      route: '/transfers',
      icon: SendHorizontal,
      badge: pendingTransfersCount > 0 ? `${pendingTransfersCount}` : undefined
    },
    { label: 'Forex Desk (FX)', route: '/fx', icon: Globe2 },
    { label: 'Cheque & Remote Deposit', route: '/checks', icon: CheckSquare },
    { label: 'Credit Lines & Loans', route: '/lending', icon: Landmark },
    { label: 'Transaction Ledger', route: '/transactions', icon: FileText },
    { label: 'Bill Pay & Disbursements', route: '/payments', icon: Receipt },
    { label: 'Approved Beneficiaries', route: '/beneficiaries', icon: Users },
    { label: 'Cards & Spending Controls', route: '/cards', icon: CreditCard },
    { label: 'Tax Documents & History', route: '/tax', icon: FileText },
    { label: 'e-Statements & Vault', route: '/documents', icon: FileText },
  ];

  const secondaryNav: DrawerNavItem[] = [
    { label: 'Encrypted Messages', route: '/messages', icon: MessageSquare, badge: unreadMessagesCount ? `${unreadMessagesCount}` : undefined },
    { label: 'Notifications & Alerts', route: '/notifications', icon: Bell, badge: unreadNotificationsCount ? `${unreadNotificationsCount}` : undefined },
    { label: 'Security & FIDO2 Keys', route: '/security-settings', icon: ShieldCheck },
    { label: 'Profile & Preferences', route: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-hidden animate-slide-in-left">
        {/* Drawer Header (Deep Navy Brand) */}
        <div className="bg-[#0B1F6A] p-4 text-white border-b border-[#081552]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                <NorthernTrustLogo className="w-full h-full text-[#147A52]" color="#147A52" title="Northern Trust" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm block leading-tight">Northern Trust</span>
                <span className="text-[9px] text-[#D8DEE8] uppercase tracking-wider font-mono">Wealth Management</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#D8DEE8] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Banner */}
          <div className="pt-2 border-t border-[#081552] flex items-center justify-between">
            <div>
              <span className="font-semibold text-xs text-white block truncate max-w-[170px]">
                {currentUser?.fullName}
              </span>
              <span className="text-[10px] font-mono text-[#D8DEE8] block">
                CIF: {currentUser?.clientId}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                lockSessionManually();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1 cursor-pointer"
              title="Lock Session"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          <div>
            <div className="px-2 text-[10px] font-bold text-[#5F6670] uppercase tracking-wider mb-1.5">
              Banking Services
            </div>
            <div className="space-y-0.5">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const active = isCurrentActive(item.route);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNav(item.route)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0B1F6A] text-white font-semibold'
                        : 'text-[#20242A] hover:bg-[#F5F7FA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#5F6670]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-2 text-[10px] font-bold text-[#5F6670] uppercase tracking-wider mb-1.5">
              Account &amp; Security
            </div>
            <div className="space-y-0.5">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const active = isCurrentActive(item.route);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNav(item.route)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0B1F6A] text-white font-semibold'
                        : 'text-[#20242A] hover:bg-[#F5F7FA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#5F6670]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-red-100 text-[#B42318] border border-red-200">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#F5F7FA] border-t border-[#D8DEE8] space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-2 text-[#B42318] hover:underline font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <a
              href="tel:+18005550192"
              className="flex items-center gap-1 text-[#0B1F6A] font-semibold hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
