import React from 'react';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const Readiness: React.FC = () => {
  const navigate = useNavigate();
  const { readiness } = useApp();

  const scoreBreakdown = [
    {
      category: 'Documents',
      score: 96,
      contribution: '+20% of total score',
      reason: '12 essential records stored and verified; Medical directive, RC, and Passport active.'
    },
    {
      category: 'Contacts',
      score: 92,
      contribution: '+19% of total score',
      reason: 'Primary proxy Rahul Morgan confirmed with 24/7 availability; Dr. Mehta on-call.'
    },
    {
      category: 'Emergency Plans',
      score: 95,
      contribution: '+20% of total score',
      reason: '5 comprehensive response blueprints mapped with task sequences and sharing rules.'
    },
    {
      category: 'Insurance',
      score: 90,
      contribution: '+18% of total score',
      reason: 'Automobile, health, and home policies active. Renewal approaching for vehicle.'
    },
    {
      category: 'Profile',
      score: 98,
      contribution: '+17% of total score',
      reason: 'Core personal identity, emergency blood group (O+), and asset records up to date.'
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl">
      {/* 1. Large Distinctive Shadow Readiness Header */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-xs font-mono text-cyan-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preparedness Posture</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white">
                Shadow Readiness
              </h1>
              <p className="text-base text-zinc-400 font-light">
                "Prepared before the unexpected."
              </p>
            </div>
          </div>

          {/* Huge 94% Metric Hero */}
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-7xl sm:text-8xl font-light text-white font-mono tracking-tight">
              {readiness.overallScore}%
            </span>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest pb-3 font-medium">
              Optimal
            </span>
          </div>
        </div>
      </div>

      {/* 2. Why is the score 94%? Clean Breakdown */}
      <div className="space-y-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
            Score Composition
          </span>
          <h2 className="text-lg font-medium text-white">Why your score is 94%</h2>
        </div>

        <div className="space-y-3.5">
          {scoreBreakdown.map((item) => (
            <div
              key={item.category}
              className="p-5 sm:p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-medium text-white">{item.category}</h3>
                  <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                    • {item.contribution}
                  </span>
                </div>
                <span className="font-mono text-sm text-cyan-300 font-medium">
                  {item.score}%
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>

              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Things to Improve: Actionable Safeguards */}
      <div className="space-y-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
            Gap Mitigation
          </span>
          <h2 className="text-lg font-medium text-white">Things to Improve</h2>
        </div>

        <div className="space-y-3">
          {readiness.improvements.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400/90 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-zinc-300 font-light">{item}</span>
              </div>

              <button
                onClick={() => {
                  if (idx === 0) navigate('/vault');
                  else if (idx === 1) navigate('/contacts');
                  else navigate('/plans');
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-cyan-300 border border-white/[0.06] flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
              >
                <span>Resolve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
