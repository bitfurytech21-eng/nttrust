import React from 'react';
import { BankingProvider, useBanking } from './context/BankingContext';
import { ShieldAlert, KeyRound, ArrowLeft, Building2 } from 'lucide-react';

// Auth Views
import { LoginView } from './components/auth/LoginView';
import { TwoFactorVerificationView } from './components/auth/TwoFactorVerificationView';
import { RegisterDeviceView } from './components/auth/RegisterDeviceView';
import { UnlockAccountView } from './components/auth/UnlockAccountView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { SecurityCenterView } from './components/auth/SecurityCenterView';
import { TrustedDevicesPublicView } from './components/auth/TrustedDevicesPublicView';

// Layouts & Modals
import { ClientNavbar } from './components/layout/ClientNavbar';
import { ClientSidebar } from './components/layout/ClientSidebar';
import { AdminNavbar } from './components/layout/AdminNavbar';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { SessionLockModal } from './components/layout/SessionLockModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { RegulatoryLogos } from './components/common/RegulatoryLogos';
import { DigitalWaveBackground } from './components/common/DigitalWaveBackground';

// Client Views
import { DashboardView } from './components/client/DashboardView';
import { AccountsView } from './components/client/AccountsView';
import { TransactionsView } from './components/client/TransactionsView';
import { TransfersView } from './components/client/TransfersView';
import { BeneficiariesView } from './components/client/BeneficiariesView';
import { PaymentsView } from './components/client/PaymentsView';
import { CardsView } from './components/client/CardsView';
import { DocumentsView } from './components/client/DocumentsView';
import { MessagesView } from './components/client/MessagesView';
import { NotificationsView } from './components/client/NotificationsView';
import { ProfileView } from './components/client/ProfileView';
import { SettingsView } from './components/client/SettingsView';
import { SecuritySettingsView } from './components/client/SecuritySettingsView';
import { ServicesView } from './components/client/ServicesView';
import { CheckServicesView } from './components/client/CheckServicesView';
import { FxExchangeView } from './components/client/FxExchangeView';
import { LendingView } from './components/client/LendingView';
import { TaxDashboardView } from './components/client/TaxDashboardView';
import { EventsView } from './components/client/EventsView';

// Admin Views
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminCustomersView } from './components/admin/AdminCustomersView';
import { AdminAccountsView } from './components/admin/AdminAccountsView';
import { AdminTransactionsView } from './components/admin/AdminTransactionsView';
import { AdminTransfersView } from './components/admin/AdminTransfersView';
import { AdminDocumentsView } from './components/admin/AdminDocumentsView';
import { AdminSupportView } from './components/admin/AdminSupportView';
import { AdminAuditView } from './components/admin/AdminAuditView';
import { AdminAuthenticatorView } from './components/admin/AdminAuthenticatorView';
import { AdminRolesPermissionsView } from './components/admin/AdminRolesPermissionsView';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { AccessDeniedModal } from './components/common/AccessDeniedModal';
import { isRoutePermitted } from './utils/permissions';

