import React, { useState, useMemo } from 'react';
import {
  Copy,
  Printer,
  Check,
  ArrowLeft,
  HeartPulse,
  ShieldAlert,
  FileText,
  User,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Users,
  Box,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const EmergencyBrief: React.FC = () => {
  const navigate = useNavigate();
  const { crisisSession, contacts, assets, documents, userProfile } = useApp();
  const [copied, setCopied] = useState(false);

  const scenarioDocs = documents.filter((d) => crisisSession.surfacedDocuments?.includes(d.id));
  const scenarioPeople = contacts.filter((c) => crisisSession.involvedContacts?.includes(c.id));

  const primaryContact = contacts.find((c) => c.id === crisisSession.primaryContactId) || scenarioPeople[0] || contacts[0] || null;
  const primaryAsset = assets.find((a) => a.id === crisisSession.primaryAssetId) || null;

  const isMedicalEmergency = crisisSession.scenarioId === 'plan-medical-emergency';

  // Immediate Actions: Top 2-3 pending actions prioritized for responder execution
  const immediateActions = useMemo(() => {
    return crisisSession.tasks
      .filter((t) => t.status !== 'Completed')
      .slice(0, 3);
  }, [crisisSession.tasks]);

  // Critical gaps / Important missing information
  const missingInfo = useMemo(() => {
    const missing: string[] = [];
    if (!primaryContact) missing.push('No emergency contact configured');
    if (scenarioDocs.length === 0) missing.push('No relevant scenario documents in vault');
    if (!isMedicalEmergency && !primaryAsset) missing.push('No relevant asset registered');
    if (!crisisSession.insurancePolicyName || crisisSession.insurancePolicyName === 'No policy on record') {
      missing.push('No insurance policy on file for this scenario');
    }
    if (isMedicalEmergency) {
      if (!userProfile?.bloodGroup || userProfile.bloodGroup === 'Not specified') {
        missing.push('Blood group unrecorded in profile');
      }
      if (!contacts.some((c) => c.medicalProxy)) {
        missing.push('No designated medical proxy in contact list');
      }
    }
    return missing;
  }, [primaryContact, scenarioDocs, isMedicalEmergency, primaryAsset, crisisSession.insurancePolicyName, userProfile, contacts]);

  const handleCopy = () => {
    const text = [
      `==================================================`,
      `COGNITIVE SHADOW • RESPONDER CRISIS HANDOVER`,
      `==================================================`,
      `Incident: ${crisisSession.scenario}`,
      `Activated: ${crisisSession.activatedAt} (Session: ${crisisSession.id})`,
      `Person: ${userProfile?.name || 'Authorized Account Holder'}`,
      isMedicalEmergency ? `Blood Group: ${userProfile?.bloodGroup || 'Not specified'}` : '',
      isMedicalEmergency ? `Allergies: ${userProfile?.allergies || 'None declared'}` : '',
      isMedicalEmergency ? `Medical Directives: ${userProfile?.medicalNotes || 'No directive on file'}` : '',
      ``,
      `--- CRITICAL CONTACTS ---`,
      `Primary: ${primaryContact ? `${primaryContact.name} (${primaryContact.relationship}) • Phone: ${primaryContact.phone || 'N/A'}` : 'Not configured'}`,
      ...scenarioPeople.filter((c) => c.id !== primaryContact?.id).map((c) => `Secondary: ${c.name} (${c.relationship}) • Phone: ${c.phone || 'N/A'}`),
      ``,
      `--- RELEVANT ASSET & INSURANCE ---`,
      `Asset: ${primaryAsset ? `${primaryAsset.name} (${primaryAsset.type} • ${primaryAsset.registrationOrSerial})` : isMedicalEmergency ? 'Medical protocol (No physical asset)' : 'Not configured'}`,
      `Insurance: ${crisisSession.insurancePolicyName}`,
      ``,
      `--- CRITICAL DOCUMENTS ---`,
      ...(scenarioDocs.length > 0 ? scenarioDocs.map((d) => `- ${d.name} [${d.category}${d.expiryDate ? `, Exp: ${d.expiryDate}` : ''}]`) : ['- No relevant documents configured']),
      ``,
      `--- IMMEDIATE ACTIONS FOR RESPONDERS ---`,
      ...(immediateActions.length > 0 ? immediateActions.map((t) => `[${t.priority}] ${t.title} -> ${t.assignedTo}`) : ['- All priority actions executed']),
      ``,
      missingInfo.length > 0 ? `--- IMPORTANT MISSING INFORMATION ---` : '',
      ...missingInfo.map((m) => `[!] ${m}`),
      `==================================================`
    ].filter(Boolean).join('\n');

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? 'Copied Handover' : 'Copy Handover'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-8 text-zinc-100 print:bg-white print:text-black print:p-4 print:border-none print:shadow-none">
        {/* Main Heading */}
        <div className="space-y-2 border-b border-white/[0.08] pb-6 print:border-black/20">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-widest text-rose-400 font-mono font-semibold print:text-red-700">
              Cognitive Shadow • Responder Handover Dossier
            </div>
            <span className="text-[10px] font-mono text-zinc-400 print:text-gray-500">
              Confidential Emergency Coordination
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase font-mono text-white print:text-black">
            WHAT YOU NEED TO KNOW RIGHT NOW
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light print:text-gray-600">
            Actionable coordination handover for emergency responders, attending hospital staff, insurance adjusters, and family proxies.
          </p>
        </div>

        {/* 1. Incident & Person */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
              Incident
            </span>
            <div className="text-lg font-medium text-white print:text-black flex items-center gap-2">
              <span>{crisisSession.scenarioEmoji}</span>
              <span>{crisisSession.scenario}</span>
            </div>
            <div className="text-xs text-zinc-400 font-mono print:text-gray-500">
              Activated at {crisisSession.activatedAt} • ID: {crisisSession.id}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
              Person
            </span>
            <div className="text-lg font-medium text-white print:text-black">
              {userProfile?.name || 'Authorized Account Holder'}
            </div>
            <div className="text-xs text-zinc-400 font-mono print:text-gray-500">
              Identity Verified in Shadow Vault
            </div>
          </div>
        </div>

        {/* 2. Medical Specific Alert Section if Medical Crisis */}
        {isMedicalEmergency && (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3 print:border-black/20 print:bg-gray-50">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-300 print:text-red-700">
              <HeartPulse className="w-4 h-4" />
              <span>Emergency Medical Markers (User-Configured Baseline)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Blood Group</span>
                <span className="text-white font-medium print:text-black">{userProfile?.bloodGroup || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Allergies & Contraindications</span>
                <span className="text-rose-300 font-medium print:text-red-700">{userProfile?.allergies || 'None declared'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[10px] uppercase">Emergency Directives</span>
                <span className="text-zinc-300 print:text-gray-700 font-sans">{userProfile?.medicalNotes || 'No emergency directive on file'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Primary Contact & Important Asset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/[0.06] print:border-black/10">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
              Primary Contact
            </span>
            <div className="text-base font-medium text-white print:text-black">
              {primaryContact ? `${primaryContact.name} (${primaryContact.relationship})` : 'No emergency contact configured.'}
            </div>
            {primaryContact && (
              <div className="text-xs text-zinc-400 font-mono print:text-gray-600">
                Phone: {primaryContact.phone || 'N/A'} • Email: {primaryContact.email || 'N/A'}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
              Important Asset
            </span>
            {primaryAsset ? (
              <>
                <div className="text-base font-medium text-white print:text-black">
                  {primaryAsset.name}
                </div>
                <div className="text-xs text-zinc-400 font-mono print:text-gray-600">
                  {primaryAsset.type} • {primaryAsset.registrationOrSerial}
                </div>
              </>
            ) : (
              <div className="text-xs text-zinc-400 italic font-mono pt-1">
                {isMedicalEmergency ? 'No physical assets required for medical protocols.' : 'No relevant assets configured.'}
              </div>
            )}
          </div>
        </div>

        {/* 4. Insurance Policy */}
        <div className="space-y-2 pt-4 border-t border-white/[0.06] print:border-black/10">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
            Insurance Policy
          </span>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm print:border-black/20 print:bg-gray-50">
            <div className="font-medium text-white print:text-black">
              {crisisSession.insurancePolicyName}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-light print:text-gray-600">
              {crisisSession.insurancePolicyName && crisisSession.insurancePolicyName !== 'No policy on record'
                ? 'Coverage verified active. Emergency claims registration on file.'
                : 'No insurance policy on record for this scenario.'}
            </p>
          </div>
        </div>

        {/* 5. IMMEDIATE ACTIONS FOR RESPONDERS */}
        <div className="space-y-3 pt-4 border-t border-white/[0.06] print:border-black/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-mono font-semibold print:text-blue-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 print:text-blue-800" />
              <span>Immediate Actions for Responders</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500 print:text-gray-500">Top Priority Actions</span>
          </div>

          {immediateActions.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs font-mono text-emerald-300 print:border-black/20 print:text-black">
              All immediate priority tasks have been completed.
            </div>
          ) : (
            <div className="space-y-2">
              {immediateActions.map((task, idx) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs print:border-black/20 print:bg-gray-50"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-rose-400 font-bold print:text-red-700">{idx + 1}.</span>
                    <div>
                      <span className="text-white font-medium print:text-black block">{task.title}</span>
                      <p className="text-zinc-400 text-[11px] font-light mt-0.5 print:text-gray-600">{task.description}</p>
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0 font-mono text-[11px] text-zinc-400 print:text-gray-600">
                    <span className="text-zinc-300 font-medium print:text-black">{task.assignedTo}</span>
                    <span className="block text-[10px] uppercase text-zinc-500">[{task.priority}]</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Critical Documents */}
        <div className="space-y-3 pt-4 border-t border-white/[0.06] print:border-black/10">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
            Critical Documents ({scenarioDocs.length})
          </span>
          {scenarioDocs.length === 0 ? (
            <p className="text-xs text-zinc-500 font-light italic">No relevant documents configured.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenarioDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs print:border-black/20 print:bg-gray-50 space-y-1"
                >
                  <div className="font-medium text-white print:text-black">{doc.name}</div>
                  <div className="text-[11px] text-zinc-500 font-mono print:text-gray-600">
                    {doc.category} {doc.expiryDate ? `• Exp: ${doc.expiryDate}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. IMPORTANT MISSING INFORMATION / CRITICAL GAPS */}
        {missingInfo.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-white/[0.06] print:border-black/10">
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-mono font-semibold print:text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 print:text-amber-800" />
              <span>Important Missing Information ({missingInfo.length})</span>
            </span>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs font-mono space-y-1.5 print:border-black/20 print:bg-yellow-50">
              {missingInfo.map((info, i) => (
                <div key={i} className="flex items-center gap-2 text-amber-200/90 print:text-amber-900">
                  <span className="text-amber-500">•</span>
                  <span>{info}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
