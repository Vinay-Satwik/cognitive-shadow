import React from 'react';
import { Users, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EmergencyContacts: React.FC = () => {
  const { contacts } = useApp();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          Emergency Contacts
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          The people who will be notified and given specific information when you need them.
        </p>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium text-white">
                    {contact.name}
                  </h2>
                  {contact.verified && (
                    <span title="Verified contact" className="text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {contact.relationship}
                </p>
              </div>

              {contact.primary && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
                  Primary
                </span>
              )}
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-zinc-300 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Role in emergency</span>
              <span>{contact.role}</span>
            </div>

            <div className="pt-2 border-t border-white/[0.04] space-y-2 text-xs font-mono">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 text-zinc-300 hover:text-white p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>{contact.phone}</span>
              </a>

              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-zinc-300 hover:text-white p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate">{contact.email}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
