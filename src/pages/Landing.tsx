import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, FileText, Users, FileSpreadsheet, Check, Sparkles } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08090C] text-zinc-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Brand Bar */}
      <header className="max-w-6xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span className="font-medium text-sm tracking-wider uppercase text-zinc-200">
            Cognitive Shadow
          </span>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-200 border border-white/[0.08] transition-colors flex items-center gap-2 group cursor-pointer"
        >
          <span>Enter Shadow</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Main Hero Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-12 sm:py-20 space-y-16 text-center">
        {/* Title & Tagline */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Personal Crisis Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.1]">
            When you can't think, <br />
            <span className="text-zinc-400 font-normal">your Shadow does.</span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            Your documents, emergency contacts, responsibilities and crisis plans — organized before you need them.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-sm font-medium border border-cyan-500/30 transition-all flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] group cursor-pointer"
            >
              <span>Enter Shadow</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/simulator')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 text-sm font-light border border-white/[0.06] transition-colors"
            >
              View Simulator
            </button>
          </div>
        </div>

        {/* Core Principle Visual: Contextual Reduction */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.015] border border-white/[0.06] space-y-8 max-w-3xl mx-auto text-left">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
              The Cognitive Shadow Principle
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-white">
              Contextual information reduction.
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              In an emergency, too much information is paralyzing. Your Shadow filters the noise down to only what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-light text-zinc-500 line-through">12</span>
                <span className="text-xs font-mono text-cyan-400">→ 3 active</span>
              </div>
              <div className="text-sm font-medium text-white">Documents</div>
              <p className="text-xs text-zinc-400 font-light">
                Only the vehicle registration, insurance, and license relevant to the incident.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-light text-zinc-500 line-through">4</span>
                <span className="text-xs font-mono text-cyan-400">→ 2 people</span>
              </div>
              <div className="text-sm font-medium text-white">Contacts</div>
              <p className="text-xs text-zinc-400 font-light">
                Direct coordination lines with assigned responsibilities for this exact situation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-light text-zinc-500 line-through">5</span>
                <span className="text-xs font-mono text-cyan-400">→ 1 plan</span>
              </div>
              <div className="text-sm font-medium text-white">Action Playbook</div>
              <p className="text-xs text-zinc-400 font-light">
                Clear priority tasks ready to execute with zero guesswork or hesitation.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
        <div>COGNITIVE SHADOW • Personal Crisis Operating System</div>
        <div>"When you can't think, your Shadow does."</div>
      </footer>
    </div>
  );
};
