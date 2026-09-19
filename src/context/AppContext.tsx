import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppMode,
  DocumentItem,
  AssetItem,
  EmergencyContact,
  EmergencyPlan,
  CrisisSession,
  ReadinessOverview,
  CrisisTask,
  SecureAccessRecord,
  TimelineEvent
} from '../types';
import {
  demoDocuments,
  demoAssets,
  demoEmergencyContacts,
  demoEmergencyPlans,
  demoReadiness
} from '../data/demoData';
import { createCrisisSession } from '../lib/crisisEngine';

interface AppContextType {
  crisisActive: boolean;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  dormantNotification: string | null;
  clearDormantNotification: () => void;
  
  selectedPlan: EmergencyPlan;
  selectPlan: (planId: string) => void;
  
  documents: DocumentItem[];
  assets: AssetItem[];
  contacts: EmergencyContact[];
  plans: EmergencyPlan[];
  readiness: ReadinessOverview;
  
  // Crisis State
  crisisSession: CrisisSession;
  temporaryAccessRecords: SecureAccessRecord[];
  
  // State Machine Transitions
  startActivation: (planId?: string) => void;
  confirmCrisisActivation: (scenarioId?: string) => void;
  cancelActivation: () => void;
  endCrisis: () => void;
  
  // Interactive Crisis Actions
  setTaskStatus: (taskId: string, status: CrisisTask['status']) => void;
  toggleTaskStatus: (taskId: string) => void;
  claimTask: (taskId: string, personName: string) => void;
  createAccessRecord: (recipient: string, documents: string[], expiration?: string) => void;
  revokeAccessRecord: (recordId: string) => void;
  addTimelineEvent: (title: string, description: string, type: TimelineEvent['type']) => void;
}

interface SavedAppState {
  mode: AppMode;
  selectedPlanId: string;
  crisisSession: CrisisSession;
  temporaryAccessRecords: SecureAccessRecord[];
}

const STORAGE_KEY = 'cs_app_state';

