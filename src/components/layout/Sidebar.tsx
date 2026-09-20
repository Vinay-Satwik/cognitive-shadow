import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileText,
  Box,
  Users,
  FileSpreadsheet,
  Gauge,
  Sliders,
  Settings as SettingsIcon,
  Flame,
  Radio,
  FileCheck,
  CheckSquare,
  Key,
  History,
  ArrowRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const { crisisActive, crisisSession, startActivation } = useApp();

  const normalOverviewNav = [
    { name: 'Dashboard', to: '/dashboard', icon: FileText },
    { name: 'My Documents', to: '/vault', icon: FileText },
    { name: 'My Assets', to: '/assets', icon: Box },
    { name: 'Emergency Contacts', to: '/contacts', icon: Users },
    { name: 'Emergency Plans', to: '/plans', icon: FileSpreadsheet },
    { name: 'Readiness', to: '/readiness', icon: Gauge },
  ];

  const normalCrisisNav = [
    { name: 'Activate Shadow', to: '/activation', icon: Flame, isAccent: true },
    { name: 'Crisis Simulator', to: '/simulator', icon: Sliders },
  ];

  // Exact required Crisis navigation list
  const crisisNav = [
    { name: 'Crisis Overview', to: '/crisis', icon: Radio },
    { name: 'Emergency Brief', to: '/crisis/brief', icon: FileCheck },
    { name: 'Priority Tasks', to: '/crisis/tasks', icon: CheckSquare },
    { name: 'People', to: '/crisis/people', icon: Users },
    { name: 'Documents', to: '/crisis/documents', icon: FileText },
    { name: 'Secure Access', to: '/crisis/access', icon: Key },
    { name: 'Timeline', to: '/crisis/timeline', icon: History },
  ];

  return (
    <>
      <aside className={cn(
        "w-64 h-full flex flex-col transition-colors duration-300 select-none border-r",
        crisisActive
          ? "bg-[#090406] border-rose-950/70 text-zinc-100"
          : "bg-[#090A0E] border-white/[0.06] text-zinc-100"
      )}>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "w-2 h-2 rounded-full transition-all",
              crisisActive
                ? "bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"
                : "bg-cyan-400 shadow-[0_0_6px_#06b6d4]"
            )} />
            <span className="font-medium text-sm tracking-wider uppercase text-zinc-200">
              Cognitive Shadow
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 mt-1.5 pl-4.5 font-light">
            {crisisActive ? 'Crisis Mode Active' : 'Your Shadow is standing by'}
          </p>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-7">
          {crisisActive ? (
            /* ====================================================
               CRISIS NAVIGATION ONLY (Normal navigation disappears)
               ==================================================== */
            <div>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-rose-400 font-semibold font-mono">
                  CRISIS MODE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              </div>

              <div className="px-3 mb-3 text-xs text-zinc-400 font-light truncate">
                {crisisSession.scenarioEmoji} {crisisSession.scenario}
              </div>

              <div className="space-y-1">
                {crisisNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/crisis'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                          isActive
                            ? 'bg-rose-950/60 text-rose-200 border border-rose-800/40 shadow-sm font-medium'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                        )
                      }
                    >
                      <Icon className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ====================================================
               NORMAL NAVIGATION (Overview, Crisis, Settings)
               ==================================================== */
            <>
              {/* OVERVIEW */}
              <div>
                <span className="px-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold font-mono block mb-2">
                  Overview
                </span>
                <div className="space-y-1">
                  {normalOverviewNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                            isActive
                              ? 'bg-white/[0.08] text-white font-medium shadow-sm'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                          )
                        }
                      >
                        <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              {/* CRISIS */}
              <div>
                <span className="px-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold font-mono block mb-2">
                  Crisis
                </span>
                <div className="space-y-1">
                  {normalCrisisNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                            isActive
                              ? 'bg-white/[0.08] text-white font-medium shadow-sm'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]',
                            item.isAccent && 'text-cyan-400 hover:text-cyan-300'
                          )
                        }
                      >
                        <Icon className={cn("w-4 h-4 shrink-0", item.isAccent ? "text-cyan-400" : "text-zinc-400")} />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              {/* SETTINGS */}
              <div>
                <span className="px-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold font-mono block mb-2">
                  Settings
                </span>
                <NavLink
                  to="/settings"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                      isActive
                        ? 'bg-white/[0.08] text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                    )
                  }
                >
                  <SettingsIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Settings</span>
                </NavLink>
              </div>
            </>
          )}
        </div>

        {/* Footer Action */}
        {!crisisActive && (
          <div className="p-4 border-t border-white/[0.06]">
            <button
              onClick={() => {
                startActivation();
                navigate('/activation');
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-mono transition-colors flex items-center justify-between border border-white/[0.08]"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Activate Shadow</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
