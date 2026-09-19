import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Users, CheckSquare, Clock, ShieldAlert, Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EndCrisisModal } from '../../components/crisis/EndCrisisModal';
import { getRelevantDocuments, getRelevantContacts, getRelevantAssets } from '../../lib/crisisEngine';

export const CrisisOverview: React.FC = () => {
  const navigate = useNavigate();
  const { crisisSession, endCrisis, toggleTaskStatus, documents, contacts, assets, userProfile } = useApp();
  const [showEndModal, setShowEndModal] = useState(false);

  const scenarioDocs = documents.filter((d) => crisisSession.surfacedDocuments?.includes(d.id)).length > 0
    ? documents.filter((d) => crisisSession.surfacedDocuments?.includes(d.id))
    : getRelevantDocuments(crisisSession.scenarioId);

  const scenarioPeople = contacts.filter((c) => crisisSession.involvedContacts?.includes(c.id)).length > 0
    ? contacts.filter((c) => crisisSession.involvedContacts?.includes(c.id))
    : getRelevantContacts(crisisSession.scenarioId);

  const primaryContact = contacts.find((c) => c.id === crisisSession.primaryContactId) || scenarioPeople[0] || contacts[0];
  const primaryAsset = assets.find((a) => a.id === crisisSession.primaryAssetId) || assets[0];

  const handleEndCrisisConfirm = () => {
    setShowEndModal(false);
    endCrisis();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* 1. Crisis Heading */}
      <div className="space-y-3 border-b border-rose-950/70 pb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
          <span>CRISIS MODE</span>
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

      {/* 2. Emergency Brief Snapshot Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-rose-400 font-mono font-semibold">
              Emergency Brief
            </span>
          </div>
          <button
            onClick={() => navigate('/crisis/brief')}
            className="text-xs text-rose-300 hover:text-white font-mono flex items-center gap-1 transition-colors"
          >
            <span>Full Printable Brief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs font-mono">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Person</span>
            <span className="text-white font-medium text-sm">{userProfile?.name || 'Alex Morgan'}</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Primary Contact</span>
            <span className="text-white font-medium text-sm">{primaryContact ? primaryContact.name : 'None Assigned'}</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Asset</span>
            <span className="text-white font-medium text-sm">{primaryAsset ? primaryAsset.name : 'N/A'}</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Insurance</span>
            <span className="text-white font-medium text-sm truncate block" title={crisisSession.insurancePolicyName}>
              {crisisSession.insurancePolicyName.split('(')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Three Pillars: Documents, People, Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Critical Documents */}
        <div
          onClick={() => navigate('/crisis/documents')}
          className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-mono font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Documents ({scenarioDocs.length})</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-zinc-300">
            {scenarioDocs.map((doc) => (
              <div key={doc.id} className="truncate font-light">
                • {doc.name}
              </div>
            ))}
          </div>
        </div>

        {/* Relevant People */}
        <div
          onClick={() => navigate('/crisis/people')}
          className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-mono font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <span>People ({scenarioPeople.length})</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-zinc-300">
            {scenarioPeople.map((person) => (
              <div key={person.id} className="truncate font-light">
                • {person.name} ({person.relationship.split('&')[0]})
              </div>
            ))}
          </div>
        </div>

        {/* Priority Tasks */}
        <div
          onClick={() => navigate('/crisis/tasks')}
          className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-mono font-medium flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Tasks ({crisisSession.tasks.length})</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-zinc-300">
            {crisisSession.tasks.map((task) => (
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
      </div>

      {/* 4. Timeline Stream Preview */}
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

      {/* 5. End Crisis CTA */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={() => setShowEndModal(true)}
          className="px-8 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-sm font-mono border border-white/10 transition-colors cursor-pointer"
        >
          END CRISIS
        </button>
      </div>

      <EndCrisisModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndCrisisConfirm}
      />
    </div>
  );
};
