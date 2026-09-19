import React, { useState } from 'react';
import {
  User,
  Shield,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Save,
  Check
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [heartbeatFreq, setHeartbeatFreq] = useState('14');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Settings
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Manage your personal profile, standby heartbeat frequencies, contact verification protocols, and privacy parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto shrink-0"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Preferences Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* 2. Organized Sections (Personal Profile, Security, Standby, Contacts, Plans, Privacy) */}
      <div className="space-y-6">
        {/* Section 1: Personal Profile */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <User className="w-4 h-4 text-cyan-400" />
            <span>1. Personal Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-zinc-500 block text-[10px] uppercase">Designated Primary</span>
              <span className="text-white text-sm font-medium">Alex Morgan</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-zinc-500 block text-[10px] uppercase">Emergency Medical Marker</span>
              <span className="text-white text-sm font-medium">Blood Group O+ (Penicillin Allergy)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Security */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>2. Security & Handover</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Temporary Access Expiration</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Emergency share tokens auto-expire after 24 hours</p>
              </div>
              <span className="font-mono text-cyan-300">24 Hours (Strict)</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Two-Step Crisis Trigger Confirmation</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Require deliberate review before activating crisis state</p>
              </div>
              <span className="font-mono text-emerald-400">Enforced</span>
            </div>
          </div>
        </div>

        {/* Section 3: Standby Preferences */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>3. Standby Preferences</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Standby Check-In Frequency</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Gentle prompt to audit upcoming policy expiries</p>
              </div>
              <select
                value={heartbeatFreq}
                onChange={(e) => setHeartbeatFreq(e.target.value)}
                className="bg-[#0A0C11] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono"
              >
                <option value="7">Every 7 days</option>
                <option value="14">Every 14 days (Recommended)</option>
                <option value="30">Every 30 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Contact Verification */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>4. Contact Verification</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Rahul Morgan (Primary Proxy)</span>
              <span className="font-mono text-emerald-400 text-[11px]">Verified & Active</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
              <span className="text-zinc-300">Maya Vance (Local Alternate)</span>
              <span className="font-mono text-amber-400 text-[11px]">Token Pending</span>
            </div>
          </div>
        </div>

        {/* Section 5: Emergency Plans */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>5. Emergency Plans Sync</span>
          </div>

          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            5 pre-configured contingency blueprints (Automobile, Medical, Property, Travel, Identity) are stored in offline-first client storage. All documents and actions are synced.
          </p>
        </div>

        {/* Section 6: Privacy */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>6. Privacy & Telemetry</span>
          </div>

          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Cognitive Shadow does not dispatch live automated emergency services or expose records to public databases. Access is strictly controlled through user-initiated temporary tokens.
          </p>
        </div>
      </div>
    </div>
  );
};
