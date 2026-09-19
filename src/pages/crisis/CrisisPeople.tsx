import React from 'react';
import { Users, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRelevantContacts } from '../../lib/crisisEngine';

export const CrisisPeople: React.FC = () => {
  const { crisisSession, contacts } = useApp();

  const relevantPeople = contacts.filter((c) => crisisSession.involvedContacts?.includes(c.id)).length > 0
    ? contacts.filter((c) => crisisSession.involvedContacts?.includes(c.id))
    : getRelevantContacts(crisisSession.scenarioId);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2 border-b border-rose-950/60 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
          <Users className="w-4 h-4" />
          <span>Active Response Circle</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white">
          People
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Showing only the contacts relevant to <strong className="text-zinc-200 font-medium">{crisisSession.scenario}</strong>.
          Cognitive Shadow filters out unneeded contacts so you reach who matters immediately.
        </p>
      </div>

      {/* Relevant Contacts Grid */}
      {relevantPeople.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-zinc-400 text-xs font-mono">
          No emergency contacts have been configured for this emergency plan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantPeople.map((person) => (
          <div
            key={person.id}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium text-white">
                    {person.name}
                  </h2>
                  {person.verified && (
                    <span title="Verified contact" className="text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {person.relationship}
                </p>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-300">
                {person.role}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono text-zinc-300 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase block">Emergency Availability</span>
              <span>{person.availability}</span>
            </div>

            <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-xs font-mono">
              <a
                href={`tel:${person.phone}`}
                className="flex items-center justify-center gap-2 text-zinc-200 hover:text-white p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Call</span>
              </a>

              <a
                href={`mailto:${person.email}`}
                className="flex items-center justify-center gap-2 text-zinc-200 hover:text-white p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Email</span>
              </a>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
