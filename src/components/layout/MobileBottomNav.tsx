import React from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Landmark,
  Wallet,
  SendHorizontal,
  CreditCard,
  Menu,
  Receipt,
  Layers
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu }) => {
  const { currentRoute, navigateTo, unreadNotificationsCount, pendingTransfersCount } = useBanking();

  const isCurrentActive = (route: string) => {
    if (route === '/dashboard') {
      return currentRoute === '/dashboard' || currentRoute === '/';
    }
    return currentRoute === route || currentRoute.startsWith(route + '/');
  };

  const navItems = [
    {
      label: 'Home',
      route: '/dashboard',
      icon: Landmark,
    },
    {
      label: 'Accounts',
      route: '/accounts',
      icon: Wallet,
    },
    {
      label: 'Transfer',
      route: '/transfers',
      icon: SendHorizontal,
      badge: pendingTransfersCount > 0 ? pendingTransfersCount : undefined,
    },
    {
      label: 'Services',
      route: '/services',
      icon: Layers,
    },
    {
      label: 'Cards',
      route: '/cards',
      icon: CreditCard,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#D8DEE8] shadow-md text-[#20242A] px-2 py-1.5 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isCurrentActive(item.route);

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => navigateTo(item.route)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors duration-150 min-w-[54px] cursor-pointer ${
              isActive
                ? 'text-[#0B1F6A] font-bold'
                : 'text-[#5F6670] hover:text-[#0B1F6A]'
            }`}
          >
            {/* Active top line indicator */}
            {isActive && (
              <span className="absolute -top-1.5 w-6 h-0.5 bg-[#101F7A] rounded-sm animate-fade-in" />
            )}
            
            <div className="relative">
              <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'scale-110 text-[#0B1F6A]' : 'text-[#5F6670]'}`} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-[#B87500] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Menu / Drawer button */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="relative flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[#5F6670] hover:text-[#0B1F6A] transition-colors min-w-[54px] cursor-pointer"
        aria-label="Open Mobile Menu"
      >
        <div className="relative">
          <Menu className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#B42318] ring-1 ring-white" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">More</span>
      </button>
    </nav>
  );
};
