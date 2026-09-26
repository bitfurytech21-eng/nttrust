import React from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  SendHorizontal,
  FileCheck,
  LifeBuoy,
  History,
  Sliders,
  ShieldCheck,
  Lock,
  KeyRound
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { currentRoute, navigateTo, pendingTransfersCount } = useBanking();

  const adminNavItems = [
    { label: 'Operations Dashboard', route: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Customer Directory & KYC', route: '/admin/customers', icon: Users },
    { label: 'Account Ledger & Status', route: '/admin/accounts', icon: Wallet },
    { label: 'Transaction Surveillance', route: '/admin/transactions', icon: ArrowLeftRight },
    {
      label: 'Wire Approval Queue',
      route: '/admin/transfers',
      icon: SendHorizontal,
      badge: pendingTransfersCount > 0 ? `${pendingTransfersCount} Action` : undefined,
      badgeColor: 'bg-red-50 text-[#B42318] border border-red-200'
    },
    { label: 'KYC & Legal Documents', route: '/admin/documents', icon: FileCheck },
    { label: 'Roles & Permissions', route: '/admin/roles', icon: ShieldCheck },
    { label: 'Support & Escalations', route: '/admin/support', icon: LifeBuoy },
    { label: 'Security & Audit Trail', route: '/admin/audit', icon: History },
    { label: 'Google Authenticator', route: '/admin/authenticator', icon: KeyRound }
  ];

  return (
    <aside className="w-64 border-r border-[#D8DEE8] bg-white flex flex-col justify-between shrink-0 select-none overflow-y-auto hidden md:flex text-xs text-[#20242A]">
      <div className="p-4 space-y-5">
        <div>
          <div className="px-3 text-[11px] font-bold text-[#0B1F6A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Operations Console
          </div>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route || (item.route === '/admin/dashboard' && (currentRoute === '/admin' || currentRoute === '/admin/dashboard'));
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1F6A] text-white shadow-xs'
                      : 'text-[#5F6670] hover:text-[#0B1F6A] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5F6670]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.2 rounded-md text-[10px] font-mono font-bold ${isActive ? 'bg-white text-[#B42318]' : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-[#D8DEE8] bg-[#F5F7FA]">
        <div className="p-3 rounded bg-white border border-[#D8DEE8] text-[11px] text-[#5F6670] space-y-1 font-mono shadow-xs">
          <div className="text-[#147A52] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#147A52]" /> SECURE ENCLAVE 01
          </div>
          <div>Terminal: <span className="text-[#20242A] font-semibold">NYC-HQ-OPS-10</span></div>
          <div>Clearance: <span className="text-[#147A52] font-bold">SUPERVISORY LEVEL 4</span></div>
        </div>
      </div>
    </aside>
  );
};
