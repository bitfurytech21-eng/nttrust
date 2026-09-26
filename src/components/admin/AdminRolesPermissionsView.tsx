import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  KeyRound,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  Search,
  Eye,
  Plus,
  Edit3,
  Trash2,
  Settings,
  Sparkles,
  Save,
  X,
  AlertTriangle,
  UserCheck,
  Building2,
  ArrowRight
} from 'lucide-react';
import { UserProfile, UserRole, PermissionAction } from '../../types/banking';
import { ALL_PERMISSIONS, SYSTEM_ROLES, getEffectivePermissions, hasPermission } from '../../utils/permissions';
import { InternalCommandTotpModal } from './InternalCommandTotpModal';

export const AdminRolesPermissionsView: React.FC = () => {
  const {
    allCustomers,
    currentUser,
    updateCustomerProfile,
    logAdminSqlAction
  } = useBanking();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editUserModal, setEditUserModal] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [useCustomPermissions, setUseCustomPermissions] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Filter users
  const filteredUsers = allCustomers.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.clientId.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalClients = allCustomers.length;
  const adminCount = allCustomers.filter(u => u.role === 'admin' || u.role === 'compliance_officer' || u.role === 'auditor').length;
  const restrictedCount = allCustomers.filter(u => u.role === 'restricted_client').length;
  const fullAccessCount = allCustomers.filter(u => {
    const perms = getEffectivePermissions(u);
    return perms.includes('full_access') || perms.includes('*');
  }).length;

  const handleOpenEdit = (user: UserProfile) => {
    setEditUserModal(user);
    setSelectedRole(user.role || 'client');
    const perms = getEffectivePermissions(user);
    setCustomPermissions([...perms]);
    setUseCustomPermissions(Array.isArray(user.permissions) && user.permissions.length > 0);
  };

  const handleTogglePermission = (permId: string) => {
    setCustomPermissions((prev) => {
      if (prev.includes(permId)) {
        return prev.filter(p => p !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const handleRoleSelect = (newRole: UserRole) => {
    setSelectedRole(newRole);
    const roleDef = SYSTEM_ROLES.find(r => r.id === newRole);
    if (roleDef && !useCustomPermissions) {
      setCustomPermissions([...roleDef.defaultPermissions]);
    }
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;

    const previousRole = editUserModal.role;
    const finalPermissions = useCustomPermissions ? customPermissions : undefined;

    const updates: Partial<UserProfile> = {
      role: selectedRole,
      permissions: finalPermissions
    };

    updateCustomerProfile(editUserModal.id, updates);

    await logAdminSqlAction({
      action: 'ROLE_PERMISSIONS_MODIFIED',
      targetEntityType: 'customer',
      targetEntityId: editUserModal.id,
      fieldsChanged: {
        role: { from: previousRole, to: selectedRole },
        customPermissionsAssigned: {
          from: editUserModal.permissions?.length || 0,
          to: finalPermissions?.length || 0
        }
      },
      details: `Administrator modified security role of ${editUserModal.fullName} from ${previousRole} to ${selectedRole}. Specific permissions enforced: ${customPermissions.join(', ')}.`
    });

    fetch('/api/banking/roles/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: editUserModal.id,
        role: selectedRole,
        permissions: finalPermissions
      })
    }).catch(() => {});

    setSaveSuccessMsg(`Permissions & security role for ${editUserModal.fullName} successfully updated!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
    setEditUserModal(null);
  };

  // Helper to test / impersonate role in dev preview
  const handleQuickSwitchRole = (targetRole: UserRole) => {
    if (!currentUser) return;
    const roleDef = SYSTEM_ROLES.find(r => r.id === targetRole);
    const perms = roleDef ? roleDef.defaultPermissions : ['full_access'];

    updateCustomerProfile(currentUser.id, {
      role: targetRole,
      permissions: perms
    });

    setSaveSuccessMsg(`Current active session switched to: ${roleDef?.name || targetRole}. Navigate to client or admin views to test permissions.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-[#D8DEE8] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Granular Access Control Policy Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F6A] tracking-tight">
            Role &amp; Permission-Based Access Controls (RBAC)
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium max-w-2xl">
            Configure discrete permissions (View, Create, Edit, Delete, Manage, Full Access) for all user accounts and institutional operator profiles.
          </p>
        </div>

        {/* Global Save Notice Banner */}
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#147A52] rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE8] shadow-xs">
          <span className="text-[11px] font-bold text-[#5F6670] uppercase tracking-wider block font-mono">Total Users</span>
          <div className="text-2xl font-bold text-[#0B1F6A] mt-1">{totalClients}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Configured Enclave Accounts</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE8] shadow-xs">
          <span className="text-[11px] font-bold text-[#147A52] uppercase tracking-wider block font-mono">Full Access Root</span>
          <div className="text-2xl font-bold text-[#147A52] mt-1">{fullAccessCount}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Supervisory Staff Clearances</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE8] shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block font-mono">Officers &amp; Admins</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{adminCount}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Ops &amp; Compliance Operators</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE8] shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block font-mono">Restricted / Read-Only</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{restrictedCount}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Wire Restrictions Enforced</span>
        </div>
      </div>

      {/* Role Switcher & Live Simulation Playground */}
      <div className="bg-[#F5F7FA] p-4 sm:p-5 rounded-xl border border-[#D8DEE8] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-xs text-[#0B1F6A] flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#147A52]" /> Live Session Role Impersonation &amp; Clearance Testing
            </span>
            <p className="text-[11px] text-[#5F6670] mt-0.5">
              Simulate how the portal restricts features and denies access under different roles in real-time.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-[#147A52] bg-white px-3 py-1 rounded border border-[#D8DEE8]">
            Active Role: <strong className="text-[#0B1F6A] uppercase">{currentUser?.role || 'admin'}</strong>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {SYSTEM_ROLES.map((r) => {
            const isCurrent = currentUser?.role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleQuickSwitchRole(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#0B1F6A] text-white shadow-xs'
                    : 'bg-white text-[#5F6670] border border-[#D8DEE8] hover:border-[#0B1F6A] hover:text-[#0B1F6A]'
                }`}
              >
                <span>{r.name}</span>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Accounts Directory with Permissions Matrix */}
      <div className="bg-white rounded-xl border border-[#D8DEE8] shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-[#D8DEE8] bg-[#F5F7FA] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6670]" />
            <input
              type="text"
              placeholder="Search user name, email, role, or CIF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D8DEE8] rounded-lg focus:outline-none focus:border-[#0B1F6A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-[#5F6670] uppercase font-mono">Role Filter:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#D8DEE8] rounded-lg text-xs font-semibold text-[#20242A] focus:outline-none focus:border-[#0B1F6A] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Super Admin</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="auditor">Auditor</option>
              <option value="treasury_manager">Treasury Manager</option>
              <option value="client">Wealth Client</option>
              <option value="restricted_client">Restricted Read-Only</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#5F6670] font-bold border-b border-[#D8DEE8] text-[11px] uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4">User &amp; CIF</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-2 text-center" title="Access & View Information">👁️ View</th>
                <th className="py-3 px-2 text-center" title="Create Records & Transfers">➕ Create</th>
                <th className="py-3 px-2 text-center" title="Modify Profiles & Settings">✏️ Edit</th>
                <th className="py-3 px-2 text-center" title="Delete Records">🗑️ Delete</th>
                <th className="py-3 px-2 text-center" title="Manage Users & KYC">⚙️ Manage</th>
                <th className="py-3 px-2 text-center" title="Full Root Authority">🛡️ Full</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE8]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#5F6670]">
                    No accounts found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const perms = getEffectivePermissions(user);
                  const isFull = perms.includes('full_access') || perms.includes('*');

                  const hasView = isFull || perms.some(p => p.startsWith('view:'));
                  const hasCreate = isFull || perms.some(p => p.startsWith('create:'));
                  const hasEdit = isFull || perms.some(p => p.startsWith('edit:'));
                  const hasDelete = isFull || perms.some(p => p.startsWith('delete:'));
                  const hasManage = isFull || perms.some(p => p.startsWith('manage:'));

                  const roleDef = SYSTEM_ROLES.find(r => r.id === user.role);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#20242A] text-xs flex items-center gap-1.5">
                          <span>{user.fullName}</span>
                          {user.role === 'admin' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 text-red-700 font-bold uppercase font-mono">
                              Staff
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#5F6670] font-mono">
                          {user.clientId} &bull; {user.email}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'compliance_officer'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'auditor'
                            ? 'bg-slate-100 text-slate-800'
                            : user.role === 'restricted_client'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-[#147A52]'
                        }`}>
                          {roleDef?.name || user.role}
                        </span>
                        {user.permissions && user.permissions.length > 0 && (
                          <span className="text-[10px] text-purple-700 block font-mono font-medium mt-0.5">
                            Custom Overrides ({user.permissions.length})
                          </span>
                        )}
                      </td>

                      {/* 6 Permission Verbs */}
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold ${
                          hasView ? 'bg-emerald-100 text-[#147A52]' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {hasView ? '✓' : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold ${
                          hasCreate ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {hasCreate ? '✓' : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold ${
                          hasEdit ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {hasEdit ? '✓' : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold ${
                          hasDelete ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {hasDelete ? '✓' : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold ${
                          hasManage ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {hasManage ? '✓' : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold ${
                          isFull ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isFull ? '★' : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="px-3 py-1.5 rounded-lg bg-[#0B1F6A] hover:bg-[#081552] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Configure Permissions</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Configuration Modal */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-[#20242A]">
          <div className="w-full max-w-3xl bg-white rounded-xl border border-[#D8DEE8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0B1F6A] text-white flex items-center justify-between border-b border-[#081552]">
              <div>
                <span className="font-bold text-base font-serif block">
                  Configure Permissions for {editUserModal.fullName}
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  CIF: {editUserModal.clientId} &bull; Email: {editUserModal.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#20242A] mb-1 uppercase font-mono">
                    Assigned Security Role Template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {SYSTEM_ROLES.map((r) => {
                      const isSel = selectedRole === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => handleRoleSelect(r.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSel
                              ? 'border-[#147A52] bg-emerald-50/40 text-[#20242A]'
                              : 'border-[#D8DEE8] hover:border-slate-400 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs">{r.name}</span>
                            {isSel && <CheckCircle2 className="w-4 h-4 text-[#147A52]" />}
                          </div>
                          <p className="text-[11px] text-[#5F6670] leading-snug">{r.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Granular Overrides Toggle */}
                <div className="pt-3 border-t border-[#D8DEE8]">
                  <div className="flex items-center justify-between p-3.5 bg-[#F5F7FA] rounded-xl border border-[#D8DEE8]">
                    <div>
                      <span className="font-bold text-xs text-[#0B1F6A] block">
                        Enable Custom Granular Permissions Overrides
                      </span>
                      <span className="text-[11px] text-[#5F6670]">
                        Toggle specific permissions individually beyond the base role preset.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCustomPermissions}
                        onChange={(e) => {
                          setUseCustomPermissions(e.target.checked);
                          if (e.target.checked && customPermissions.length === 0) {
                            const roleDef = SYSTEM_ROLES.find(r => r.id === selectedRole);
                            setCustomPermissions(roleDef ? [...roleDef.defaultPermissions] : ['view:dashboard']);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#147A52]"></div>
                    </label>
                  </div>
                </div>

                {/* Granular Permissions Checklist */}
                {useCustomPermissions && (
                  <div className="space-y-4 pt-1">
                    {(['View', 'Create', 'Edit', 'Delete', 'Manage', 'Full Access'] as const).map((cat) => {
                      const permsInCat = ALL_PERMISSIONS.filter(p => p.category === cat);
                      if (permsInCat.length === 0) return null;

                      return (
                        <div key={cat} className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F6A] font-mono block">
                            {cat} Permissions
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {permsInCat.map((p) => {
                              const checked = customPermissions.includes(p.id) || customPermissions.includes('full_access');
                              return (
                                <label
                                  key={p.id}
                                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-colors ${
                                    checked
                                      ? 'bg-emerald-50/50 border-emerald-300 text-[#20242A]'
                                      : 'bg-white border-[#D8DEE8] text-[#5F6670] hover:border-slate-400'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleTogglePermission(p.id)}
                                    className="mt-0.5 rounded border-[#D8DEE8] text-[#147A52] focus:ring-[#147A52]"
                                  />
                                  <div>
                                    <span className="font-bold text-xs text-[#20242A] block leading-tight">
                                      {p.name}
                                    </span>
                                    <span className="text-[10px] text-[#5F6670] leading-tight block mt-0.5">
                                      {p.description}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-[#F5F7FA] border-t border-[#D8DEE8] flex items-center justify-between">
                <span className="text-xs text-[#5F6670] font-mono">
                  {useCustomPermissions ? `${customPermissions.length} permissions configured` : 'Using standard role preset'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditUserModal(null)}
                    className="px-4 py-2 rounded-lg bg-white border border-[#D8DEE8] text-xs font-semibold text-[#5F6670] hover:text-[#20242A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#147A52] hover:bg-[#0f6040] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Apply Permissions</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
