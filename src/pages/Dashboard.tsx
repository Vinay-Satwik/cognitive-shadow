import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { readiness, documents, contacts, plans, selectPlan, startActivation, dormantNotification, clearDormantNotification } = useApp();

  return (
    <div className="space-y-12 max-w-3xl">
      {/* Dormant Notification Banner */}
      {dormantNotification && (
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between text-xs font-mono text-cyan-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span>{dormantNotification} Standby surveillance and normal navigation restored.</span>
          </div>
          <button
            onClick={clearDormantNotification}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Hero Greeting */}
      <div className="space-y-4 pt-2">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
          Good evening, Alex.
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 font-light">
          Your Shadow is standing by.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-xs font-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span>{readiness.overallScore}% READY</span>
          </span>
          <span className="text-sm text-zinc-500 font-light">
            {readiness.subtitle}
          </span>
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* 2. Important Information Summary (Spacious Numbers) */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
          Important information
        </span>
        <div className="grid grid-cols-3 gap-6 sm:gap-12 py-2">
          <div 
            onClick={() => navigate('/vault')}
            className="cursor-pointer group"
          >
            <div className="text-3xl sm:text-4xl font-light text-zinc-100 font-mono group-hover:text-cyan-400 transition-colors">
              {documents.length}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              documents
            </div>
          </div>

          <div 
            onClick={() => navigate('/contacts')}
            className="cursor-pointer group"
          >
            <div className="text-3xl sm:text-4xl font-light text-zinc-100 font-mono group-hover:text-cyan-400 transition-colors">
              {contacts.length}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              people
            </div>
          </div>

          <div 
            onClick={() => navigate('/plans')}
            className="cursor-pointer group"
          >
            <div className="text-3xl sm:text-4xl font-light text-zinc-100 font-mono group-hover:text-cyan-400 transition-colors">
              {plans.length}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              plans
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* 3. Needs Attention */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
          Needs attention
        </span>
        <div className="space-y-2.5">
          {readiness.improvements.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-zinc-300 hover:border-white/[0.1] transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-amber-400/80 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* 4. Your Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium">
            Your plans
          </span>
          <button
            onClick={() => navigate('/plans')}
            className="text-xs text-zinc-400 hover:text-cyan-400 font-mono transition-colors"
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plans.slice(0, 4).map((plan) => (
            <div
              key={plan.id}
              onClick={() => {
                selectPlan(plan.id);
                startActivation(plan.id);
                navigate('/activation');
              }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/40 hover:bg-white/[0.04] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{plan.emoji}</span>
                <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                  {plan.name}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* 5. Activate Shadow CTA */}
      <div className="p-8 rounded-2xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/[0.08] space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-white">
            Activate Shadow
          </h2>
          <p className="text-sm text-zinc-400">
            Tell your Shadow what happened. It immediately surfaces only the documents, people and actions that matter.
          </p>
        </div>

        <button
          onClick={() => {
            startActivation();
            navigate('/activation');
          }}
          className="px-6 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-medium text-sm border border-cyan-500/30 flex items-center gap-2.5 transition-all shadow-sm group"
        >
          <span>Activate Shadow</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
