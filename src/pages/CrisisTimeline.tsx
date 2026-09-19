import React from 'react';
import { useApp } from '../context/AppContext';

export const CrisisTimeline: React.FC = () => {
  const { crisisSession } = useApp();

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          Crisis Timeline
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Recent activity and coordination record for {crisisSession.scenario}.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6">
        <div className="relative border-l border-white/[0.08] ml-3 space-y-8 py-2">
          {crisisSession.timelineEvents.map((event) => (
            <div key={event.id} className="relative pl-6 space-y-1">
              {/* Event node marker */}
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-500 font-medium">
                  {event.timestamp}
                </span>
                <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">
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
