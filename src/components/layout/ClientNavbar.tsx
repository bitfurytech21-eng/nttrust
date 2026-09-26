import React, { useState, useRef, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import {
  Bell,
  Lock,
  LogOut,
  User,
  Search,
  Sliders,
  HelpCircle,
  X,
  Phone,
  RefreshCw,
  ShieldCheck,
  Menu,
  Monitor,
  Moon,
  Sun,
  Shield
} from 'lucide-react';

export const ClientNavbar: React.FC = () => {
  const {
    currentUser,
    lockSessionManually,
    logout,
    unreadNotificationsCount,
    notifications,
    markNotificationAsRead,
    navigateTo,
    resetAllData,
    openMobileDrawer,
    currentRoute,
    darkMode,
    toggleDarkMode,
    privacyMode,
    togglePrivacyMode,
    sessionRemainingSeconds
  } = useBanking();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Active Dropdowns
  const [openDropdown, setOpenDropdown] = useState<'accounts' | 'transactions' | 'reporting' | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performNavigation(searchQuery);
  };

  const performNavigation = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('card')) navigateTo('/cards');
    else if (q.includes('transfer') || q.includes('wire') || q.includes('send')) navigateTo('/transfers');
    else if (q.includes('statement') || q.includes('tax') || q.includes('doc')) navigateTo('/documents');
    else if (q.includes('bill') || q.includes('pay')) navigateTo('/payments');
    else if (q.includes('account') || q.includes('checking') || q.includes('saving')) navigateTo('/accounts');
    else if (q.includes('report')) navigateTo('/documents');
    else navigateTo('/transactions');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const searchShortcuts = [
    { title: 'Transfer Money', route: '/transfers', desc: 'Domestic & International Wires' },
    { title: 'View Statements & Tax Forms', route: '/documents', desc: 'Monthly e-Statements & 1099' },
    { title: 'Pay Bills & Manage Payees', route: '/payments', desc: 'Recurring and one-time payments' },
    { title: 'Manage Debit & Credit Cards', route: '/cards', desc: 'Spending limits and card freeze' },
    { title: 'Account Balances & Routing', route: '/accounts', desc: 'Wire routing and checking ledger' },
  ];

  const filteredShortcuts = searchQuery
    ? searchShortcuts.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchShortcuts;

  const displayName = currentUser?.preferredName || currentUser?.fullName?.split(' ')[0] || 'Alexander';

  return (
    <>
      {/* Clean White Banking Header (~80-90px tall) */}
      <header className="h-[84px] bg-white border-b border-[#D8DEE8] px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 text-[#0B1F6A] gap-4 sm:gap-8">
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 min-w-0" ref={navRef}>
          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={openMobileDrawer}
            className="md:hidden p-2 -ml-1 text-[#0B1F6A] hover:bg-[#F5F7FA] rounded-lg cursor-pointer shrink-0"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Left: Brand Logo & Secondary Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0 pr-2 sm:pr-0" onClick={() => navigateTo('/dashboard')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#147A52] flex items-center justify-center text-white p-2 shrink-0 shadow-xs group-hover:bg-[#0f6040] transition-all">
              <NorthernTrustLogo className="w-full h-full text-white" color="#FFFFFF" title="Northern Trust" />
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex flex-col">
                <span className="font-serif font-black text-lg sm:text-2xl tracking-tight text-[#20242A] group-hover:text-[#147A52] whitespace-nowrap leading-tight transition-colors">
                  Northern Trust
                </span>
                <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.14em] uppercase text-[#147A52]">
                  Wealth Management
                </span>
              </div>
              <span className="hidden xl:inline-block text-xs font-semibold text-[#5F6670] border-l border-[#D8DEE8] pl-3 whitespace-nowrap">
                Private Client Banking
              </span>
            </div>
          </div>

          {/* Main Navigation (Horizontal layout with active navy indicator and dropdowns) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold h-[84px] relative">
            {/* Dashboard Link */}
            <button
              type="button"
              onClick={() => {
                setOpenDropdown(null);
                navigateTo('/dashboard');
              }}
              className={`h-full flex items-center relative transition-colors cursor-pointer ${
                currentRoute === '/dashboard' || currentRoute === '/'
                  ? 'text-[#101F7A] font-bold'
                  : 'text-[#20242A] hover:text-[#0B1F6A]'
              }`}
            >
              <span>Dashboard</span>
              {(currentRoute === '/dashboard' || currentRoute === '/') && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#101F7A] rounded-t-sm" />
              )}
            </button>

            {/* Accounts Dropdown */}
            <div className="relative h-full flex items-center">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'accounts' ? null : 'accounts')}
                className={`h-full flex items-center gap-1.5 cursor-pointer transition-colors ${
                  openDropdown === 'accounts' || currentRoute === '/accounts' ? 'text-[#0B1F6A] font-bold' : 'text-[#20242A] hover:text-[#0B1F6A]'
                }`}
              >
                <span>Accounts</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === 'accounts' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'accounts' && (
                <div className="absolute top-[80px] left-0 w-52 bg-white border border-[#D8DEE8] rounded-lg shadow-md py-2 z-50 animate-fade-in text-xs font-medium text-[#20242A]">
                  {[
                    { label: 'Account Overview', route: '/accounts' },
                    { label: 'Checking', route: '/accounts' },
                    { label: 'Savings', route: '/accounts' },
                    { label: 'Credit Cards', route: '/cards' },
                    { label: 'Account Statements', route: '/documents' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        navigateTo(item.route);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F5F7FA] hover:text-[#0B1F6A] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions Dropdown */}
            <div className="relative h-full flex items-center">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'transactions' ? null : 'transactions')}
                className={`h-full flex items-center gap-1.5 cursor-pointer transition-colors ${
                  openDropdown === 'transactions' || currentRoute === '/transactions' || currentRoute === '/transfers' ? 'text-[#0B1F6A] font-bold' : 'text-[#20242A] hover:text-[#0B1F6A]'
                }`}
              >
                <span>Transactions</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === 'transactions' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'transactions' && (
                <div className="absolute top-[80px] left-0 w-52 bg-white border border-[#D8DEE8] rounded-lg shadow-md py-2 z-50 animate-fade-in text-xs font-medium text-[#20242A]">
                  {[
                    { label: 'Recent Transactions', route: '/transactions' },
                    { label: 'Pending Transactions', route: '/transactions' },
                    { label: 'Transfers & Wires', route: '/transfers' },
                    { label: 'Bill Payments', route: '/payments' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        navigateTo(item.route);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F5F7FA] hover:text-[#0B1F6A] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reporting Dropdown */}
            <div className="relative h-full flex items-center">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'reporting' ? null : 'reporting')}
                className={`h-full flex items-center gap-1.5 cursor-pointer transition-colors ${
                  openDropdown === 'reporting' || currentRoute === '/documents' ? 'text-[#0B1F6A] font-bold' : 'text-[#20242A] hover:text-[#0B1F6A]'
                }`}
              >
                <span>Reporting</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === 'reporting' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'reporting' && (
                <div className="absolute top-[80px] left-0 w-60 bg-white border border-[#D8DEE8] rounded-lg shadow-md py-2 z-50 animate-fade-in text-xs font-medium text-[#20242A]">
                  {[
                    { label: 'Tax Documents & History', route: '/tax' },
                    { label: 'Form 1099 & K-1 Filings', route: '/tax' },
                    { label: 'Monthly Statements', route: '/documents' },
                    { label: 'Official Proof of Funds Letter', route: '/documents' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        navigateTo(item.route);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F5F7FA] hover:text-[#0B1F6A] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Section: Search, Notifications, Lock & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto pl-2">
          {/* Search Input */}
          <div className="relative max-w-xs hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="w-4 h-4 text-[#5F6670] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSearchResults(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  placeholder="Search accounts or features..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] text-xs font-medium text-[#20242A] placeholder-[#5F6670] focus:outline-none focus:border-[#0B1F6A] focus:bg-white transition-colors"
                />
              </div>
            </form>

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D8DEE8] rounded-lg shadow-md p-2 z-50 animate-fade-in text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-[#5F6670] uppercase">
                  Search Results
                </div>
                {filteredShortcuts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      navigateTo(item.route);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F5F7FA] block transition-colors"
                  >
                    <p className="font-bold text-[#0B1F6A]">{item.title}</p>
                    <p className="text-[11px] text-[#5F6670]">{item.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enclave Session Lock & Live Countdown */}
          <button
            type="button"
            onClick={lockSessionManually}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#D8DEE8] bg-[#F5F7FA] hover:bg-[#E8EDF5] text-[#0B1F6A] text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs"
            title="Lock session to sovereign enclave immediately"
          >
            <Lock className="w-3.5 h-3.5 text-[#147A52] stroke-[2.25]" />
            <span>{Math.floor(sessionRemainingSeconds / 60)}:{String(sessionRemainingSeconds % 60).padStart(2, '0')}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 rounded-lg border border-[#D8DEE8] text-[#5F6670] hover:text-[#0B1F6A] hover:bg-[#F5F7FA] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B42318]" />
              )}
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#D8DEE8] rounded-lg shadow-lg p-3 z-50 text-xs text-[#20242A]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D8DEE8]">
                  <span className="font-bold text-[#0B1F6A]">Notifications</span>
                  <button
                    onClick={() => {
                      setShowNotificationDropdown(false);
                      navigateTo('/notifications');
                    }}
                    className="text-[#101F7A] hover:underline text-[11px] font-semibold"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        const route = n.linkRoute || n.actionUrl;
                        if (route) navigateTo(route);
                        setShowNotificationDropdown(false);
                      }}
                      className="p-2.5 rounded-lg border border-[#D8DEE8] bg-[#F5F7FA] hover:bg-white cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between font-bold text-xs text-[#20242A]">
                        <span>{n.title}</span>
                      </div>
                      <p className="text-[11px] text-[#5F6670] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 cursor-pointer"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName || 'User Profile'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-lg object-cover border border-[#D8DEE8] shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#0B1F6A] text-white flex items-center justify-center font-bold text-xs">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-xs text-[#20242A] hidden sm:inline">{displayName}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#D8DEE8] rounded-lg shadow-lg p-2 z-50 text-xs text-[#20242A]">
                <div className="p-2 border-b border-[#D8DEE8] mb-1 flex items-center gap-2.5">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover border border-[#D8DEE8]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[#0B1F6A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-[#0B1F6A] truncate">{currentUser?.fullName}</p>
                    <p className="text-[11px] text-[#5F6670] truncate">{currentUser?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowProfileMenu(false); navigateTo('/profile'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F7FA] flex items-center gap-2 text-[#20242A]"
                >
                  <User className="w-4 h-4 text-[#0B1F6A]" /> My Profile
                </button>
                <button
                  type="button"
                  onClick={() => { setShowProfileMenu(false); navigateTo('/security-settings'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F7FA] flex items-center gap-2 text-[#20242A]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#147A52]" /> Security &amp; Keys
                </button>
                <button
                  type="button"
                  onClick={() => { setShowProfileMenu(false); lockSessionManually(); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F7FA] flex items-center gap-2 text-[#20242A]"
                >
                  <Lock className="w-4 h-4 text-[#0B1F6A]" /> Lock Enclave Session
                </button>
                <button
                  type="button"
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-[#B42318] flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-[#B42318]" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Horizontal Banking Navigation Bar */}
      <div className="lg:hidden bg-white border-b border-[#D8DEE8] px-4 overflow-x-auto scrollbar-none flex items-center gap-6 text-xs sm:text-sm font-semibold h-[48px] select-none text-[#20242A] shrink-0 sticky top-[84px] z-20 shadow-2xs">
        {/* Dashboard Link */}
        <button
          type="button"
          onClick={() => navigateTo('/dashboard')}
          className={`h-full flex items-center relative whitespace-nowrap cursor-pointer transition-colors ${
            currentRoute === '/dashboard' || currentRoute === '/'
              ? 'text-[#101F7A] font-bold'
              : 'text-[#20242A] hover:text-[#0B1F6A]'
          }`}
        >
          <span>Dashboard</span>
          {(currentRoute === '/dashboard' || currentRoute === '/') && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#101F7A]" />
          )}
        </button>

        {/* Accounts Link */}
        <button
          type="button"
          onClick={() => navigateTo('/accounts')}
          className={`h-full flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
            currentRoute === '/accounts' ? 'text-[#101F7A] font-bold' : 'text-[#20242A] hover:text-[#0B1F6A]'
          }`}
        >
          <span>Accounts</span>
          <span className="text-[9px] text-[#5F6670]">▼</span>
        </button>

        {/* Transactions Link */}
        <button
          type="button"
          onClick={() => navigateTo('/transactions')}
          className={`h-full flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
            currentRoute === '/transactions' || currentRoute === '/transfers' ? 'text-[#101F7A] font-bold' : 'text-[#20242A] hover:text-[#0B1F6A]'
          }`}
        >
          <span>Transactions</span>
          <span className="text-[9px] text-[#5F6670]">▼</span>
        </button>

        {/* Reporting Link */}
        <button
          type="button"
          onClick={() => navigateTo('/documents')}
          className={`h-full flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
            currentRoute === '/documents' ? 'text-[#101F7A] font-bold' : 'text-[#20242A] hover:text-[#0B1F6A]'
          }`}
        >
          <span>Reporting</span>
          <span className="text-[9px] text-[#5F6670]">▼</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-lg max-w-md w-full border border-[#D8DEE8] p-5 space-y-4 shadow-lg text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
              <span className="font-bold text-[#0B1F6A] text-sm">Client Support Hotline</span>
              <button onClick={() => setShowHelpModal(false)}>
                <X className="w-4 h-4 text-[#5F6670]" />
              </button>
            </div>
            <p className="text-[#5F6670]">
              Contact your wealth advisor or client support 24/7 at +1 (800) 468-2352.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