const loadSavedState = (): SavedAppState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse cs_app_state:', err);
    return null;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saved = loadSavedState();

  const [mode, setMode] = useState<AppMode>(saved?.mode || 'dormant');
  const [dormantNotification, setDormantNotification] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(saved?.selectedPlanId || 'plan-auto-accident');
  
  // Initial crisis session loaded from storage or generated via Context Engine
  const [crisisSession, setCrisisSession] = useState<CrisisSession>(() => 
    saved?.crisisSession || createCrisisSession('plan-auto-accident')
  );

  const [temporaryAccessRecords, setTemporaryAccessRecords] = useState<SecureAccessRecord[]>(() =>
    saved?.temporaryAccessRecords || [
      {
        id: 'acc-101',
        recipient: 'Rahul Morgan',
        documents: ['Vehicle Insurance Policy', 'Vehicle Registration (RC)'],
        expiration: '24 hours',
        status: 'Active',
        createdAt: 'Today, 10:05 AM'
      },
      {
        id: 'acc-102',
        recipient: 'National Insurance Adjuster',
        documents: ['Vehicle Insurance Policy'],
        expiration: '12 hours',
        status: 'Active',
        createdAt: 'Today, 10:12 AM'
      }
    ]
  );

  const [documents] = useState<DocumentItem[]>(demoDocuments);
  const [assets] = useState<AssetItem[]>(demoAssets);
  const [contacts] = useState<EmergencyContact[]>(demoEmergencyContacts);
  const [plans] = useState<EmergencyPlan[]>(demoEmergencyPlans);
  const [readiness] = useState<ReadinessOverview>(demoReadiness);

  // Sync core crisis & active state changes to localStorage
  useEffect(() => {
    try {
      const stateToSave: SavedAppState = {
        mode,
        selectedPlanId,
        crisisSession,
        temporaryAccessRecords
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Failed to persist cs_app_state:', err);
    }
  }, [mode, selectedPlanId, crisisSession, temporaryAccessRecords]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const crisisActive = mode === 'crisis';

  const selectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const startActivation = (planId?: string) => {
    if (planId) setSelectedPlanId(planId);
    setDormantNotification(null);
    setMode('activating');
  };

  const confirmCrisisActivation = (scenarioId?: string) => {
    const activeId = scenarioId || selectedPlanId;
    const newSession = createCrisisSession(activeId);
    setCrisisSession(newSession);
    setMode('crisis');
  };

  const cancelActivation = () => {
    setMode('dormant');
  };

  const endCrisis = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Auto-expire active temporary access records
    setTemporaryAccessRecords((prev) =>
      prev.map((rec) => ({ ...rec, status: 'Expired' as const }))
    );

    setCrisisSession((prev) => ({
      ...prev,
      status: 'resolved',
      timelineEvents: [
        {
          id: `evt-${Date.now()}-end`,
          timestamp: now,
          title: 'Crisis ended',
          description: `Crisis mode deactivated by user. All temporary access records expired. Shadow returned to standby.`,
          type: 'status_change'
        },
        ...prev.timelineEvents
      ]
    }));

    setMode('dormant');
    setDormantNotification('Your Shadow is dormant again.');
  };

  const clearDormantNotification = () => {
    setDormantNotification(null);
  };

  const addTimelineEvent = (title: string, description: string, type: TimelineEvent['type']) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp: now,
      title,
      description,
      type
    };
    setCrisisSession((prev) => ({
      ...prev,
      timelineEvents: [newEvent, ...prev.timelineEvents]
    }));
  };

  const setTaskStatus = (taskId: string, newStatus: CrisisTask['status']) => {
    let taskTitle = '';
    let assignee = '';

    setCrisisSession((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          taskTitle = t.title;
          assignee = t.assignedTo;
          return { ...t, status: newStatus };
        }
        return t;
      })
    }));

    if (newStatus === 'Completed') {
      addTimelineEvent(
        `Task completed: ${taskTitle}`,
        `Marked complete by ${assignee}.`,
        'task_completed'
      );
    } else if (newStatus === 'In Progress') {
      addTimelineEvent(
        `Task in progress: ${taskTitle}`,
        `${assignee} is actively working on this task.`,
        'status_change'
      );
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = crisisSession.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextMap: Record<CrisisTask['status'], CrisisTask['status']> = {
      'Pending': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Pending'
    };
    setTaskStatus(taskId, nextMap[task.status]);
  };

  const claimTask = (taskId: string, personName: string) => {
    let taskTitle = '';
    setCrisisSession((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          taskTitle = t.title;
          return { ...t, assignedTo: personName, status: 'In Progress' };
        }
        return t;
      })
    }));

    addTimelineEvent(
      `Task claimed: ${taskTitle}`,
      `Claimed by ${personName}. Status updated to In Progress.`,
      'task_assigned'
    );
  };

  const createAccessRecord = (recipient: string, docNames: string[], expiration = '24 hours') => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecord: SecureAccessRecord = {
      id: `acc-${Math.floor(100 + Math.random() * 900)}`,
      recipient,
      documents: docNames,
      expiration,
      status: 'Active',
      createdAt: `Today, ${now}`
    };

    setTemporaryAccessRecords((prev) => [newRecord, ...prev]);

    addTimelineEvent(
      `Temporary access created for ${recipient}`,
      `Granted 24-hour access to: ${docNames.join(', ')}.`,
      'access_created'
    );
  };

  const revokeAccessRecord = (recordId: string) => {
    let recRecipient = '';
    setTemporaryAccessRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          recRecipient = rec.recipient;
          return { ...rec, status: 'Revoked' as const };
        }
        return rec;
      })
    );

    addTimelineEvent(
      `Temporary access revoked`,
      `Access revoked for ${recRecipient || 'recipient'}.`,
      'access_revoked'
    );
  };

  return (
    <AppContext.Provider
      value={{
        crisisActive,
        mode,
        setMode,
        dormantNotification,
        clearDormantNotification,
        selectedPlan,
        selectPlan,
        documents,
        assets,
        contacts,
        plans,
        readiness,
        crisisSession,
        temporaryAccessRecords,
        startActivation,
        confirmCrisisActivation,
        cancelActivation,
        endCrisis,
        setTaskStatus,
        toggleTaskStatus,
        claimTask,
        createAccessRecord,
        revokeAccessRecord,
        addTimelineEvent
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
