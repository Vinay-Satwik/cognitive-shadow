import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowRight,
  FileText,
  Users,
  CheckSquare,
  Shield,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EmergencyPlans: React.FC = () => {
  const navigate = useNavigate();
  const { plans, selectedPlan, selectPlan, startActivation, documents, contacts } = useApp();

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Contingency Blueprints</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Emergency Plans
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Pre-organized response blueprints that answer three critical questions before panic sets in: what information matters, who matters, and what needs to be done.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4 self-start md:self-auto shrink-0">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Coverage Mapping
            </div>
            <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
              <span>{plans.length} Scenarios Ready</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-light font-mono">
              Ready for immediate activation
            </div>
          </div>
        </div>
      </div>

      {/* 2. Redesigned Plans List with Distinctive Three-Part Structure */}
      <div className="space-y-6">
        {plans.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const planDocs = documents.filter((d) => plan.relevantDocuments.includes(d.id));
          const planPeople = contacts.filter((c) => plan.relevantContacts.includes(c.id));

          return (
            <div
              key={plan.id}
              className={`p-7 sm:p-9 rounded-3xl transition-all duration-300 border ${
                isSelected
                  ? 'bg-[#0E121B] border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.06)]'
                  : 'bg-[#0B0D12] border-white/[0.06] hover:border-white/[0.14]'
              }`}
            >
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    {plan.emoji}
                  </span>
                  <div>
                    <h2 className="text-xl font-medium text-white">
                      {plan.name}
                    </h2>
                    <p className="text-xs text-zinc-400 font-light mt-0.5">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      selectPlan(plan.id);
                      startActivation(plan.id);
                      navigate('/activation');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-2 transition-all cursor-pointer group"
                  >
                    <span>Activate Plan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Three-Part Structure: What Information Matters, Who Matters, What Needs to be Done */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* 1. What Information Matters? */}
                <div className="p-5 rounded-2xl bg-white/[0.015] border border-white/[0.04] space-y-3 hover:border-white/[0.08] transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>WHAT INFORMATION MATTERS</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-200 font-light">
                    {planDocs.map((doc) => (
                      <li key={doc.id} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 mt-1.5 shrink-0" />
                        <span className="leading-snug">{doc.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Who Matters? */}
                <div className="p-5 rounded-2xl bg-white/[0.015] border border-white/[0.04] space-y-3 hover:border-white/[0.08] transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>WHO MATTERS</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-200 font-light">
                    {planPeople.map((person) => (
                      <li key={person.id} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 mt-1.5 shrink-0" />
                        <span className="leading-snug">
                          {person.name} <span className="text-zinc-500 text-[11px] block">{person.relationship}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. What Needs to be Done? */}
                <div className="p-5 rounded-2xl bg-white/[0.015] border border-white/[0.04] space-y-3 hover:border-white/[0.08] transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>WHAT NEEDS TO BE DONE</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-200 font-light">
                    {plan.defaultTasks.map((task) => (
                      <li key={task.id} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 mt-1.5 shrink-0" />
                        <span className="leading-snug">{task.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
