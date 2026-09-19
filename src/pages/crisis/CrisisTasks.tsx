import React, { useState } from 'react';
import { CheckSquare, UserCheck, Play, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CrisisTask } from '../../types';

export const CrisisTasks: React.FC = () => {
  const { crisisSession, setTaskStatus, claimTask, contacts, userProfile } = useApp();
  const [claimModalTask, setClaimModalTask] = useState<CrisisTask | null>(null);

  const peopleOptions = [
    ...(contacts.map((c) => c.name)),
    `${userProfile?.name || 'Alex Morgan'} (Myself)`
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2 border-b border-rose-950/60 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
          <CheckSquare className="w-4 h-4" />
          <span>Action Queue</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white">
          Priority Tasks
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Contextual task execution for <strong className="text-zinc-200 font-medium">{crisisSession.scenario}</strong>.
          Assignees and status changes update your Shadow in real time.
        </p>
      </div>

      {/* Interactive Task Cards */}
      <div className="space-y-4">
        {crisisSession.tasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-zinc-400 text-xs font-mono">
            No priority tasks defined for this crisis scenario.
          </div>
        ) : (
          crisisSession.tasks.map((task) => {
          return (
            <div
              key={task.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${
                      task.status === 'Completed' ? 'bg-emerald-400' :
                      task.status === 'In Progress' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'
                    }`} />
                    <h2 className={`text-base font-medium ${
                      task.status === 'Completed' ? 'line-through text-zinc-400' : 'text-white'
                    }`}>
                      {task.title}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 font-light pl-4.5">
                    {task.description}
                  </p>
                </div>

                <span className={`self-start text-[11px] font-mono px-2.5 py-1 rounded-full border uppercase ${
                  task.status === 'Completed'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                    : task.status === 'In Progress'
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                    : 'bg-white/[0.04] text-zinc-400 border-white/[0.08]'
                }`}>
                  {task.status}
                </span>
              </div>

              {/* Task Controls Row */}
              <div className="pt-3 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-400 font-mono">
                  <span>Assigned to:</span>
                  <span className="text-white font-medium">{task.assignedTo}</span>
                </div>

                {/* Status Switcher Buttons: Claim, In Progress, Complete */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setClaimModalTask(task)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 text-xs font-mono border border-white/[0.06] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Claim</span>
                  </button>

                  <button
                    onClick={() => setTaskStatus(task.id, 'In Progress')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      task.status === 'In Progress'
                        ? 'bg-amber-950/50 text-amber-300 border-amber-700/50'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 border-white/[0.06]'
                    }`}
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>In Progress</span>
                  </button>

                  <button
                    onClick={() => setTaskStatus(task.id, 'Completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      task.status === 'Completed'
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-700/50'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 border-white/[0.06]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Complete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Claim Reassignment Modal */}
      {claimModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0D0E14] border border-white/[0.1] rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-white">Claim / Reassign Task</h3>
            <p className="text-xs text-zinc-400">{claimModalTask.title}</p>
            <div className="space-y-2 pt-2">
              {peopleOptions.map((person) => (
                <button
                  key={person}
                  onClick={() => {
                    claimTask(claimModalTask.id, person);
                    setClaimModalTask(null);
                  }}
                  className="w-full p-2.5 rounded-xl text-left text-xs text-zinc-200 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{person}</span>
                  <span className="text-[10px] font-mono text-cyan-400">Select</span>
                </button>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setClaimModalTask(null)}
                className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
