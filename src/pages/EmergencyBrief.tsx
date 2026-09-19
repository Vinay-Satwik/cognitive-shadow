import React, { useState } from 'react';
import { Copy, Printer, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRelevantDocuments, getRelevantContacts, getRelevantAssets } from '../lib/crisisEngine';

export const EmergencyBrief: React.FC = () => {
  const navigate = useNavigate();
  const { crisisSession, contacts, assets } = useApp();
  const [copied, setCopied] = useState(false);

  const scenarioDocs = getRelevantDocuments(crisisSession.scenarioId);
  const scenarioPeople = getRelevantContacts(crisisSession.scenarioId);
  const scenarioAssets = getRelevantAssets(crisisSession.scenarioId);

  const primaryContact = contacts.find((c) => c.id === crisisSession.primaryContactId) || scenarioPeople[0] || contacts[0];
  const primaryAsset = assets.find((a) => a.id === crisisSession.primaryAssetId) || scenarioAssets[0];

  const handleCopy = () => {
    const text = [
      `WHAT YOU NEED TO KNOW RIGHT NOW`,
      `Incident: ${crisisSession.scenario}`,
      `Person: Alex Morgan`,
      `Primary Contact: ${primaryContact.name} (${primaryContact.phone})`,
      primaryAsset ? `Important Asset: ${primaryAsset.name} (${primaryAsset.registrationOrSerial})` : '',
      `Insurance: ${crisisSession.insurancePolicyName}`,
      ``,
      `Critical Documents:`,
      ...scenarioDocs.map((d) => `- ${d.name} (${d.category})`),
      ``,
      `Priority Tasks:`,
      ...crisisSession.tasks.map((t) => `- ${t.title} [${t.assignedTo}: ${t.status}]`)
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
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
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
          <div className="text-[11px] uppercase tracking-widest text-rose-400 font-mono font-semibold print:text-red-700">
            Cognitive Shadow • Emergency Dossier
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase font-mono text-white print:text-black">
            WHAT YOU NEED TO KNOW RIGHT NOW
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light print:text-gray-600">
            Actionable coordination handover for responders, medical staff, and family proxies.
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
              Activated at {crisisSession.activatedAt}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
              Person
            </span>
            <div className="text-lg font-medium text-white print:text-black">
              Alex Morgan
            </div>
            <div className="text-xs text-zinc-400 font-mono print:text-gray-500">
              Identity Verified
            </div>
          </div>
        </div>

        {/* 2. Primary Contact & Important Asset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/[0.06] print:border-black/10">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
              Primary Contact
            </span>
            <div className="text-base font-medium text-white print:text-black">
              {primaryContact.name} ({primaryContact.relationship})
            </div>
            <div className="text-xs text-zinc-400 font-mono print:text-gray-600">
              Phone: {primaryContact.phone} • Email: {primaryContact.email}
            </div>
          </div>

          {primaryAsset ? (
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
                Important Asset
              </span>
              <div className="text-base font-medium text-white print:text-black">
                {primaryAsset.name}
              </div>
              <div className="text-xs text-zinc-400 font-mono print:text-gray-600">
                {primaryAsset.type} • {primaryAsset.registrationOrSerial}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
                Family Physician
              </span>
              <div className="text-base font-medium text-white print:text-black">
                Dr. Mehta
              </div>
              <div className="text-xs text-zinc-400 font-mono print:text-gray-600">
                +1 (555) 901-2244 • On-Call
              </div>
            </div>
          )}
        </div>

        {/* 3. Insurance Policy */}
        <div className="space-y-2 pt-4 border-t border-white/[0.06] print:border-black/10">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
            Insurance
          </span>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm print:border-black/20 print:bg-gray-50">
            <div className="font-medium text-white print:text-black">
              {crisisSession.insurancePolicyName}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-light print:text-gray-600">
              Coverage verified active. Cashless and emergency claims hotline registered.
            </p>
          </div>
        </div>

        {/* 4. Critical Documents */}
        <div className="space-y-3 pt-4 border-t border-white/[0.06] print:border-black/10">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
            Critical Documents ({scenarioDocs.length})
          </span>
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
        </div>

        {/* 5. Priority Tasks */}
        <div className="space-y-3 pt-4 border-t border-white/[0.06] print:border-black/10">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono block print:text-gray-500">
            Priority Tasks ({crisisSession.tasks.length})
          </span>
          <div className="space-y-2">
            {crisisSession.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] print:border-black/20 print:bg-gray-50"
              >
                <span className="text-zinc-200 print:text-black font-medium">{task.title}</span>
                <span className="font-mono text-zinc-400 print:text-gray-600">
                  {task.assignedTo} ({task.status})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
