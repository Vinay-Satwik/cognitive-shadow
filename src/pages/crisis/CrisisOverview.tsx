import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Users,
  CheckSquare,
  Clock,
  ShieldAlert,
  Key,
  Box,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EndCrisisModal } from '../../components/crisis/EndCrisisModal';

export const CrisisOverview: React.FC = () => {
  const navigate = useNavigate();
  const { crisisSession, endCrisis, documents, contacts, assets, userProfile, temporaryAccessRecords } = useApp();
  const [showEndModal, setShowEndModal] = useState(false);

  const scenarioDocs = documents.filter((d) => crisisSession.surfacedDocuments?.includes(d.id));
  const scenarioPeople = contacts.filter((c) => crisisSession.involvedContacts?.includes(c.id));

  const primaryContact = contacts.find((c) => c.id === crisisSession.primaryContactId) || scenarioPeople[0] || null;
  const primaryAsset = assets.find((a) => a.id === crisisSession.primaryAssetId) || null;
  const isMedicalEmergency = crisisSession.scenarioId === 'plan-medical-emergency';

  const activeAccessCount = temporaryAccessRecords.filter((r) => r.status === 'Active').length;
  const hasInsurance = !!(crisisSession.insurancePolicyName && crisisSession.insurancePolicyName !== 'No policy on record');

  // =========================================================================
  // DYNAMIC CRISIS READINESS & CRITICAL GAPS CALCULATION
  // =========================================================================
  const { readinessState, criticalGaps, readinessChecklist } = useMemo(() => {
    const gaps: string[] = [];

    // 1. Contact evaluation
    const hasContact = !!primaryContact;
    if (!hasContact) {
      gaps.push('No emergency contact configured');
    }

    // 2. Scenario-specific gap detection
    const hasDocs = scenarioDocs.length > 0;
    const hasAsset = !!primaryAsset;

    if (crisisSession.scenarioId === 'plan-auto-accident') {
      if (!hasAsset) gaps.push('No vehicle asset linked');
      const hasAutoInsDoc = scenarioDocs.some(
        (d) => d.name.toLowerCase().includes('insurance') || d.category?.toLowerCase() === 'insurance'
      );
      if (!hasAutoInsDoc) gaps.push('No vehicle insurance document in vault');
    } else if (crisisSession.scenarioId === 'plan-medical-emergency') {
      const hasMedProxy = contacts.some((c) => c.medicalProxy);
      if (!hasMedProxy) gaps.push('No designated medical proxy in contact circle');
      if (!userProfile?.bloodGroup || userProfile.bloodGroup === 'Not specified') {
        gaps.push('Blood group not recorded in profile');
      }
      const hasMedDoc = scenarioDocs.some(
        (d) => d.category?.toLowerCase() === 'medical' || d.name.toLowerCase().includes('directive') || d.name.toLowerCase().includes('insurance')
      );
      if (!hasMedDoc) gaps.push('No medical directive or health insurance document in vault');
    } else if (crisisSession.scenarioId === 'plan-home-emergency') {
      if (!hasAsset) gaps.push('No property / real estate asset linked');
      const hasPropertyDoc = scenarioDocs.some(
        (d) => d.name.toLowerCase().includes('insurance') || d.category?.toLowerCase() === 'property' || d.category?.toLowerCase() === 'insurance'
      );
      if (!hasPropertyDoc) gaps.push('No homeowner insurance or property deed in vault');
    } else if (crisisSession.scenarioId === 'plan-travel-emergency') {
      const hasPassport = scenarioDocs.some(
        (d) => d.name.toLowerCase().includes('passport') || d.name.toLowerCase().includes('visa') || d.category?.toLowerCase() === 'identity'
      );
      if (!hasPassport) gaps.push('No passport or travel identification document in vault');
      if (!hasInsurance) gaps.push('No travel insurance policy on record');
    } else if (crisisSession.scenarioId === 'plan-identity-loss') {
      const hasIdDoc = scenarioDocs.some(
        (d) => d.category?.toLowerCase() === 'identity' || d.name.toLowerCase().includes('license') || d.name.toLowerCase().includes('passport') || d.name.toLowerCase().includes('card')
      );
      if (!hasIdDoc) gaps.push('No government identity credentials registered in vault');
    }

    // 3. Dynamic readiness determination
    const essentialScore = (hasContact ? 1 : 0) + (hasDocs ? 1 : 0) + (isMedicalEmergency || hasAsset ? 1 : 0) + (hasInsurance ? 1 : 0);

    let state: 'READY' | 'PARTIALLY READY' | 'INCOMPLETE' = 'READY';
    if (gaps.length >= 2 || essentialScore <= 1) {
      state = 'INCOMPLETE';
    } else if (gaps.length === 1 || essentialScore < 4) {
      state = 'PARTIALLY READY';
    } else {
      state = 'READY';
    }

    const checklist = [
      { label: 'Identity & Profile', ok: !!userProfile?.name },
      { label: 'Emergency Contact', ok: hasContact },
      { label: 'Surfaced Documents', ok: hasDocs },
      { label: isMedicalEmergency ? 'Health Protocols' : 'Linked Asset', ok: isMedicalEmergency ? true : hasAsset },
      { label: 'Insurance Policy', ok: hasInsurance }
    ];

    return { readinessState: state, criticalGaps: gaps, readinessChecklist: checklist };
  }, [crisisSession, scenarioDocs, contacts, primaryContact, primaryAsset, hasInsurance, isMedicalEmergency, userProfile]);

  const handleEndCrisisConfirm = () => {
    setShowEndModal(false);
    endCrisis();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* 1. Crisis Heading */}
      <div className="space-y-3 border-b border-rose-950/70 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
            <span>CRISIS MODE</span>
          </div>

          <button
            onClick={() => setShowEndModal(true)}
            className="text-xs font-mono px-3.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>End Crisis</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-white flex items-center gap-3">
          <span>{crisisSession.scenarioEmoji}</span>
          <span>{crisisSession.scenario}</span>
        </h1>

        <p className="text-base sm:text-lg text-rose-300/90 font-light italic">
          "Only what matters. Right now."
        </p>

        <div className="pt-2 text-xs font-mono text-zinc-400">
          Activated: <span className="text-zinc-200">{crisisSession.activatedAt}</span> • Session ID: {crisisSession.id}
        </div>
      </div>

      {/* 2. DYNAMIC CRISIS READINESS SUMMARY & CRITICAL GAPS */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05] pb-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-mono font-medium block">
              Crisis Readiness Intelligence
            </span>
            <div className="text-xs text-zinc-400 font-light">
              Real-time responder readiness based on verified vault and profile records.
            </div>
          </div>

          {/* Readiness Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 uppercase ${
              readinessState === 'READY'
                ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                : readinessState === 'PARTIALLY READY'
                ? 'bg-amber-950/50 border-amber-700/60 text-amber-300'
                : 'bg-rose-950/50 border-rose-700/60 text-rose-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                readinessState === 'READY' ? 'bg-emerald-400' : readinessState === 'PARTIALLY READY' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              <span>{readinessState}</span>
            </span>
          </div>
        </div>

        {/* Readiness Checklist Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs font-mono">
          {readinessChecklist.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                item.ok
                  ? 'bg-emerald-950/20 border-emerald-800/30 text-zinc-200'
                  : 'bg-rose-950/20 border-rose-800/30 text-rose-300'
              }`}
            >
              <span className="text-[11px] truncate">{item.label}</span>
              {item.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Critical Gaps Alert Box if Any */}
        {criticalGaps.length > 0 ? (
          <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-amber-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Critical Gaps Detected ({criticalGaps.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-amber-200/90 font-mono">
              {criticalGaps.map((gap, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-amber-500">•</span>
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center gap-2 text-xs font-mono text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All required crisis intelligence markers and documents are verified.</span>
          </div>
        )}
      </div>

      {/* 3. WHAT A RESPONDER NEEDS FIRST (PRIORITIZED HANDOVER) */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
              What a Responder Needs First
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 uppercase">
              • Prioritized Handover Sequence
            </span>
          </div>
          <button
            onClick={() => navigate('/crisis/brief')}
            className="text-xs text-zinc-400 hover:text-white font-mono flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Emergency Brief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* 1. FIRST: Critical Contacts */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-rose-400 font-semibold tracking-wider">1. FIRST</span>
              <Users className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-zinc-200 font-medium text-sm truncate">
              {primaryContact ? primaryContact.name : 'No contact on record'}
            </div>
            <div className="text-zinc-400 text-[11px] truncate">
              {primaryContact ? `${primaryContact.relationship} • ${primaryContact.phone || primaryContact.email || 'No phone'}` : 'Configure contact'}
            </div>
          </div>

          {/* 2. THEN: Critical Documents */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-amber-400 font-semibold tracking-wider">2. THEN</span>
              <FileText className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-zinc-200 font-medium text-sm truncate">
              {scenarioDocs[0]?.name || 'No document in vault'}
            </div>
            <div className="text-zinc-400 text-[11px] truncate">
              {scenarioDocs.length > 0 ? `${scenarioDocs.length} vault file${scenarioDocs.length > 1 ? 's' : ''} surfaced` : 'No relevant documents'}
            </div>
          </div>

          {/* 3. THEN: Asset & Insurance */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-cyan-400 font-semibold tracking-wider">3. THEN</span>
              <Box className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-zinc-200 font-medium text-sm truncate">
              {primaryAsset ? primaryAsset.name : isMedicalEmergency ? 'Medical Directives' : 'Asset Not Linked'}
            </div>
            <div className="text-zinc-400 text-[11px] truncate" title={crisisSession.insurancePolicyName}>
              {hasInsurance ? crisisSession.insurancePolicyName.split('(')[0] : 'No policy on record'}
            </div>
          </div>

          {/* 4. THEN: Outstanding Tasks */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-emerald-400 font-semibold tracking-wider">4. THEN</span>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-zinc-200 font-medium text-sm truncate">
              {crisisSession.tasks.find((t) => t.status !== 'Completed')?.title || 'All tasks resolved'}
            </div>
            <div className="text-zinc-400 text-[11px] truncate">
              {crisisSession.tasks.filter((t) => t.status === 'Completed').length}/{crisisSession.tasks.length} tasks executed
            </div>
          </div>
        </div>
      </div>

      {/* 4. Four Action Pillars: Documents, People, Tasks, Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Documents */}
        <div
          onClick={() => navigate('/crisis/documents')}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-mono font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Documents ({scenarioDocs.length})</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-zinc-300">
            {scenarioDocs.length > 0 ? (
              scenarioDocs.slice(0, 3).map((doc) => (
                <div key={doc.id} className="truncate font-light">
                  • {doc.name}
                </div>
              ))
            ) : (
              <div className="text-zinc-500 italic text-[11px]">No relevant documents configured.</div>
            )}
          </div>
        </div>

        {/* Relevant People */}
        <div
          onClick={() => navigate('/crisis/people')}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-mono font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <span>People ({scenarioPeople.length})</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-zinc-300">
            {scenarioPeople.length > 0 ? (
              scenarioPeople.slice(0, 3).map((person) => (
                <div key={person.id} className="truncate font-light">
                  • {person.name} ({person.relationship.split('&')[0]})
                </div>
              ))
            ) : (
              <div className="text-zinc-500 italic text-[11px]">No emergency contact configured.</div>
            )}
          </div>
        </div>

        {/* Priority Tasks */}
        <div
          onClick={() => navigate('/crisis/tasks')}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-mono font-medium flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Tasks ({crisisSession.tasks.length})</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-zinc-300">
            {crisisSession.tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="truncate font-light flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  task.status === 'Completed' ? 'bg-emerald-400' :
                  task.status === 'In Progress' ? 'bg-amber-400' : 'bg-zinc-600'
                }`} />
                <span className={task.status === 'Completed' ? 'line-through text-zinc-500' : ''}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assets & Insurance */}
        <div
          onClick={() => navigate('/assets')}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-mono font-medium flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-rose-400" />
              <span>Asset & Policy</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
          </div>

          <div className="space-y-1 pt-1 text-xs text-zinc-300">
            {primaryAsset ? (
              <>
                <div className="font-medium text-zinc-200 truncate">{primaryAsset.name}</div>
                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {primaryAsset.type} {primaryAsset.registrationOrSerial ? `• ${primaryAsset.registrationOrSerial}` : ''}
                </div>
              </>
            ) : isMedicalEmergency ? (
              <div className="text-zinc-500 italic text-[11px]">Health & proxy protocol (no physical asset)</div>
            ) : (
              <div className="text-zinc-500 italic text-[11px]">No relevant assets configured.</div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Secure Access / Coordinated Sharing Card */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
            <Key className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-white">Temporary Secure Access</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                {activeAccessCount} Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-light mt-0.5">
              Generate time-limited, encrypted access passes for responding proxies, attorneys, or claims adjusters.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/crisis/access')}
          className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-200 border border-white/[0.06] flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Manage Access</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Timeline Stream Preview */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>Recent Activity</span>
          </span>
          <button
            onClick={() => navigate('/crisis/timeline')}
            className="text-xs text-zinc-400 hover:text-rose-400 font-mono transition-colors"
          >
            View all ({crisisSession.timelineEvents.length}) →
          </button>
        </div>

        <div className="space-y-2.5">
          {crisisSession.timelineEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-xs">
              <span className="font-mono text-zinc-500 shrink-0 w-16">{event.timestamp}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
              <div>
                <span className="font-medium text-zinc-200">{event.title}</span>
                <p className="text-zinc-400 font-light mt-0.5">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* End Crisis Modal */}
      <EndCrisisModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndCrisisConfirm}
      />
    </div>
  );
};
