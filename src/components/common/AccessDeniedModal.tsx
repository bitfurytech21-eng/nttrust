import React from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  ShieldAlert,
  Lock,
  X,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { NorthernTrustLogo } from './NorthernTrustLogo';
import { ALL_PERMISSIONS, SYSTEM_ROLES } from '../../utils/permissions';

export const AccessDeniedModal: React.FC = () => {
  const { accessDeniedState, closeAccessDenied, currentUser } = useBanking();

  if (!accessDeniedState?.isOpen) return null;

  const { requiredPermission, attemptedFeature, customMessage } = accessDeniedState;
  const permissionDef = ALL_PERMISSIONS.find(p => p.id === requiredPermission);
  const userRoleDef = SYSTEM_ROLES.find(r => r.id === currentUser?.role);
  const featureName = attemptedFeature || permissionDef?.name || requiredPermission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-[#20242A]">
      <div className="w-full max-w-lg bg-white rounded-2xl border-2 border-red-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Red Header Bar with Northern Trust Logo */}
        <div className="bg-red-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 shadow-xs">
              <NorthernTrustLogo className="w-full h-full text-red-700" color="#B91C1C" />
            </div>
            <div>
              <span className="font-bold text-sm block leading-tight font-serif">
                Access Authorization Restricted
              </span>
              <span className="text-[10px] text-red-100 font-mono tracking-wide uppercase">
                FinCEN / Institutional Enclave Security
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAccessDenied}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldAlert className="w-6 h-6 stroke-[2.25]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold font-serif text-[#20242A] leading-snug">
                Permission Denied for {featureName}
              </h2>
              <p className="text-xs text-[#5F6670] leading-relaxed">
                {customMessage ||
                  `Your user account role does not possess the requisite permission to execute this operation. Unauthorized transactions and administrative requests are blocked by the enclave policy engine.`}
              </p>
            </div>
          </div>

          {/* Diagnostic Role & Clearance Box */}
          <div className="bg-[#F5F7FA] rounded-xl border border-[#D8DEE8] p-4 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-[#D8DEE8] pb-1.5 text-[11px]">
              <span className="text-[#5F6670] uppercase font-bold tracking-wider">Security Clearance Status</span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase text-[10px]">
                Restricted Action
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-[#5F6670] block text-[10px]">User Account:</span>
                <span className="font-bold text-[#20242A] truncate block">{currentUser?.fullName || 'Active User'}</span>
              </div>
              <div>
                <span className="text-[#5F6670] block text-[10px]">Assigned Role:</span>
                <span className="font-bold text-[#0B1F6A] truncate block">{userRoleDef?.name || currentUser?.role || 'Client'}</span>
              </div>
              <div>
                <span className="text-[#5F6670] block text-[10px]">Required Permission:</span>
                <span className="font-bold text-red-600 font-mono">{requiredPermission}</span>
              </div>
              <div>
                <span className="text-[#5F6670] block text-[10px]">Permission Category:</span>
                <span className="font-bold text-[#20242A]">{permissionDef?.category || 'Operation'}</span>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              This access restriction is strictly enforced across the dashboard, account pages, and backend APIs. Contact your bank administrator to adjust your role or request specific granular permissions.
            </span>
          </div>

          {/* Footer Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={closeAccessDenied}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <span>Acknowledge &amp; Return</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
