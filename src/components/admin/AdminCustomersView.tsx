import React, { useState, useRef } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Users,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  FileCheck,
  Edit3,
  Save,
  X,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Building2,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  BadgeCheck,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Sliders,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../../types/banking';
import { AdminCreateUserModal } from './AdminCreateUserModal';


export const AdminCustomersView: React.FC = () => {
  const { allCustomers, accounts, updateCustomerProfile, navigateTo } = useBanking();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(allCustomers[0]?.id || '');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<UserProfile | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Hidden direct file input ref for quick avatar update
  const directFileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState<{
    fullName: string;
    preferredName: string;
    email: string;
    phone: string;
    occupation: string;
    avatarUrl: string;
    role: UserProfile['role'];
    tier: UserProfile['tier'];
    kycTier: UserProfile['kycTier'];
    kycStatus: UserProfile['kycStatus'];
    accountLocked: boolean;
    twoFactorEnabled: boolean;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    taxIdMasked: string;
    dateOfBirth: string;
  }>({
    fullName: '',
    preferredName: '',
    email: '',
    phone: '',
    occupation: '',
    avatarUrl: '',
    role: 'client',
    tier: 'Private Wealth',
    kycTier: 'Tier 3 (Institutional/Private)',
    kycStatus: 'verified',
    accountLocked: false,
    twoFactorEnabled: true,
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxIdMasked: '',
    dateOfBirth: ''
  });

  const selectedCustomer = allCustomers.find(c => c.id === selectedCustomerId) || allCustomers[0];

  const filtered = allCustomers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.clientId.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.occupation && c.occupation.toLowerCase().includes(search.toLowerCase()));
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    const matchesKyc = kycFilter === 'all' || c.kycStatus === kycFilter;
    return matchesSearch && matchesTier && matchesKyc;
  });

  // Open edit modal pre-filled with customer data
  const handleOpenEditModal = (cust: UserProfile) => {
    setEditingCustomer(cust);
    setFormData({
      fullName: cust.fullName || '',
      preferredName: cust.preferredName || '',
      email: cust.email || '',
      phone: cust.phone || '',
      occupation: cust.occupation || '',
      avatarUrl: cust.avatarUrl || '',
      role: cust.role || 'client',
      tier: cust.tier || 'Private Wealth',
      kycTier: cust.kycTier || 'Tier 3 (Institutional/Private)',
      kycStatus: cust.kycStatus || 'verified',
      accountLocked: !!cust.accountLocked,
      twoFactorEnabled: !!cust.twoFactorEnabled,
      street: cust.address?.street || '',
      city: cust.address?.city || '',
      state: cust.address?.state || '',
      postalCode: cust.address?.postalCode || '',
      country: cust.address?.country || 'United States',
      taxIdMasked: cust.taxIdMasked || '',
      dateOfBirth: cust.dateOfBirth || '1980-01-01'
    });
    setSaveSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  // Submit edit form
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const updates: Partial<UserProfile> = {
      fullName: formData.fullName.trim(),
      preferredName: formData.preferredName.trim() || formData.fullName.split(' ')[0],
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      occupation: formData.occupation.trim(),
      avatarUrl: formData.avatarUrl.trim() || undefined,
      role: formData.role,
      tier: formData.tier,
      kycTier: formData.kycTier,
      kycStatus: formData.kycStatus,
      accountLocked: formData.accountLocked,
      twoFactorEnabled: formData.twoFactorEnabled,
      taxIdMasked: formData.taxIdMasked.trim(),
      dateOfBirth: formData.dateOfBirth,
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim()
      }
    };

    updateCustomerProfile(editingCustomer.id, updates);
    setSaveSuccessMsg(`Client profile & photo for ${formData.fullName} successfully updated.`);
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setIsEditModalOpen(false);
    }, 1200);
  };

  // Quick suspend/unsuspend toggle
  const handleToggleSuspend = (cust: UserProfile) => {
    const nextLocked = !cust.accountLocked;
    updateCustomerProfile(cust.id, { accountLocked: nextLocked });
  };

  // Direct Photo Upload
  const handleDirectPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>, targetCustId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSaveSuccessMsg('Photo size exceeds 5MB. Please upload an image under 5MB.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (base64Url) {
        updateCustomerProfile(targetCustId, { avatarUrl: base64Url });
        setSaveSuccessMsg('Profile picture updated successfully!');
        setTimeout(() => setSaveSuccessMsg(null), 2500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Modal Photo Upload
  const handleModalPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSaveSuccessMsg('Photo size exceeds 5MB. Please upload an image under 5MB.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (base64Url) {
        setFormData(prev => ({ ...prev, avatarUrl: base64Url }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Metrics
  const totalClients = allCustomers.length;
  const verifiedCount = allCustomers.filter(c => c.kycStatus === 'verified').length;
  const pendingCount = allCustomers.filter(c => c.kycStatus === 'pending_review' || c.kycStatus === 'action_required').length;
  const lockedCount = allCustomers.filter(c => c.accountLocked).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Hidden File Input for Quick Avatar Change */}
      <input
        type="file"
        ref={directFileInputRef}
        onChange={(e) => selectedCustomer && handleDirectPhotoFileChange(e, selectedCustomer.id)}
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#D8DEE8] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B1F6A]/10 border border-[#0B1F6A]/20 text-[#0B1F6A] text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" /> Customer Identity &amp; AML Surveillance
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F6A] tracking-tight">
            Customer Directory &amp; Profile Management
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Review accredited investor profiles, update profile pictures, manage KYC tiers, and adjust security controls in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#147A52] rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4.5 py-2.5 rounded-lg bg-[#147A52] hover:bg-[#0f6040] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User &amp; Account</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE8] shadow-xs">
          <span className="text-[11px] font-bold text-[#5F6670] uppercase tracking-wider block">Total Clients</span>
          <div className="text-2xl font-bold text-[#0B1F6A] mt-1">{totalClients}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Accredited Sovereign Accounts</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE8] shadow-xs">
          <span className="text-[11px] font-bold text-[#147A52] uppercase tracking-wider block">KYC Verified</span>
          <div className="text-2xl font-bold text-[#147A52] mt-1">{verifiedCount}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Tier-3 High Assurance</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE8] shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Under Audit</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Periodic Review Triggered</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE8] shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Suspended / Locked</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{lockedCount}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Access Temporarily Held</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Directory Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-[#D8DEE8] shadow-xs overflow-hidden">
            {/* Filters Bar */}
            <div className="p-4 border-b border-[#D8DEE8] bg-[#F5F7FA] flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6670]" />
                <input
                  type="text"
                  placeholder="Search name, CIF, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D8DEE8] rounded-lg focus:outline-none focus:border-[#0B1F6A]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="p-1.5 text-xs border border-[#D8DEE8] rounded-lg bg-white text-[#20242A] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Tiers</option>
                  <option value="Private Wealth">Private Wealth</option>
                  <option value="Premier Client">Premier Client</option>
                  <option value="Executive Sovereign">Executive Sovereign</option>
                </select>

                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  className="p-1.5 text-xs border border-[#D8DEE8] rounded-lg bg-white text-[#20242A] focus:outline-none cursor-pointer"
                >
                  <option value="all">All KYC Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="action_required">Action Required</option>
                </select>
              </div>
            </div>

            {/* Customers List */}
            <div className="divide-y divide-[#D8DEE8]">
              {filtered.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const custAccounts = accounts.filter(a => (a as any).userId === cust.id || cust.id === 'usr_client_001');
                const totalCustBalance = custAccounts.reduce((acc, a) => acc + a.balance, 0);

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-4 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#0B1F6A]/5 border-l-4 border-l-[#0B1F6A]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {cust.avatarUrl ? (
                          <img
                            src={cust.avatarUrl}
                            alt={cust.fullName}
                            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#0B1F6A]/10 text-[#0B1F6A] font-bold flex items-center justify-center text-sm border border-[#0B1F6A]/20">
                            {cust.fullName.charAt(0)}
                          </div>
                        )}
                        {cust.kycStatus === 'verified' && (
                          <CheckCircle2 className="w-4 h-4 text-[#147A52] bg-white rounded-full absolute -bottom-1 -right-1" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0B1F6A] truncate">
                            {cust.fullName}
                          </span>
                          {cust.accountLocked && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              Locked
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#5F6670] mt-0.5">
                          <span className="font-mono">{cust.clientId}</span>
                          <span>•</span>
                          <span className="truncate">{cust.occupation || cust.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-[#20242A]">
                        ${totalCustBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#5F6670] mt-1 inline-block">
                        {cust.tier}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="p-8 text-center text-[#5F6670]">
                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-xs">No client records match your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Dossier & Profile Picture Management */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCustomer ? (
            <div className="bg-white rounded-xl border border-[#D8DEE8] shadow-xs p-5 space-y-5">
              {/* Profile Card Header with Direct Photo Edit Controls */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-[#D8DEE8]">
                {/* Avatar with Quick Upload Hover Overlay */}
                <div className="relative group shrink-0">
                  {selectedCustomer.avatarUrl ? (
                    <img
                      src={selectedCustomer.avatarUrl}
                      alt={selectedCustomer.fullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D8DEE8] shadow-sm group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#0B1F6A] text-white font-bold flex items-center justify-center text-2xl shadow-sm">
                      {selectedCustomer.fullName.charAt(0)}
                    </div>
                  )}

                  {/* Camera overlay button */}
                  <button
                    type="button"
                    onClick={() => directFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Change Profile Picture (Upload File)"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-bold">Update Photo</span>
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg font-bold text-[#0B1F6A] truncate">
                      {selectedCustomer.fullName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20">
                      {selectedCustomer.kycTier}
                    </span>
                  </div>

                  <p className="text-xs text-[#5F6670] mt-1 font-mono">
                    CIF ID: <span className="font-bold text-[#20242A]">{selectedCustomer.clientId}</span>
                  </p>

                  {/* Photo Edit & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => directFileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-md bg-[#0B1F6A]/10 hover:bg-[#081552]/20 text-[#0B1F6A] font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-[#0B1F6A]/20"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedCustomer)}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-[#20242A] font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-[#D8DEE8] shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#5F6670]" />
                      <span>Edit Full Profile</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact & Demographics */}
              <div className="space-y-2.5 text-xs">
                <span className="text-[10px] font-bold text-[#5F6670] uppercase tracking-wider block font-mono">
                  Client Dossier &amp; Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
                    <span className="text-[10px] text-[#5F6670] block">Email Address</span>
                    <span className="font-semibold text-[#20242A] truncate block">{selectedCustomer.email}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
                    <span className="text-[10px] text-[#5F6670] block">Direct Telephone</span>
                    <span className="font-semibold text-[#20242A] font-mono">{selectedCustomer.phone}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
                    <span className="text-[10px] text-[#5F6670] block">Tax ID / SSN</span>
                    <span className="font-mono font-bold text-[#20242A]">{selectedCustomer.taxIdMasked}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
                    <span className="text-[10px] text-[#5F6670] block">Occupation &amp; Entity</span>
                    <span className="font-semibold text-[#20242A] truncate block">{selectedCustomer.occupation || 'Private Trustee'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
                  <span className="text-[10px] text-[#5F6670] block">Registered Residential Address</span>
                  <span className="font-medium text-[#20242A] text-[11.5px]">
                    {selectedCustomer.address?.street}, {selectedCustomer.address?.city}, {selectedCustomer.address?.state} {selectedCustomer.address?.postalCode}, {selectedCustomer.address?.country}
                  </span>
                </div>
              </div>

              {/* Security & Access Controls */}
              <div className="pt-2 border-t border-[#D8DEE8] space-y-2.5">
                <span className="text-[10px] font-bold text-[#5F6670] uppercase tracking-wider block font-mono">
                  Administrative Clearance Controls
                </span>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-[#D8DEE8]">
                  <div>
                    <span className="text-xs font-bold text-[#20242A] block">Account Status</span>
                    <span className="text-[11px] text-[#5F6670]">
                      {selectedCustomer.accountLocked ? 'Login credentials suspended' : 'Full active banking enclave access'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSuspend(selectedCustomer)}
                    className={`px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedCustomer.accountLocked
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-white hover:bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
                  >
                    {selectedCustomer.accountLocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock Access</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Suspend Access</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#D8DEE8] p-8 text-center text-[#5F6670]">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-xs">Select a customer to view and manage their dossier.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Customer Profile & Photo Modal */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#D8DEE8] shadow-2xl w-full max-w-2xl my-6 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#0B1F6A] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#147A52]" />
                  <span>Edit Profile &amp; Photo: {editingCustomer.fullName}</span>
                </h3>
                <span className="text-xs text-slate-300 font-mono">CIF ID: {editingCustomer.clientId}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-5 text-xs max-h-[78vh] overflow-y-auto">
              {/* Profile Photo Editor Section */}
              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] space-y-3">
                <span className="text-[11px] font-bold text-[#0B1F6A] uppercase font-mono tracking-wider block border-b border-[#D8DEE8] pb-1 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#0B1F6A]" />
                  <span>Profile Picture &amp; Visual Identity</span>
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="relative shrink-0">
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0B1F6A] shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#0B1F6A]/10 border-2 border-dashed border-[#D8DEE8] text-[#0B1F6A] font-bold flex items-center justify-center text-xl">
                        {formData.fullName.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & URL Input */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={modalFileInputRef}
                        onChange={handleModalPhotoFileChange}
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>

                      {formData.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                          className="px-2.5 py-1.5 rounded-md bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reset Photo</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Direct image URL"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] focus:border-[#0B1F6A] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Section 1: Core Identity Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#0B1F6A] uppercase font-mono tracking-wider block border-b border-[#D8DEE8] pb-1">
                  1. Full Legal Name &amp; Contact Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Preferred Salutation / Name</label>
                    <input
                      type="text"
                      value={formData.preferredName}
                      onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Primary Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Mobile Telephone</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#0B1F6A] block mb-1">Occupation &amp; Wealth Source</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Banking Tier & KYC */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-[#0B1F6A] uppercase font-mono tracking-wider block border-b border-[#D8DEE8] pb-1">
                  2. Institutional Tier &amp; Security Compliance
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Security Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none cursor-pointer"
                    >
                      <option value="client">Client (Accredited Wealth)</option>
                      <option value="restricted_client">Restricted Read-Only Client</option>
                      <option value="admin">Super Admin (Operations Lead)</option>
                      <option value="compliance_officer">Compliance &amp; AML Officer</option>
                      <option value="auditor">Auditor (Read-Only)</option>
                      <option value="treasury_manager">Treasury Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Private Banking Tier</label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none cursor-pointer"
                    >
                      <option value="Private Wealth">Private Wealth</option>
                      <option value="Premier Client">Premier Client</option>
                      <option value="Executive Sovereign">Executive Sovereign</option>
                      <option value="Institutional">Institutional</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Assigned KYC Level</label>
                    <select
                      value={formData.kycTier}
                      onChange={(e) => setFormData({ ...formData, kycTier: e.target.value as any })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none cursor-pointer"
                    >
                      <option value="Tier 3 (Institutional/Private)">Tier 3 (Institutional/Private)</option>
                      <option value="Tier 2 (Enhanced)">Tier 2 (Enhanced)</option>
                      <option value="Tier 1 (Standard)">Tier 1 (Standard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">KYC Audit Status</label>
                    <select
                      value={formData.kycStatus}
                      onChange={(e) => setFormData({ ...formData, kycStatus: e.target.value as any })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none cursor-pointer"
                    >
                      <option value="verified">Verified</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="action_required">Action Required</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#0B1F6A] block">Account Lock / Suspension</span>
                      <span className="text-[11px] text-[#5F6670]">Restrict or allow client login access</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.accountLocked}
                        onChange={(e) => setFormData({ ...formData, accountLocked: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#0B1F6A] block">Two-Factor Authentication</span>
                      <span className="text-[11px] text-[#5F6670]">Enforce TOTP / hardware 2FA key</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.twoFactorEnabled}
                        onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#147A52]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Legal Address & Regulatory Tax */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-[#0B1F6A] uppercase font-mono tracking-wider block border-b border-[#D8DEE8] pb-1">
                  3. Registered Legal Address &amp; Regulatory ID
                </span>

                <div>
                  <label className="font-bold text-[#0B1F6A] block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">State / Region</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-[#0B1F6A] block mb-1">Tax ID / SSN Masked</label>
                    <input
                      type="text"
                      value={formData.taxIdMasked}
                      onChange={(e) => setFormData({ ...formData, taxIdMasked: e.target.value })}
                      placeholder="•••-••-8924"
                      className="w-full p-2 border border-[#D8DEE8] rounded-md text-xs font-mono bg-white text-[#20242A] font-medium focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[#D8DEE8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-md bg-white hover:bg-slate-50 border border-[#D8DEE8] text-[#5F6670] font-semibold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>Save Profile &amp; Photo Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin User & Account Onboarding Modal */}
      <AdminCreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newCust) => {
          setSelectedCustomerId(newCust.id);
          setSaveSuccessMsg(`New accredited profile for ${newCust.fullName} (${newCust.clientId}) created!`);
          setTimeout(() => setSaveSuccessMsg(null), 3500);
        }}
      />
    </div>
  );
};
