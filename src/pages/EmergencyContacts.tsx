import React from 'react';
import {
  Users,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EmergencyContacts: React.FC = () => {
  const { contacts } = useApp();

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Users className="w-3.5 h-3.5" />
            <span>Delegated Inner Circle</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Emergency Contacts
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            The trusted circle reached when you cannot respond. Each person has pre-assigned tasks and access scopes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4 self-start md:self-auto shrink-0">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Primary Proxy
            </div>
            <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
              <span>Rahul Morgan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-zinc-400 font-light">
              Immediate 24/7 designated proxy
            </div>
          </div>
        </div>
      </div>

      {/* 2. Redesigned Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {contacts.map((contact) => {
          const isPrimary = contact.primary;
          return (
            <div
              key={contact.id}
              className={`p-6 sm:p-7 rounded-3xl transition-all duration-200 flex flex-col justify-between space-y-5 border ${
                isPrimary
                  ? 'bg-[#0E121B] border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.06)]'
                  : 'bg-[#0B0D12] border-white/[0.06] hover:border-white/[0.14]'
              }`}
            >
              <div className="space-y-4">
                {/* Top Row: Name, Verified State, Primary Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-medium text-white">
                        {contact.name}
                      </h2>
                      {contact.verified ? (
                        <span title="Verified contact token" className="text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span title="Verification pending" className="text-amber-400/80">
                          <AlertCircle className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-light mt-0.5">
                      {contact.relationship}
                    </p>
                  </div>

                  {isPrimary ? (
                    <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                      <span>Primary Proxy</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/[0.03] text-zinc-400 border border-white/[0.05]">
                      {contact.role}
                    </span>
                  )}
                </div>

                {/* Role & Availability details */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase">Role</span>
                    <span className="text-zinc-200 font-medium">{contact.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase">Availability</span>
                    <span className="text-zinc-300 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{contact.availability}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Communication Actions */}
              <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-xs font-mono">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-center gap-2 text-zinc-200 hover:text-white p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Call</span>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center justify-center gap-2 text-zinc-200 hover:text-white p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
