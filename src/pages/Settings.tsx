import React from 'react';
import { Info } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-10 max-w-3xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          Settings
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Your personal crisis operating system preferences and standby policies.
        </p>
      </div>

      {/* Concept Notice */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4 text-xs text-zinc-300">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-medium text-white text-sm">Personal Preparation Prototype</span>
          <p className="text-zinc-400 leading-relaxed">
            Cognitive Shadow organizes your personal documents, emergency contacts, and plans in advance. In a real scenario, it acts as your personal playbook. This prototype uses local sample data.
          </p>
        </div>
      </div>

      {/* Simple Preferences */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
          Check-in preferences
        </span>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 text-sm">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
            <div>
              <span className="font-medium text-white">Standby Check-In Reminder</span>
              <p className="text-xs text-zinc-400 font-light mt-0.5">Gentle reminder to review expired documents</p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/40">
              Monthly
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-white">Contact Verification Status</span>
              <p className="text-xs text-zinc-400 font-light mt-0.5">Prompt family to confirm emergency numbers</p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
