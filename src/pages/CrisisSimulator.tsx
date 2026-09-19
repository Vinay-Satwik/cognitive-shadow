import React, { useState } from 'react';
import { ArrowRight, Check, Sliders } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CrisisSimulator: React.FC = () => {
  const { plans, documents, contacts } = useApp();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0].id);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const relevantDocs = documents.filter((d) => selectedPlan.relevantDocuments.includes(d.id));
  const relevantPeople = contacts.filter((c) => selectedPlan.relevantContacts.includes(c.id));

  return (
    <div className="space-y-12 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          Crisis Simulator
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Simulate how Cognitive Shadow applies context to strip away noise during an incident.
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
          Select scenario
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-white/[0.08] border-cyan-500/50 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-xl block mb-2">{plan.emoji}</span>
                <span className="text-xs font-medium block">{plan.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BEFORE VS AFTER CONTEXT COMPARISON */}
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Before */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-4">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
              Before (Everything you store)
            </span>
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-zinc-400 font-mono">{documents.length}</span>
                <span className="text-xs text-zinc-400">stored documents</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-zinc-400 font-mono">{contacts.length}</span>
                <span className="text-xs text-zinc-400">contacts in directory</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-zinc-400 font-mono">{plans.length}</span>
                <span className="text-xs text-zinc-400">different plans</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 pt-2 border-t border-white/[0.04]">
              High cognitive load during an emergency.
            </p>
          </div>

          {/* After Context is Applied */}
          <div className="p-6 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-4 shadow-sm">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-medium block">
              After context is applied
            </span>
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-cyan-300 font-mono">{relevantDocs.length}</span>
                <span className="text-xs text-cyan-200">relevant documents</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-cyan-300 font-mono">{relevantPeople.length}</span>
                <span className="text-xs text-cyan-200">relevant people</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-cyan-300 font-mono">{selectedPlan.defaultTasks.length}</span>
                <span className="text-xs text-cyan-200">priority tasks</span>
              </div>
            </div>
            <p className="text-[11px] text-cyan-400/80 pt-2 border-t border-cyan-900/40">
              Only what matters for "{selectedPlan.name}".
            </p>
          </div>
        </div>

        {/* Core Product Insight Callout */}
        <div className="pt-4 border-t border-white/[0.06] text-center max-w-xl mx-auto space-y-1">
          <p className="text-base sm:text-lg font-light text-white italic">
            "Your Shadow doesn't show everything. It shows what matters."
          </p>
          <p className="text-xs text-zinc-500">
            Simulated preview only. Cognitive Shadow remains in calm standby.
          </p>
        </div>
      </div>
    </div>
  );
};
