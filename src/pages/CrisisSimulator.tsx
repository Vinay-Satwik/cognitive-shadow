import React, { useState, useMemo } from 'react';
import { Sliders, ArrowRight, Sparkles, FileText, Users, FileSpreadsheet, CheckCircle2, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { contextEngine } from '../services/contextEngine';
import { crisisScenarios } from '../data/crisisScenarios';

export const CrisisSimulator: React.FC = () => {
  const { plans, documents, contacts, assets, userProfile } = useApp();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('plan-auto-accident');

  // The simulator must always expose the five system crisis scenarios.
  // Personal emergency plans are optional user data and may legitimately be empty.
  const scenarios = Object.values(crisisScenarios);
  const selectedScenario = crisisScenarios[selectedScenarioId] || scenarios[0];

  // Run the same central Context Engine using the selected system scenario plus
  // any authentic user-configured plan that matches it.
  const contextResult = useMemo(() => {
    return contextEngine.generateCrisisContext({
      scenario: selectedScenarioId,
      documents,
      assets,
      emergencyContacts: contacts,
      emergencyPlans: plans,
      profile: userProfile
    });
  }, [selectedScenarioId, documents, assets, contacts, plans, userProfile]);

  return (
    <div className="space-y-12 max-w-5xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Concept Sandbox</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Crisis Simulator
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Test and visualize how Cognitive Shadow eliminates cognitive overload. During a crisis, full access is noisy; contextual isolation is clarity.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4 self-start md:self-auto shrink-0">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Simulation Mode
            </div>
            <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
              <span>Safe Sandbox</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-[11px] text-zinc-400 font-light">
              Will not trigger active crisis state
            </div>
          </div>
        </div>
      </div>

      {/* 2. Select Drill Scenario */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
          Step 1: Select scenario to test
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {scenarios.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenarioId(scenario.id)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.08] border-cyan-400/60 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-2xl block mb-2">{plan.emoji}</span>
                <span className="text-xs font-medium block truncate">{plan.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. The Central Demonstration: BEFORE → AFTER CONTEXT */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            The Central Product Demonstration
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white">
            Contextual Information Reduction
          </h2>
          <p className="text-xs text-zinc-400 font-light">
            Watching the difference between raw storage and intelligent crisis filtration.
          </p>
        </div>

        {/* Side by Side Comparative Surfaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left: BEFORE */}
          <div className="p-8 rounded-2xl bg-white/[0.015] border border-white/[0.05] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs uppercase tracking-widest font-mono text-zinc-500 font-semibold">
                  BEFORE
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Total Repository
                </span>
              </div>
              <h3 className="text-lg font-medium text-zinc-300">
                Everything is stored.
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                In normal standby, you manage all your personal records, identity cards, insurance policies, and family contacts.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/[0.04] text-xs font-mono text-zinc-400">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <span>Stored Documents:</span>
                <span className="text-zinc-200 text-sm font-semibold">{documents.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <span>Emergency Contacts:</span>
                <span className="text-zinc-200 text-sm font-semibold">{contacts.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <span>Configured Blueprints:</span>
                <span className="text-zinc-200 text-sm font-semibold">{plans.length}</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 text-center pt-2">
              High cognitive friction during trauma
            </div>
          </div>

          {/* Right: AFTER CONTEXT */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-[#0A0C11] border border-cyan-500/40 space-y-6 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.08)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-800/40">
                <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-semibold">
                  AFTER CONTEXT IS APPLIED
                </span>
                <span className="text-[11px] font-mono text-cyan-300">
                  {selectedScenario.emoji} {selectedScenario.name}
                </span>
              </div>
              <h3 className="text-lg font-medium text-white">
                Only what matters surfaces.
              </h3>
              <p className="text-xs text-cyan-200/80 font-light leading-relaxed">
                Cognitive Shadow strips out all unrelated files. Only the specific documents, people, and actions for this situation appear.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-cyan-900/40 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200">
                <span>Surfaced Documents:</span>
                <span className="text-cyan-300 text-sm font-semibold">{contextResult.relevantDocuments.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200">
                <span>Designated People:</span>
                <span className="text-cyan-300 text-sm font-semibold">{contextResult.relevantContacts.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200">
                <span>Priority Actions:</span>
                <span className="text-cyan-300 text-sm font-semibold">{contextResult.priorityTasks.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200">
                <span>Emergency Brief:</span>
                <span className="text-cyan-300 text-xs font-medium">Ready ({contextResult.emergencyBrief.incident})</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-cyan-400 text-center pt-2 font-medium">
              Immediate clarity in seconds
            </div>
          </div>
        </div>

        {/* Core Product Philosophy Anchor */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center max-w-xl mx-auto space-y-1">
          <p className="text-lg sm:text-xl font-light text-white italic">
            "Your Shadow doesn't show everything. It shows what matters."
          </p>
          <p className="text-xs text-zinc-500 font-mono">
            Pure simulation mode. Standby state remains intact.
          </p>
        </div>
      </div>
    </div>
  );
};
