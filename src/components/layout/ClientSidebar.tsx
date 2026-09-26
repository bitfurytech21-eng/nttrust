import React from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  SendHorizontal,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  FolderArchive,
  Mail,
  HelpCircle,
  Users,
  ShieldCheck,
  Bell,
  Layers,
  CheckSquare,
  Globe2,
  Landmark,
  Calendar
} from 'lucide-react';

export const ClientSidebar: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    unreadMessagesCount,
    unreadNotificationsCount,
    pendingTransfersCount
  } = useBanking();

  const mainNavItems = [
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Banking & Services', route: '/services', icon: Layers },
    { label: 'Events & Meetings', route: '/events', icon: Calendar },
    { label: 'Accounts', route: '/accounts', icon: Wallet },
    {
      label: 'Transfers & Wires',
      route: '/transfers',
      icon: SendHorizontal,
      badge: pendingTransfersCount > 0 ? `${pendingTransfersCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300'
    },
    { label: 'Forex Desk (FX)', route: '/fx', icon: Globe2 },
    { label: 'Cheque & Deposit', route: '/checks', icon: CheckSquare },
    { label: 'Credit Lines & Loans', route: '/lending', icon: Landmark },
    { label: 'Payments & Bills', route: '/payments', icon: Receipt },
    { label: 'Cards & Controls', route: '/cards', icon: CreditCard },
    { label: 'Transactions', route: '/transactions', icon: ArrowLeftRight },
    { label: 'Tax Documents & History', route: '/tax', icon: FileSpreadsheet },
    { label: 'Statements & Vault', route: '/documents', icon: FolderArchive },
    {
      label: 'Messages',
      route: '/messages',
      icon: Mail,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : undefined,
      badgeColor: 'bg-blue-100 text-[#147A52] border border-[#147A52]/20'
    }
  ];

  const secondaryNavItems = [
    { label: 'Beneficiaries', route: '/beneficiaries', icon: Users },
    {
      label: 'Notifications',
      route: '/notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : undefined,
      badgeColor: 'bg-red-100 text-[#B42318] border border-red-200'
    },
    { label: 'Profile & Security', route: '/security-settings', icon: ShieldCheck }
  ];

  const isCurrentActive = (itemRoute: string) => {
    if (itemRoute.includes('?')) {
      return currentRoute === itemRoute.split('?')[0];
    }
    return currentRoute === itemRoute;
  };

  return (
    <aside className="w-60 lg:w-64 bg-white border-r-2 border-[#D8DEE8] flex flex-col justify-between shrink-0 select-none overflow-y-auto hidden md:flex shadow-xs">
      <div className="p-3.5 space-y-5">
        {/* Main Navigation */}
        <div>
          <div className="px-3 text-[11px] font-extrabold text-[#5F6670] uppercase tracking-wider mb-2 font-mono">
            Banking Menu
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentActive(item.route);
              return (
                <button
                  key={item.label}
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1F6A] text-white shadow-sm ring-1 ring-[#0B1F6A] font-bold'
                      : 'text-[#20242A] hover:text-[#0B1F6A] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 stroke-[2.25] ${isActive ? 'text-white' : 'text-[#5F6670]'}`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white text-[#0B1F6A]' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div>
          <div className="px-3 text-[11px] font-extrabold text-[#5F6670] uppercase tracking-wider mb-2 font-mono">
            Management &amp; Help
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentActive(item.route);
              return (
                <button
                  key={item.label}
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1F6A] text-white shadow-sm ring-1 ring-[#0B1F6A] font-bold'
                      : 'text-[#20242A] hover:text-[#0B1F6A] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 stroke-[2.25] ${isActive ? 'text-white' : 'text-[#5F6670]'}`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Security & Regulatory Footer */}
      <div className="p-3.5 border-t-2 border-[#D8DEE8] bg-[#F5F7FA]">
        <div className="p-3 rounded-xl bg-white border-2 border-[#D8DEE8] text-[11.5px] text-[#5F6670] space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-[#147A52] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#147A52] shrink-0 stroke-[2.5]" />
            <span className="text-xs">FDIC Insured &amp; Verified</span>
          </div>
          <p className="text-[10.5px] leading-relaxed text-[#5F6670] font-medium">
            Deposits protected up to statutory limits. 256-bit TLS bank encryption.
          </p>
        </div>
      </div>
    </aside>
  );
};