const BankingAppInner: React.FC = () => {
  const {
    authStage,
    currentRoute,
    isAdminMode,
    setIsAdminMode,
    navigateTo,
    logout,
    currentUser,
    isMobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer
  } = useBanking();

  // 1. Unauthenticated Flow
  if (authStage === 'unauthenticated') {
    // Dedicated Institutional Admin Portal Login Gateway
    if (currentRoute === '/admin/login' || currentRoute === '/admin') {
      return <AdminLoginView />;
    }
    if (currentRoute === '/forgot-password' || currentRoute === '/forgot-username' || currentRoute === '/reset-password') {
      return <ForgotPasswordView mode={currentRoute === '/reset-password' ? 'reset-password' : currentRoute === '/forgot-username' ? 'forgot-username' : 'forgot-password'} />;
    }
    if (currentRoute === '/unlock-account') {
      return <UnlockAccountView />;
    }
    if (currentRoute === '/register-device') {
      return <RegisterDeviceView />;
    }
    if (currentRoute === '/security-center' || currentRoute === '/security') {
      return <SecurityCenterView />;
    }
    if (currentRoute === '/trusted-devices' || currentRoute === '/authentication/trusted-device') {
      return <TrustedDevicesPublicView />;
    }
    return <LoginView />;
  }

  // 2. Awaiting 2FA Verification Flow
  if (authStage === 'awaiting_2fa') {
    return <TwoFactorVerificationView />;
  }

  // 3. Awaiting Device Registration Flow
  if (authStage === 'awaiting_device_registration') {
    return <RegisterDeviceView />;
  }

  // 4. Locked Account Flow
  if (authStage === 'locked') {
    return <UnlockAccountView />;
  }

  // 5. Dedicated Institutional Admin Portal (Authorized Ops Mode)
  if (isAdminMode) {
    const adminRoutePerm = isRoutePermitted(currentUser, currentRoute);

    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#20242A] flex flex-col">
        <AdminNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto p-2 sm:p-5 lg:p-6 bg-[#F5F7FA]">
            <div className="w-full max-w-[1560px] mx-auto">
              {!adminRoutePerm.permitted ? (
                <AccessDeniedView requiredPermission={adminRoutePerm.requiredPermission} />
              ) : (
                <>
                  {currentRoute === '/admin/customers' && <AdminCustomersView />}
                  {currentRoute === '/admin/accounts' && <AdminAccountsView />}
                  {currentRoute === '/admin/transactions' && <AdminTransactionsView />}
                  {currentRoute === '/admin/transfers' && <AdminTransfersView />}
                  {currentRoute === '/admin/documents' && <AdminDocumentsView />}
                  {currentRoute === '/admin/roles' && <AdminRolesPermissionsView />}
                  {currentRoute === '/admin/support' && <AdminSupportView />}
                  {currentRoute === '/admin/audit' && <AdminAuditView />}
                  {currentRoute === '/admin/authenticator' && <AdminAuthenticatorView />}
                  {(currentRoute === '/admin/dashboard' || currentRoute === '/admin' || (!currentRoute.startsWith('/admin/') && currentRoute !== '/admin/authenticator')) && (
                    <AdminDashboardView />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
        {/* Institutional Admin Navy Footer */}
        <footer className="bg-[#0B1F6A] border-t border-[#081552] px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs text-slate-200 z-20 shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
            <span className="font-semibold text-white">Northern Trust</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="text-slate-300">Institutional Operations Enclave</span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline text-slate-400 font-mono">Regulated Node NYC-HQ-CLEARING-01</span>
          </div>
          <RegulatoryLogos variant="navy-footer" showDetails={false} />
        </footer>
        <SessionLockModal />
        <AccessDeniedModal />
      </div>
    );
  }

  // 6. Security Clearance Challenge if Individual Client accesses /admin directly
  if (currentRoute.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#20242A] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-[#D8DEE8] p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-amber-50 text-[#B87500] border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldAlert className="w-7 h-7 stroke-[2.25]" />
          </div>
          <h2 className="text-xl font-bold text-[#0B1F6A]">Institutional Staff Clearance Required</h2>
          <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
            The requested operations module is restricted to authorized bank compliance officers and operations staff. Individual personal accounts do not have clearance to view internal bank ledgers.
          </p>
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                logout();
                navigateTo('/admin/login');
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#101F7A] hover:bg-[#081552] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <KeyRound className="w-4 h-4 stroke-[2.25]" /> Sign In via Institutional Staff Portal
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/dashboard')}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-[#F5F7FA] border border-[#D8DEE8] text-[#20242A] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#5F6670] stroke-[2.25]" /> Return to Individual Client Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. Individual Client Banking Portal Layout
  const clientRoutePerm = isRoutePermitted(currentUser, currentRoute);

  return (
    <div className="min-h-screen bg-[#070F2B] text-[#20242A] flex flex-col antialiased relative">
      {/* High-Impact Deep Animated Digital Wave Background */}
      <DigitalWaveBackground intensity="deep" />

      <ClientNavbar />
      <div className="flex flex-1 overflow-hidden relative z-10">
        {currentRoute !== '/dashboard' && currentRoute !== '/' && <ClientSidebar />}
        <main className={`flex-1 overflow-y-auto ${
          currentRoute === '/dashboard' || currentRoute === '/'
            ? 'px-1.5 sm:px-4 md:px-6 lg:px-8 py-3.5 sm:py-6'
            : 'px-1.5 py-3 sm:px-4 sm:py-5 lg:px-6'
        } pb-24 md:pb-10 bg-transparent scroll-smooth`}>
          <div className="w-full max-w-[1560px] mx-auto">
            {!clientRoutePerm.permitted ? (
              <AccessDeniedView requiredPermission={clientRoutePerm.requiredPermission} />
            ) : (
              <>
                {(currentRoute === '/dashboard' || currentRoute === '/') && <DashboardView />}
                {currentRoute === '/accounts' && <AccountsView />}
                {currentRoute === '/transactions' && <TransactionsView />}
                {currentRoute === '/transfers' && <TransfersView />}
                {currentRoute === '/beneficiaries' && <BeneficiariesView />}
                {currentRoute === '/payments' && <PaymentsView />}
                {currentRoute === '/cards' && <CardsView />}
                {currentRoute === '/documents' && <DocumentsView />}
                {(currentRoute === '/tax' || currentRoute === '/tax-history' || currentRoute === '/taxes') && <TaxDashboardView />}
                {currentRoute === '/messages' && <MessagesView />}
                {currentRoute === '/notifications' && <NotificationsView />}
                {currentRoute === '/profile' && <ProfileView />}
                {currentRoute === '/settings' && <SettingsView />}
                {currentRoute === '/security-settings' && <SecuritySettingsView />}
                {currentRoute === '/services' && <ServicesView />}
                {(currentRoute === '/checks' || currentRoute.startsWith('/checks')) && <CheckServicesView />}
                {(currentRoute === '/fx' || currentRoute.startsWith('/fx')) && <FxExchangeView />}
                {(currentRoute === '/lending' || currentRoute.startsWith('/lending') || currentRoute === '/credit') && <LendingView />}
                {(currentRoute === '/events' || currentRoute === '/meetings' || currentRoute === '/calendar') && <EventsView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation & Slide-Over Drawer */}
      <MobileBottomNav onOpenMobileMenu={openMobileDrawer} />
      <MobileDrawer isOpen={isMobileDrawerOpen} onClose={closeMobileDrawer} />

      <SessionLockModal />
      <AccessDeniedModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BankingProvider>
      <BankingAppInner />
    </BankingProvider>
  );
};
export default App;
