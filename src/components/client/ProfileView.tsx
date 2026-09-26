import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  User,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit2,
  Save,
  Building2,
  Phone,
  Briefcase,
  Calendar,
  KeyRound
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUserProfile } = useBanking();
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [street, setStreet] = useState(currentUser?.address?.street || '');
  const [city, setCity] = useState(currentUser?.address?.city || '');
  const [state, setState] = useState(currentUser?.address?.state || '');
  const [zip, setZip] = useState(currentUser?.address?.postalCode || '');
  const [country, setCountry] = useState(currentUser?.address?.country || '');
  const [occupation, setOccupation] = useState(currentUser?.occupation || 'Managing Director, Private Equity');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      email,
      phone,
      occupation,
      address: {
        street,
        city,
        state,
        postalCode: zip,
        country
      }
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> Verified KYC &amp; AML Profile
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Client Profile &amp; Account Details
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Manage your legal registration details, assigned relationship officer, and verified residential address.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-5 py-2.5 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Edit2 className="w-4 h-4 stroke-[2.25]" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Contact Details'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] flex items-center gap-2.5 text-xs font-bold shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 stroke-[2.25]" />
          <span>Profile information has been updated and synchronized with the compliance registry.</span>
        </div>
      )}

      {/* Main Grid: Profile Details Form + Advisory Desk Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8">
        {/* Left Column (8 cols): Personal Info */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-5 border-b-2 border-[#F5F7FA]">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName || 'Client Portrait'}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#147A52] border-2 border-emerald-400 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  {currentUser?.fullName?.slice(0, 2).toUpperCase() || 'AJ'}
                </div>
              )}
              <div>
                <h2 className="text-xl font-black text-[#20242A]">{currentUser?.fullName}</h2>
                <p className="text-xs text-[#5F6670] font-mono font-medium">Client ID: {currentUser?.clientId || 'NT-8820-CLIENT'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md bg-[#147A52]/10 text-[#147A52] border-2 border-emerald-300">
                    TIER 1 ACCREDITED
                  </span>
                  <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md bg-[#147A52]/10 text-[#147A52] border-2 border-emerald-300">
                    KYC APPROVED
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Full Legal Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Primary Phone (E.164)</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Occupation / Corporate Role</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#F5F7FA]">
                <h3 className="font-extrabold text-xs text-[#20242A] mb-3">Residential &amp; Tax Domicile</h3>
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-xs text-[#20242A] block mb-1.5">Street Address</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-xs text-[#20242A] block mb-1.5">City</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-xs text-[#20242A] block mb-1.5">State / Canton</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-xs text-[#20242A] block mb-1.5">Postal / ZIP</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#20242A] block mb-1.5">Country</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium disabled:bg-[#F5F7FA] disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-3 flex justify-end gap-2.5 border-t-2 border-[#F5F7FA]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#101F7A] hover:bg-[#081552] text-white font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Save className="w-4 h-4 stroke-[2.25]" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column (4 cols): Relationship Officer & Custody Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dedicated Private Banker (Arthur M. Sterling) */}
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
                <h3 className="text-sm font-black text-[#20242A]">Dedicated Private Banker</h3>
              </div>
              <span className="text-[10px] text-[#147A52] bg-[#147A52]/10 px-2 py-0.5 rounded-md border-2 border-emerald-300 font-black uppercase">
                Private Wealth
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#147A52] border-2 border-emerald-400 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                AS
              </div>
              <div>
                <span className="font-extrabold text-sm text-[#20242A] block">Arthur M. Sterling</span>
                <span className="text-xs text-[#5F6670] font-medium leading-tight block mt-0.5">
                  Senior Managing Director • Private Wealth Management &amp; Institutional Custody
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-2 text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-[#5F6670]">
                <Mail className="w-3.5 h-3.5 text-[#147A52] stroke-[2.25]" />
                <span className="text-[#20242A] font-mono font-medium">a.sterling@northerntrust.com</span>
              </div>
              <div className="flex items-center gap-2 text-[#5F6670]">
                <Phone className="w-3.5 h-3.5 text-[#147A52] stroke-[2.25]" />
                <a href="tel:+18005550192" className="text-[#20242A] hover:text-[#147A52] font-mono font-bold">
                  +1 (800) 555-0192
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#5F6670] pt-1.5 border-t-2 border-[#F5F7FA]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#147A52] stroke-[2.25]" />
                <span className="text-[11px] font-bold text-[#147A52]">Direct Fedwire Pre-Clearance Desk</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href="tel:+18005550192"
                className="py-2 px-3 rounded-xl bg-white hover:bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#147A52] text-center font-bold text-[#147A52] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 stroke-[2.25]" />
                <span>Call Banker</span>
              </a>
              <button
                type="button"
                onClick={() => window.location.href = '#/messages'}
                className="py-2 px-3 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white text-center font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 stroke-[2.25]" />
                <span>Send Dispatch</span>
              </button>
            </div>
          </div>

          {/* Assigned Wealth Advisor (Eleanor Vance) */}
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-black text-[#20242A] flex items-center gap-2 pb-3 border-b-2 border-[#F5F7FA]">
              <Building2 className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
              <span>Assigned Wealth Advisor</span>
            </h3>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-[#147A52] font-black shadow-2xs">
                EV
              </div>
              <div>
                <span className="font-extrabold text-sm text-[#20242A] block">Eleanor Vance</span>
                <span className="text-xs text-[#5F6670] font-medium">Senior Private Client Director</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-2 text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-[#5F6670]">
                <Mail className="w-3.5 h-3.5 text-[#147A52] stroke-[2.25]" />
                <span className="text-[#20242A] font-mono font-medium">e.vance@northerntrust.com</span>
              </div>
              <div className="flex items-center gap-2 text-[#5F6670]">
                <Phone className="w-3.5 h-3.5 text-[#147A52] stroke-[2.25]" />
                <span className="text-[#20242A] font-mono font-bold">+1 (800) 492-8000 ext. 401</span>
              </div>
            </div>
          </div>

          {/* Custody Enclave & Security Credentials */}
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-3.5 text-xs">
            <h3 className="text-sm font-black text-[#20242A] flex items-center gap-2 pb-3 border-b-2 border-[#F5F7FA]">
              <KeyRound className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
              <span>Custody Enclave &amp; Security</span>
            </h3>
            <div className="space-y-2 text-[#5F6670] font-medium">
              <div className="flex justify-between">
                <span>Primary Enclave:</span>
                <strong className="text-[#20242A] font-bold">US-NYC Private Banking Vault</strong>
              </div>
              <div className="flex justify-between">
                <span>Cryptographic Enclave:</span>
                <strong className="text-[#147A52] font-black">256-Bit Hardware HSM Synced</strong>
              </div>
              <div className="flex justify-between"><span>Password Status:</span><strong className="text-[#147A52] font-bold">Strong (Updated 14d ago)</strong></div>
              <div className="flex justify-between"><span>Hardware 2FA:</span><strong className="text-[#147A52] font-bold">YubiKey 5C NFC Active</strong></div>
              <div className="flex justify-between"><span>Biometric Passkey:</span><strong className="text-[#147A52] font-bold">Enrolled</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
