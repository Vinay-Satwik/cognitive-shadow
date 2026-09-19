import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Readiness: React.FC = () => {
  const { readiness } = useApp();

  return (
    <div className="space-y-12 max-w-3xl">
      {/* Large Readiness Score Hero */}
      <div className="space-y-4 pt-2">
        <div className="text-6xl sm:text-7xl font-light text-white font-mono tracking-tight">
          {readiness.overallScore}%
        </div>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-light tracking-wider uppercase text-zinc-300 font-mono">
            Shadow Readiness
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-light">
            "Prepared for the unexpected."
          </p>
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* Clean Breakdown Categories */}
      <div className="space-y-6">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
          Preparedness breakdown
        </span>

        <div className="space-y-4">
          {readiness.categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-200 font-medium">{cat.name}</span>
                <span className="font-mono text-xs text-zinc-400">{cat.score}%</span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 font-light">{cat.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* Things to Improve */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
          Things to improve
        </span>

        <div className="space-y-2.5">
          {readiness.improvements.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-zinc-300"
            >
              <AlertCircle className="w-4 h-4 text-amber-400/80 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
