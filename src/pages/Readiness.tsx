import React, { useEffect, useState } from 'react';
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

const RESOLUTION_INTENTS_KEY = 'cognitive-shadow:readiness-resolution-intents';

const readResolutionIntents = (): string[] => {
  try {
    const stored = sessionStorage.getItem(RESOLUTION_INTENTS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const writeResolutionIntents = (items: string[]) => {
  try {
    if (items.length === 0) {
      sessionStorage.removeItem(RESOLUTION_INTENTS_KEY);
    } else {
      sessionStorage.setItem(RESOLUTION_INTENTS_KEY, JSON.stringify(items));
    }
  } catch {
    // Session storage is only a UI acknowledgement mechanism; readiness remains data-driven.
  }
};

export const Readiness: React.FC = () => {
  const navigate = useNavigate();
  const { readiness } = useApp();
  const [recentlyResolved, setRecentlyResolved] = useState<string[]>([]);

  useEffect(() => {
    const intents = readResolutionIntents();
    if (intents.length === 0) return;

    const resolved = intents.filter((item) => !readiness.improvements.includes(item));
    const stillPending = intents.filter((item) => readiness.improvements.includes(item));

    if (resolved.length > 0) {
      setRecentlyResolved(resolved);
      writeResolutionIntents(stillPending);

      const timeoutId = window.setTimeout(() => {
        setRecentlyResolved([]);
      }, 3500);

      return () => window.clearTimeout(timeoutId);
    }
  }, [readiness.improvements]);

  const statusLabel =
    readiness.overallScore >= 85
      ? 'Optimal'
      : readiness.overallScore >= 70
      ? 'Adequate'
      : 'Action Required';

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

          {/* Huge Metric Hero */}
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-7xl sm:text-8xl font-light text-white font-mono tracking-tight">
              {readiness.overallScore}%
            </span>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest pb-3 font-medium">
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Why is the score X%? Clean Dynamic Breakdown */}
      <div className="space-y-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
            Score Composition
          </span>
          <h2 className="text-lg font-medium text-white">
            Why your score is {readiness.overallScore}%
          </h2>
        </div>

        <div className="space-y-3.5">
          {readiness.categories.map((item) => (
            <div
              key={item.name}
              className="p-5 sm:p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-medium text-white">{item.name}</h3>
                  {item.contribution && (
                    <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                      • {item.contribution}
                    </span>
                  )}
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

      {/* 3. Confirmed Resolutions: shown only after the live readiness state clears the gap */}
      {recentlyResolved.length > 0 && (
        <div className="space-y-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-500/80 font-mono font-medium block">
              Confirmed Changes
            </span>
            <h2 className="text-lg font-medium text-white">Recently Resolved</h2>
          </div>

          <div className="space-y-3">
            {recentlyResolved.map((item) => (
              <div
                key={item}
                className="p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/25 flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm text-emerald-200 font-medium">{item}</div>
                  <div className="text-[11px] text-emerald-400/70 font-mono mt-1">
                    Verified by current readiness data
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Things to Improve: Actionable Safeguards */}
      {readiness.improvements.length > 0 && (
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
                    const lower = item.toLowerCase();
                    // Record only the user's navigation intent. The green state is shown later
                    // only if live readiness data confirms that this gap has actually cleared.
                    const intents = readResolutionIntents();
                    writeResolutionIntents([...new Set([...intents, item])]);

                    // Route each readiness gap to the actual screen where the user can resolve it.
                    if (lower.includes('blood group') || lower.includes('allerg') || lower.includes('medical directives') || lower.includes('emergency directive')) {
                      navigate('/settings');
                    } else if (lower.includes('insurance policy') || lower.includes('insurance policies') || lower.includes('insurance')) {
                      navigate('/vault');
                    } else if (lower.includes('property') || lower.includes('vehicle registration') || lower.includes('physical assets') || lower.includes('registered physical assets')) {
                      navigate('/assets');
                    } else if (lower.includes('document') || lower.includes('vault')) {
                      navigate('/vault');
                    } else if (lower.includes('contact') || lower.includes('proxy')) {
                      navigate('/contacts');
                    } else if (lower.includes('plan') || lower.includes('blueprint')) {
                      navigate('/plans');
                    } else {
                      navigate('/settings');
                    }
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
      )}
    </div>
  );
};
