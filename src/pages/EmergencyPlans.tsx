import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Users, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EmergencyPlans: React.FC = () => {
  const navigate = useNavigate();
  const { plans, selectedPlan, selectPlan, startActivation, documents, contacts } = useApp();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          Emergency Plans
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Pre-organized scenarios that answer what information matters, who matters, and what needs to be done.
        </p>
      </div>

      {/* Plans List */}
      <div className="space-y-6">
        {plans.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const planDocs = documents.filter((d) => plan.relevantDocuments.includes(d.id));
          const planPeople = contacts.filter((c) => plan.relevantContacts.includes(c.id));

          return (
            <div
              key={plan.id}
              className={`p-6 sm:p-8 rounded-2xl transition-all border ${
                isSelected
                  ? 'bg-white/[0.03] border-cyan-500/40 shadow-sm'
                  : 'bg-white/[0.015] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{plan.emoji}</span>
                  <div>
                    <h2 className="text-lg font-medium text-white">
                      {plan.name}
                    </h2>
                    <p className="text-xs text-zinc-400 font-light mt-0.5">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      selectPlan(plan.id);
                      startActivation(plan.id);
                      navigate('/activation');
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-1.5 transition-all"
                  >
                    <span>Activate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Three Questions: Information, People, Tasks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/[0.06]">
                {/* 1. What Information Matters? */}
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>What information matters?</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-300 font-light">
                    {planDocs.map((doc) => (
                      <li key={doc.id} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                        <span>{doc.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Who Matters? */}
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Who matters?</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-300 font-light">
                    {planPeople.map((person) => (
                      <li key={person.id} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                        <span>{person.name} ({person.relationship})</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. What Needs to be Done? */}
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-medium flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>What needs to be done?</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-300 font-light">
                    {plan.defaultTasks.map((task) => (
                      <li key={task.id} className="flex items-start gap-2">
                        <span className="text-zinc-500 font-mono text-[11px] mt-0.5">•</span>
                        <span>{task.title}</span>
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
