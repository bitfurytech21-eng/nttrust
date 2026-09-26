import React from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  KeyRound,
  FileCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { NorthernTrustLogo } from './NorthernTrustLogo';
import { ALL_PERMISSIONS, SYSTEM_ROLES } from '../../utils/permissions';

interface AccessDeniedViewProps {
  requiredPermission?: string;
  attemptedFeature?: string;
  customMessage?: string;
  onBack?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  requiredPermission = 'view:dashboard',
  attemptedFeature,
  customMessage,
  onBack
}) => {
  const { currentUser, navigateTo } = useBanking();

  const permissionDef = ALL_PERMISSIONS.find(p => p.id === requiredPermission);
  const userRoleDef = SYSTEM_ROLES.find(r => r.id === currentUser?.role);

  const featureName = attemptedFeature || permissionDef?.name || requiredPermission;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border-2 border-red-200 shadow-xl overflow-hidden animate-fade-in text-[#20242A]">
        {/* Red Header Bar */}
        <div className="bg-red-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 shadow-xs">
              <NorthernTrustLogo className="w-full h-full text-red-700" color="#B91C1C" />
            </div>
            <div>
              <span className="font-bold text-sm block leading-tight font-serif">
                Access Authorization Restricted
              </span>
              <span className="text-[11px] text-red-100 font-mono tracking-wide uppercase">
                FinCEN / Institutional Enclave Security
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-full bg-red-800/80 text-white">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldAlert className="w-6 h-6 stroke-[2.25]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black font-serif text-[#20242A] leading-tight">
                Permission Denied for {featureName}
              </h2>
              <p className="text-xs text-[#5F6670] leading-relaxed">
                {customMessage ||
                  `Your user account role does not have authorization to view, execute, or manage this feature. Contact your institutional administrator or compliance desk for permission assignment.`}
              </p>
            </div>
          </div>

          {/* Diagnostic Role & Clearance Box */}
          <div className="bg-[#F5F7FA] rounded-xl border border-[#D8DEE8] p-4 text-xs space-y-2.5 font-mono">
            <div className="flex items-center justify-between border-b border-[#D8DEE8] pb-2 text-[11px]">
              <span className="text-[#5F6670] uppercase font-bold tracking-wider">Account Clearance</span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase">
                Unauthorized Action
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#5F6670] block">User Identifier:</span>
                <span className="font-bold text-[#20242A]">{currentUser?.fullName} ({currentUser?.clientId})</span>
              </div>
              <div>
                <span className="text-[#5F6670] block">Assigned Role:</span>
                <span className="font-bold text-[#0B1F6A]">{userRoleDef?.name || currentUser?.role || 'Client'}</span>
              </div>
              <div>
                <span className="text-[#5F6670] block">Required Permission:</span>
                <span className="font-bold text-red-600 font-mono">{requiredPermission}</span>
              </div>
              <div>
                <span className="text-[#5F6670] block">Permission Category:</span>
                <span className="font-bold text-[#20242A]">{permissionDef?.category || 'Operations'}</span>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              This restriction is enforced by Northern Trust Role-Based Access Control (RBAC). All unauthorized access attempts are logged with IP and cryptographic timestamps in the external SIEM audit ledger.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onBack ? onBack : () => navigateTo(currentUser?.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Permitted Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
