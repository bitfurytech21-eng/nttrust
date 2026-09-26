import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  UserPlus,
  ShieldCheck,
  Building2,
  Wallet,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  BadgeCheck,
  CreditCard,
  Lock,
  Globe,
  DollarSign
} from 'lucide-react';
import { UserProfile, AccountType, UserRole } from '../../types/banking';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';

interface AdminCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCustomer: UserProfile) => void;
}

export const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createCustomerAccount, roles } = useBanking();

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'compliance'>('profile');
  const [provisionAccount, setProvisionAccount] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    customer: UserProfile;
    account?: any;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (212) 555-0188');
  const [role, setRole] = useState<UserRole>('client');
  const [tier, setTier] = useState<string>('Private Wealth');
  const [occupation, setOccupation] = useState('Accredited Private Investor & Enterprise Founder');
  const [dateOfBirth, setDateOfBirth] = useState('1984-06-18');
  const [taxId, setTaxId] = useState('984-21-4091');
  const [street, setStreet] = useState('740 Park Avenue, Suite 19B');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [postalCode, setPostalCode] = useState('10021');
  const [country, setCountry] = useState('United States');

  // Account Provisioning State
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [initialDeposit, setInitialDeposit] = useState('250000');
  const [customAccountNumber, setCustomAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('071000288');

  // Compliance State
  const [kycTier, setKycTier] = useState<UserProfile['kycTier']>('Tier 3 (Institutional/Private)');
  const [kycStatus, setKycStatus] = useState<UserProfile['kycStatus']>('verified');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  if (!isOpen) return null;

  // Auto-fill username & email when name changes
  const handleFullNameChange = (name: string) => {
    setFullName(name);
    if (!preferredName || preferredName === fullName.split(' ')[0]) {
      setPreferredName(name.split(' ')[0] || '');
    }
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    if (!username || username === fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')) {
      setUsername(clean);
    }
    if (!email || email.includes('@northerntrust-client.com')) {
      setEmail(clean ? `${clean}@northerntrust-client.com` : '');
    }
    if (!accountName || accountName.includes("'s Private")) {
      setAccountName(name ? `${name}'s Private Checking` : '');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full legal name is required.');
      setActiveTab('profile');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('A valid email address is required for institutional onboarding.');
      setActiveTab('profile');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedAccNum = customAccountNumber.trim() || `8820${Math.floor(10000000 + Math.random() * 90000000)}`;

      const customerPayload: Partial<UserProfile> = {
        fullName: fullName.trim(),
        preferredName: preferredName.trim() || fullName.trim().split(' ')[0],
        username: username.trim() || fullName.toLowerCase().replace(/[^a-z0-9]/g, '.'),
        email: email.trim(),
        phone: phone.trim(),
        role,
        tier,
        occupation: occupation.trim(),
        dateOfBirth,
        taxIdMasked: taxId.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim()
        },
        kycTier,
        kycStatus,
        twoFactorEnabled
      };

      const accountPayload = provisionAccount
        ? {
            accountNumber: generatedAccNum,
            routingNumber: routingNumber.trim() || '071000288',
            name: accountName.trim() || `${fullName.trim()}'s Private ${accountType === 'savings' ? 'Savings' : 'Checking'}`,
            type: accountType,
            currency,
            balance: parseFloat(initialDeposit) || 0,
            initialDeposit: parseFloat(initialDeposit) || 0,
            status: 'active' as const,
            colorTheme: accountType === 'savings' ? 'emerald' : 'navy'
          }
        : undefined;

      const result = await createCustomerAccount({
        customer: customerPayload,
        account: accountPayload
      });

      setCreatedResult(result);
      if (onSuccess) {
        onSuccess(result.customer);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create user account. Please check parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-[#20242A]">
      <div className="w-full max-w-3xl bg-white rounded-xl border border-[#D8DEE8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#0B1F6A] text-white flex items-center justify-between border-b border-[#081552]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 shadow-xs">
              <NorthernTrustLogo className="w-full h-full text-[#147A52]" color="#147A52" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-serif tracking-tight">
                  Northern Trust
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase tracking-wider">
                  Admin Onboarding Enclave
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Accredited Investor &amp; User Account Provisioning Terminal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdResult ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#147A52] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#20242A]">
                User Account Successfully Provisioned
              </h2>
              <p className="text-xs text-[#5F6670] max-w-md mx-auto">
                Accredited profile and ledger accounts are now live, cryptographic keys generated, and credentials ready for institutional sign-in.
              </p>
            </div>

            {/* Account Credentials Card */}
            <div className="bg-[#F5F7FA] rounded-xl border border-[#D8DEE8] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D8DEE8] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6670] font-mono">
                  Client Credentials &amp; CIF Identity
                </span>
                <span className="text-xs font-bold text-[#147A52] bg-[#147A52]/10 px-2 py-0.5 rounded font-mono">
                  {createdResult.customer.tier}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#5F6670] block text-[11px]">Full Legal Name:</span>
                  <span className="font-bold text-[#20242A] text-sm">{createdResult.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-[#5F6670] block text-[11px]">Assigned Client ID (CIF):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#147A52] text-sm">{createdResult.customer.clientId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdResult.customer.clientId, 'cif')}
                      className="p-1 text-[#5F6670] hover:text-[#20242A] cursor-pointer"
                    >
                      {copiedText === 'cif' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[#5F6670] block text-[11px]">Username / Sign In ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#20242A]">{createdResult.customer.username}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdResult.customer.username, 'username')}
                      className="p-1 text-[#5F6670] hover:text-[#20242A] cursor-pointer"
                    >
                      {copiedText === 'username' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[#5F6670] block text-[11px]">Secure Email:</span>
                  <span className="font-mono text-[#20242A]">{createdResult.customer.email}</span>
                </div>
              </div>

              {createdResult.account && (
                <div className="pt-3 border-t border-[#D8DEE8] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6670] font-mono block">
                    Provisioned Bank Account
                  </span>
                  <div className="bg-white p-3.5 rounded-lg border border-[#D8DEE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-[#20242A] flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-[#147A52]" />
                        {createdResult.account.name}
                      </div>
                      <div className="text-[11px] text-[#5F6670] font-mono mt-0.5">
                        Account #: <strong className="text-[#20242A]">{createdResult.account.accountNumber}</strong> &bull; Routing: {createdResult.account.routingNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#5F6670] block">Opening Ledger Balance</span>
                      <span className="font-bold text-sm text-[#147A52] font-mono">
                        ${createdResult.account.balance.toLocaleString()} {createdResult.account.currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedResult(null);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-lg bg-[#147A52] hover:bg-[#0f6040] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Complete Onboarding &amp; Return to Directory
              </button>
            </div>
          </div>
        ) : (
          /* Creation Form */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="px-6 pt-3 bg-[#F5F7FA] border-b border-[#D8DEE8] flex items-center gap-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'border-[#147A52] text-[#147A52] font-bold'
                    : 'border-transparent text-[#5F6670] hover:text-[#20242A]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> 1. Client Identity &amp; Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'account'
                    ? 'border-[#147A52] text-[#147A52] font-bold'
                    : 'border-transparent text-[#5F6670] hover:text-[#20242A]'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" /> 2. Bank Account Provisioning
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compliance')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'compliance'
                    ? 'border-[#147A52] text-[#147A52] font-bold'
                    : 'border-transparent text-[#5F6670] hover:text-[#20242A]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> 3. Compliance &amp; KYC
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Full Legal Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => handleFullNameChange(e.target.value)}
                        placeholder="e.g. Alexander Vance Wright"
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] focus:outline-none focus:border-[#147A52]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Preferred Name / Salutation
                      </label>
                      <input
                        type="text"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] focus:outline-none focus:border-[#147A52]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Username / Sign-In Identifier <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. alexander.wright"
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-mono focus:outline-none focus:border-[#147A52]"
                      />
                      <span className="text-[10px] text-[#5F6670] mt-0.5 block">
                        Client can sign into the portal using this username or their account number.
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Official Contact Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. alexander@sovereign-family.com"
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] focus:outline-none focus:border-[#147A52]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (212) 555-0100"
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-mono focus:outline-none focus:border-[#147A52]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        User Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-semibold focus:outline-none focus:border-[#147A52] cursor-pointer"
                      >
                        {roles && roles.length > 0 ? (
                          roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} {r.id === 'restricted_client' ? '(Restricted)' : ''}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="client">Client (Accredited Wealth Account)</option>
                            <option value="restricted_client">Restricted Read-Only Client (No Transfers)</option>
                            <option value="admin">Super Admin (Operations Lead - Full Root)</option>
                            <option value="compliance_officer">Compliance &amp; AML Officer</option>
                            <option value="auditor">Independent Regulatory Auditor (Read-Only)</option>
                            <option value="treasury_manager">Institutional Treasury Manager</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Client Tier
                      </label>
                      <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-semibold focus:outline-none focus:border-[#147A52] cursor-pointer"
                      >
                        <option value="Private Wealth - Sovereign & Celebrity VIP">Private Wealth - Sovereign VIP</option>
                        <option value="Private Wealth">Private Wealth</option>
                        <option value="Premier Client">Premier Client</option>
                        <option value="Executive Sovereign">Executive Sovereign</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Occupation / Source of Wealth
                      </label>
                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] focus:outline-none focus:border-[#147A52]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] focus:outline-none focus:border-[#147A52]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        SSN / Tax Identification
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="***-**-4091"
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-mono focus:outline-none focus:border-[#147A52]"
                      />
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="pt-2 border-t border-[#D8DEE8]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5F6670] block mb-2 font-mono">
                      Physical Custodial Address
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium text-[#5F6670] mb-0.5">Street Address</label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#5F6670] mb-0.5">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#5F6670] mb-0.5">State / Region</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#5F6670] mb-0.5">Postal Code</label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#147A52] block">
                        Provision Primary Bank Account Automatically
                      </span>
                      <span className="text-[11px] text-[#5F6670]">
                        Creates checking/savings account, routing number, and initial deposit for client immediate access.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provisionAccount}
                        onChange={(e) => setProvisionAccount(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#147A52]"></div>
                    </label>
                  </div>

                  {provisionAccount && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#20242A] mb-1">
                            Account Type
                          </label>
                          <select
                            value={accountType}
                            onChange={(e) => {
                              const t = e.target.value as AccountType;
                              setAccountType(t);
                              if (fullName) {
                                setAccountName(`${fullName}'s Private ${t === 'savings' ? 'Savings' : t === 'investment' ? 'Custodial Investment' : 'Checking'}`);
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-semibold focus:outline-none focus:border-[#147A52] cursor-pointer"
                          >
                            <option value="checking">Private Checking Account</option>
                            <option value="savings">Private High-Yield Savings (4.85% APY)</option>
                            <option value="investment">Institutional Custodial Investment Portfolio</option>
                            <option value="multicurrency">Multi-Currency Global Treasury</option>
                            <option value="cd">Certificate of Deposit (Fixed Term)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#20242A] mb-1">
                            Account Display Name
                          </label>
                          <input
                            type="text"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="e.g. Primary Private Checking"
                            className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] focus:outline-none focus:border-[#147A52]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#20242A] mb-1">
                            Base Currency
                          </label>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-semibold focus:outline-none focus:border-[#147A52] cursor-pointer"
                          >
                            <option value="USD">USD ($) - United States Dollar</option>
                            <option value="EUR">EUR (€) - Eurozone</option>
                            <option value="GBP">GBP (£) - British Pound Sterling</option>
                            <option value="CHF">CHF (Fr.) - Swiss Franc</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#20242A] mb-1">
                            Initial Ledger Deposit ($)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-[#5F6670] font-bold text-xs">$</span>
                            <input
                              type="number"
                              value={initialDeposit}
                              onChange={(e) => setInitialDeposit(e.target.value)}
                              placeholder="250000"
                              className="w-full pl-7 pr-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs font-mono font-bold text-[#147A52] focus:outline-none focus:border-[#147A52]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#20242A] mb-1">
                            Custom Account # (Optional)
                          </label>
                          <input
                            type="text"
                            value={customAccountNumber}
                            onChange={(e) => setCustomAccountNumber(e.target.value)}
                            placeholder="Auto-generated (e.g. 8820...)"
                            className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs font-mono text-[#20242A] focus:outline-none focus:border-[#147A52]"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#D8DEE8] text-xs font-mono space-y-1">
                        <div className="flex justify-between text-[#5F6670]">
                          <span>Fedwire Routing Number:</span>
                          <span className="font-bold text-[#20242A]">071000288 (Northern Trust Chicago)</span>
                        </div>
                        <div className="flex justify-between text-[#5F6670]">
                          <span>SWIFT / BIC:</span>
                          <span className="font-bold text-[#20242A]">NTRSUS44XXX</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        KYC Assurance Tier
                      </label>
                      <select
                        value={kycTier}
                        onChange={(e) => setKycTier(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-semibold focus:outline-none focus:border-[#147A52] cursor-pointer"
                      >
                        <option value="Tier 3 (Institutional/Private)">Tier 3 (Institutional / Private Wealth VIP)</option>
                        <option value="Tier 2 (Full Verified)">Tier 2 (Full KYC Verified)</option>
                        <option value="Tier 1 (Standard)">Tier 1 (Standard Retail)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#20242A] mb-1">
                        Initial KYC Compliance Status
                      </label>
                      <select
                        value={kycStatus}
                        onChange={(e) => setKycStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] font-semibold focus:outline-none focus:border-[#147A52] cursor-pointer"
                      >
                        <option value="verified">Verified (Approved for Full Wire Access)</option>
                        <option value="pending_review">Pending Review (Compliance Hold)</option>
                        <option value="action_required">Action Required (Documents Needed)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-[#D8DEE8] rounded-xl space-y-3">
                    <span className="text-xs font-bold text-[#20242A] block">
                      Enforced Institutional Security Settings
                    </span>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                        className="w-4 h-4 text-[#147A52] rounded border-[#D8DEE8] focus:ring-[#147A52]"
                      />
                      <span className="text-xs text-[#20242A]">
                        Enforce Dual-Factor (2FA) SMS / Authenticator Challenge on Login &amp; Transfers
                      </span>
                    </label>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-[#0B1F6A] flex items-start gap-2">
                    <BadgeCheck className="w-4 h-4 text-[#147A52] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Immutable SIEM Regulatory Audit</span>
                      <span>
                        Creation of this user account and initial ledger balances will be recorded into the external SQL database with administrator timestamp and cryptographic footprint.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-[#F5F7FA] border-t border-[#D8DEE8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeTab !== 'profile' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'compliance' ? 'account' : 'profile')}
                    className="px-4 py-2 rounded-lg bg-white border border-[#D8DEE8] text-xs font-semibold text-[#20242A] hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                )}
                {activeTab !== 'compliance' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'profile' ? 'account' : 'compliance')}
                    className="px-4 py-2 rounded-lg bg-slate-200 text-xs font-semibold text-[#20242A] hover:bg-slate-300 cursor-pointer"
                  >
                    Next Step &rarr;
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-white border border-[#D8DEE8] text-xs font-semibold text-[#5F6670] hover:text-[#20242A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#147A52] hover:bg-[#0f6040] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Provisioning...' : 'Authorize & Create Account'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
