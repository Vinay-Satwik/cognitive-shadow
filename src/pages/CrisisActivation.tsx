import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, X, FileText, Users, CheckSquare, FileCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { contextEngine } from '../services/contextEngine';

export const CrisisActivation: React.FC = () => {
  const navigate = useNavigate();
  const {
    plans,
    selectedPlan,
    selectPlan,
    confirmCrisisActivation,
    cancelActivation,
    documents,
    contacts,
    assets,
    userProfile
  } = useApp();

  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamically compute contextual results using the central contextEngine
  const preview = useMemo(() => {
    return contextEngine.generateCrisisContext({
      scenario: selectedPlan.id,
      documents,
      assets,
      emergencyContacts: contacts,
      emergencyPlans: plans,
      profile: userProfile
    });
  }, [selectedPlan, documents, assets, contacts, userProfile, plans]);

  const handleActivate = async () => {
    if (isActivating) return;
    setIsActivating(true);
    setError(null);
    try {
      await confirmCrisisActivation(selectedPlan.id);
      navigate('/crisis');
    } catch (err: any) {
      console.error('[Crisis Activation Error]', err);
      const detail = err?.message ? ` (${err.message})` : '';
      setError(`Unable to activate crisis mode. Please try again.${detail}`);
      setIsActivating(false);
    }
  };

  const handleCancel = () => {
    cancelActivation();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto py-4">
      {/* 1. The Core Question */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
          Activate Shadow
        </span>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
          What happened?
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Select the emergency scenario. Your Shadow will immediately isolate only the information and people you need.
        </p>
      </div>

      {/* 2. Large Scenario Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {plans.map((plan) => {
          const isSelected = plan.id === selectedPlan.id;
          return (
            <div
              key={plan.id}
              onClick={() => selectPlan(plan.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border text-left ${
                isSelected
                  ? 'bg-white/[0.08] border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-white'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl">{plan.emoji}</span>
                <div>
                  <h2 className="text-base font-medium text-zinc-100">
                    {plan.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                    {plan.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Dynamic Context Engine Preview */}
      <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-medium block">
          Your Shadow will prepare:
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-2xl font-light text-cyan-300 block mb-1">
              {preview.relevantDocuments.length}
            </span>
            <span className="text-zinc-400">relevant documents</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-2xl font-light text-cyan-300 block mb-1">
              {preview.relevantContacts.length}
            </span>
            <span className="text-zinc-400">emergency contacts</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-2xl font-light text-cyan-300 block mb-1">
              {preview.priorityTasks.length}
            </span>
            <span className="text-zinc-400">priority tasks</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-2xl font-light text-cyan-300 block mb-1">Ready</span>
            <span className="text-zinc-400">Emergency Brief</span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 pt-1">
          Scenario selected: <strong className="text-zinc-300">{selectedPlan.name}</strong> •{' '}
          {preview.relevantDocuments.length} files will surface from your vault of {documents.length} records.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs font-mono text-rose-300">
          {error}
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={handleCancel}
          disabled={isActivating}
          className="text-xs font-mono text-zinc-400 hover:text-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
        >
          Cancel and return to standby
        </button>

        <button
          onClick={handleActivate}
          disabled={isActivating}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-sm font-mono flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(244,63,94,0.35)] transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Flame className="w-4 h-4" />
          <span>{isActivating ? 'ENGAGING PROTOCOL...' : 'ACTIVATE CRISIS MODE'}</span>
        </button>
      </div>
    </div>
  );
};
