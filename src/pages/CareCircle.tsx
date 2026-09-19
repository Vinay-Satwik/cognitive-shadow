import React from 'react';
import { Phone, CheckCircle2, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CareCircle: React.FC = () => {
  const { crisisSession, toggleTaskStatus } = useApp();

  const assignments = [
    {
      person: 'Rahul',
      role: 'Contact insurance',
      phone: '+1 (555) 349-8812',
      taskId: crisisSession.tasks[0]?.id,
      completed: crisisSession.tasks[0]?.status === 'Completed'
    },
    {
      person: 'Priya',
      role: 'Bring documents',
      phone: '+1 (555) 882-9014',
      taskId: crisisSession.tasks[1]?.id,
      completed: crisisSession.tasks[1]?.status === 'Completed'
    },
    {
      person: 'Dr. Mehta',
      role: 'Medical contact',
      phone: '+1 (555) 901-2244',
      taskId: undefined,
      completed: true
    }
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          Care Circle
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          "People helping you right now."
        </p>
      </div>

      {/* People and Responsibilities List */}
      <div className="space-y-4">
        {assignments.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-white">{item.person}</h2>
              <p className="text-xs text-zinc-400 font-mono">
                Responsibility: <strong className="text-zinc-200 font-medium">{item.role}</strong>
              </p>
              <div className="text-xs text-zinc-500 font-mono pt-1">
                {item.phone}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {item.taskId && (
                <button
                  onClick={() => toggleTaskStatus(item.taskId!)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all ${
                    item.completed
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                      : 'bg-white/[0.03] text-zinc-300 border-white/[0.08] hover:bg-white/[0.06]'
                  }`}
                >
                  {item.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-zinc-500" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              )}

              <a
                href={`tel:${item.phone}`}
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Call</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
