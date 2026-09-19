import React from 'react';
import { History, CheckCircle2, Key, Radio, FileText, UserCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CrisisTimeline: React.FC = () => {
  const { crisisSession } = useApp();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'activation':
        return <Radio className="w-3.5 h-3.5 text-rose-400" />;
      case 'document_surfaced':
        return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      case 'task_assigned':
        return <UserCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'task_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'access_created':
        return <Key className="w-3.5 h-3.5 text-cyan-400" />;
      case 'access_revoked':
        return <Key className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <History className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="space-y-2 border-b border-rose-950/60 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
          <History className="w-4 h-4" />
          <span>Incident Audit Record</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white">
          Timeline
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Chronological event history recorded for <strong className="text-zinc-200 font-medium">{crisisSession.scenario}</strong>.
          Every task update and access delegation is logged automatically.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6">
        <div className="relative border-l border-white/[0.08] ml-4 space-y-8 py-2">
          {crisisSession.timelineEvents.map((event) => (
            <div key={event.id} className="relative pl-7 space-y-1">
              {/* Event node icon */}
              <div className="absolute -left-[14px] top-0.5 w-7 h-7 rounded-full bg-[#0D0E14] border border-white/[0.1] flex items-center justify-center">
                {getEventIcon(event.type)}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-500 font-medium">
                  {event.timestamp}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">
                  {event.type.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-sm font-medium text-white">
                {event.title}
              </h2>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                {event.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
