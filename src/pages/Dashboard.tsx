import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  FileText,
  Users,
  FileSpreadsheet,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    readiness,
    documents,
    contacts,
    plans,
    userProfile,
    selectPlan,
    startActivation,
    dormantNotification,
    clearDormantNotification
  } = useApp();

  const fullName = userProfile?.name || user?.name || 'User';
  const firstName = fullName.trim().split(' ')[0] || 'User';

  return (
    <div className="space-y-12 max-w-5xl">
      {/* Dormant Notification Banner (if returning from Crisis Mode) */}
      {dormantNotification && (
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-300 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span>{dormantNotification} Standby surveillance and normal navigation restored.</span>
          </div>
          <button
            onClick={clearDormantNotification}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer px-2 py-0.5"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Command Surface: Personal Greeting & Readiness Posture */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] relative overflow-hidden">
        {/* Subtle background ambient highlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono tracking-wider uppercase text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                <span>NORMAL / STANDBY</span>
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Passive Monitoring
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
              Welcome, <span className="font-normal text-zinc-100">{firstName}</span>.
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 font-light max-w-xl leading-relaxed">
              Your Shadow is standing by. All documents, verified proxies, and contingency playbooks are synchronized.
            </p>
          </div>

          {/* Prominent Elegant 94% Shadow Readiness Indicator */}
          <div 
            onClick={() => navigate('/readiness')}
            className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer transition-all duration-300 flex items-center gap-5 shrink-0 group"
          >
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                Shadow Readiness
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-light text-white font-mono tracking-tight group-hover:text-cyan-300 transition-colors">
                  {readiness.overallScore}%
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">OPTIMAL</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                Prepared before the unexpected
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-all">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured Information Overview (4 Integrated Tiles) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Documents Tile */}
        <div
          onClick={() => navigate('/vault')}
          className="p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] hover:border-white/[0.14] cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Vault Records
            </span>
            <FileText className="w-4 h-4 text-cyan-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-3xl font-light text-white font-mono">
              {documents.length}
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-light">
              Documents ready & active
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-mono text-zinc-500">
            Medical, vehicle, property
          </div>
        </div>

        {/* Contacts Tile */}
        <div
          onClick={() => navigate('/contacts')}
          className="p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] hover:border-white/[0.14] cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Care Network
            </span>
            <Users className="w-4 h-4 text-cyan-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-3xl font-light text-white font-mono">
              {contacts.length}
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-light">
              Emergency contacts
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-mono text-zinc-500">
            Primary proxy verified
          </div>
        </div>

        {/* Plans Tile */}
        <div
          onClick={() => navigate('/plans')}
          className="p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] hover:border-white/[0.14] cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Response Plans
            </span>
            <FileSpreadsheet className="w-4 h-4 text-cyan-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-3xl font-light text-white font-mono">
              {plans.length}
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-light">
              Contingency blueprints
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-mono text-zinc-500">
            3-part response mapping
          </div>
        </div>

        {/* Shadow Readiness Tile */}
        <div
          onClick={() => navigate('/readiness')}
          className="p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] hover:border-white/[0.14] cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Posture
            </span>
            <Shield className="w-4 h-4 text-cyan-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-3xl font-light text-cyan-300 font-mono">
              {readiness.overallScore}%
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-light">
              Preparedness score
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-mono text-zinc-500">
            5 categories audited
          </div>
        </div>
      </div>

      {/* 3. Shadow Status: Readiness Visualization (Non-generic, elegant technical rail) */}
      <div className="p-7 rounded-3xl bg-[#0A0C10] border border-white/[0.06] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Shadow Status
            </div>
            <h2 className="text-base font-medium text-white mt-0.5">
              Prepared before the unexpected.
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400/90 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-800/30 self-start sm:self-auto">
            Standby Surveillance OK
          </span>
        </div>

        {/* Segmented Readiness Rail */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {readiness.categories.map((cat) => (
            <div
              key={cat.name}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">{cat.name}</span>
                <span className="font-mono text-cyan-400">{cat.score}%</span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Needs Attention: Actionable Pre-Crisis Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
              Proactive Safeguards
            </span>
            <h2 className="text-lg font-medium text-white">Needs Attention</h2>
          </div>
          <span className="text-xs font-mono text-amber-400/90 bg-amber-950/20 px-2.5 py-1 rounded-full border border-amber-800/30">
            3 items pending
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div 
            onClick={() => navigate('/vault')}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 hover:bg-white/[0.03] cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Vehicle Insurance</span>
            </div>
            <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
              Renewal approaching in October
            </div>
            <p className="text-xs text-zinc-500 font-light">
              National Insurance policy #488102 valid for 30 days. Review active schedule.
            </p>
          </div>

          <div 
            onClick={() => navigate('/contacts')}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 hover:bg-white/[0.03] cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Emergency Contact</span>
            </div>
            <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
              Maya Vance verification pending
            </div>
            <p className="text-xs text-zinc-500 font-light">
              Local alternate contact has not yet confirmed the emergency verification token.
            </p>
          </div>

          <div 
            onClick={() => navigate('/plans')}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 hover:bg-white/[0.03] cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Plan Blueprint</span>
            </div>
            <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
              Travel emergency review overdue
            </div>
            <p className="text-xs text-zinc-500 font-light">
              Overseas itinerary and passport details last audited 3 months ago.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Your Emergency Plans: Redesigned Scenario Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium block">
              Pre-Configured Contingencies
            </span>
            <h2 className="text-lg font-medium text-white">Your Emergency Plans</h2>
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="text-xs font-mono text-zinc-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all 5 plans</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {plans.slice(0, 4).map((plan) => (
            <div
              key={plan.id}
              onClick={() => {
                selectPlan(plan.id);
                startActivation(plan.id);
                navigate('/activation');
              }}
              className="p-5 rounded-2xl bg-[#0A0C11] border border-white/[0.06] hover:border-cyan-500/50 hover:bg-white/[0.02] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{plan.emoji}</span>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-cyan-400 transition-colors">
                    {plan.defaultTasks.length} tasks
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-2">
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>{plan.relevantDocuments.length} docs mapped</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Prominent Elegant Activate Shadow Trigger Area */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-cyan-950/20 via-[#0A0C11] to-[#0A0C11] border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span>Crisis Trigger</span>
          </div>
          <h2 className="text-2xl font-light text-white">
            Tell your Shadow what happened.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
            Selecting an incident immediately shifts Cognitive Shadow into focused Crisis Mode, surfacing only the specific records, contacts, and tasks you need right now.
          </p>
        </div>

        <button
          onClick={() => {
            startActivation();
            navigate('/activation');
          }}
          className="px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-xs font-mono flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] cursor-pointer shrink-0"
        >
          <span>ACTIVATE SHADOW</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
