import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, FileText, Phone, Radio, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CrisisCommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const { crisisSession, endCrisis, toggleTaskStatus, documents, contacts, assets } = useApp();

  const surfacedDocs = documents.filter((d) => crisisSession.surfacedDocuments.includes(d.id));
  const involvedContacts = contacts.filter((c) => crisisSession.involvedContacts.includes(c.id));
  const primaryContact = contacts.find((c) => c.primary) || contacts[0];
  const primaryAsset = assets.find((a) => a.name.includes('Honda') || a.type.includes('Auto')) || assets[0];

  return (
    <div className="space-y-12 max-w-4xl">
      {/* 1. High-Contrast Crisis Header */}
      <div className="space-y-3 border-b border-rose-950/60 pb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
          <span>CRISIS MODE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-white">
          {crisisSession.scenario}
        </h1>

        <p className="text-base sm:text-lg text-rose-300/90 font-light italic">
          "Only what matters. Right now."
        </p>
      </div>

      {/* 2. Emergency Brief Snapshot */}
      <div className="p-6 sm:p-7 rounded-2xl bg-rose-950/25 border border-rose-800/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-rose-400 font-mono font-semibold">
            Emergency Brief
          </span>
          <button
            onClick={() => navigate('/brief')}
            className="text-xs text-rose-300 hover:text-white font-mono flex items-center gap-1 transition-colors"
          >
            <span>View Printable Brief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-zinc-300">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Person</span>
            <span className="text-white font-medium text-sm">Alex Morgan</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Primary Contact</span>
            <span className="text-white font-medium text-sm">{primaryContact.name}</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Asset</span>
            <span className="text-white font-medium text-sm">{primaryAsset.name}</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Insurance</span>
            <span className="text-white font-medium text-sm">Vehicle Insurance</span>
          </div>
        </div>
      </div>

      {/* 3. Critical Documents */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-medium block">
          Critical documents
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {surfacedDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors space-y-1"
            >
              <FileText className="w-4 h-4 text-rose-400 mb-2" />
              <h2 className="text-sm font-medium text-white">{doc.name}</h2>
              <span className="text-[11px] text-zinc-400 font-mono block">
                {doc.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* 4. Priority Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-medium">
            Priority tasks
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            Click to cycle status
          </span>
        </div>

        <div className="space-y-2.5">
          {crisisSession.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTaskStatus(task.id)}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  task.status === 'Completed' ? 'bg-emerald-400' :
                  task.status === 'In Progress' ? 'bg-amber-400' : 'bg-zinc-600'
                }`} />
                <div>
                  <h3 className={`text-sm font-medium ${
                    task.status === 'Completed' ? 'line-through text-zinc-500' : 'text-zinc-200'
                  }`}>
                    {task.title}
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">
                    Assigned to: {task.assignedTo}
                  </span>
                </div>
              </div>

              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border uppercase ${
                task.status === 'Completed'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                  : task.status === 'In Progress'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                  : 'bg-white/[0.04] text-zinc-400 border-white/[0.08]'
              }`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* 5. People */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-medium block">
          People
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {involvedContacts.map((person) => (
            <div
              key={person.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
            >
              <div>
                <h3 className="text-sm font-medium text-white">{person.name}</h3>
                <span className="text-xs text-zinc-400">{person.relationship}</span>
              </div>
              <a
                href={`tel:${person.phone}`}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3 h-3 text-rose-400" />
                <span>Call</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* 6. Timeline */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-medium block">
          Timeline
        </span>

        <div className="space-y-3">
          {crisisSession.timelineEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-xs">
              <span className="font-mono text-zinc-500 shrink-0 w-16">{event.timestamp}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
              <div>
                <span className="font-medium text-zinc-200">{event.title}</span>
                <p className="text-zinc-400 font-light mt-0.5">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full" />

      {/* 7. End Crisis Button */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={() => {
            endCrisis();
            navigate('/dashboard');
          }}
          className="px-8 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-sm font-mono border border-white/10 transition-colors cursor-pointer"
        >
          [ END CRISIS ]
        </button>
      </div>
    </div>
  );
};
