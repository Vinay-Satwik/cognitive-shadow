import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AppMode,
  Document,
  Asset,
  EmergencyContact,
  EmergencyPlan,
  PlanTask,
  CrisisSession,
  ReadinessOverview,
  CrisisTask,
  SecureAccess,
  TimelineEvent,
  UserProfile
} from '../types';
import { storageService, AppStoreData } from '../services/storageService';
import { readinessEngine } from '../services/readinessEngine';
import { contextEngine } from '../services/contextEngine';
import { createCrisisSession } from '../lib/crisisEngine';

interface AppContextType {
  // Mode & System State
  crisisActive: boolean;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  dormantNotification: string | null;
  clearDormantNotification: () => void;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Selected Emergency Plan
  selectedPlan: EmergencyPlan;
  selectPlan: (planId: string) => void;

  // Documents CRUD
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => void;
  updateDocument: (id: string, doc: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  // Assets CRUD
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  // Emergency Contacts CRUD
  contacts: EmergencyContact[];
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateContact: (id: string, contact: Partial<EmergencyContact>) => void;
  deleteContact: (id: string) => void;

  // Emergency Plans CRUD
  plans: EmergencyPlan[];
  addPlan: (plan: Omit<EmergencyPlan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<EmergencyPlan>) => void;
  deletePlan: (id: string) => void;

  // Dynamic Readiness Score
  readiness: ReadinessOverview;

  // Crisis State
  crisisSession: CrisisSession;
  temporaryAccessRecords: SecureAccess[];

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

  // Data Store Management
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hydrate initial store from storageService (versioned key)
  const initialStore = useMemo(() => storageService.load(), []);

  const [userProfile, setUserProfile] = useState<UserProfile>(initialStore.userProfile);
  const [documents, setDocuments] = useState<Document[]>(initialStore.documents);
  const [assets, setAssets] = useState<Asset[]>(initialStore.assets);
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialStore.contacts);
  const [plans, setPlans] = useState<EmergencyPlan[]>(initialStore.plans);
  const [crisisSession, setCrisisSession] = useState<CrisisSession>(initialStore.crisisSession);
  const [temporaryAccessRecords, setTemporaryAccessRecords] = useState<SecureAccess[]>(
    initialStore.temporaryAccessRecords
  );
  const [mode, setMode] = useState<AppMode>(initialStore.mode);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialStore.selectedPlanId);
  const [dormantNotification, setDormantNotification] = useState<string | null>(null);

  // Compute Readiness Dynamically from actual living data
  const readiness = useMemo(() => {
    return readinessEngine.calculate(documents, assets, contacts, plans, userProfile);
  }, [documents, assets, contacts, plans, userProfile]);

  // Persist current state whenever any data or active session changes
  useEffect(() => {
    const dataToSave: AppStoreData = {
      version: 2,
      userProfile,
      documents,
      assets,
      contacts,
      plans,
      crisisSession,
      temporaryAccessRecords,
      mode,
      selectedPlanId
    };
    storageService.save(dataToSave);
  }, [
    userProfile,
    documents,
    assets,
    contacts,
    plans,
    crisisSession,
    temporaryAccessRecords,
    mode,
    selectedPlanId
  ]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0] || {
    id: 'plan-auto-accident',
    name: 'Major Automobile Accident',
    emoji: '🚗',
    description: 'Road incident response blueprint',
    relevantDocuments: [],
    relevantAssets: [],
    relevantContacts: [],
    defaultTasks: [],
    sharingRules: []
  };

  const crisisActive = mode === 'crisis';

  // --- Profile Operations ---
  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString()
    }));
  };

  // --- Document Operations ---
  const addDocument = (newDoc: Omit<Document, 'id' | 'uploadDate'>) => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const uploadDate = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const docToAdd: Document = {
      ...newDoc,
      id,
      uploadDate
    };

    setDocuments((prev) => [docToAdd, ...prev]);

    // If related to an asset, ensure asset's relatedDocuments array references it
    if (docToAdd.relatedAsset) {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (asset.name === docToAdd.relatedAsset && !asset.relatedDocuments.includes(docToAdd.name)) {
            return {
              ...asset,
              relatedDocuments: [...asset.relatedDocuments, docToAdd.name]
            };
          }
          return asset;
        })
      );
    }
  };

  const updateDocument = (id: string, updatedFields: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const updated = { ...doc, ...updatedFields };
          // If related asset changed, update asset relationships
          if (updatedFields.relatedAsset && updatedFields.relatedAsset !== doc.relatedAsset) {
            setAssets((prevAssets) =>
              prevAssets.map((asset) => {
                if (asset.name === updatedFields.relatedAsset && !asset.relatedDocuments.includes(updated.name)) {
                  return { ...asset, relatedDocuments: [...asset.relatedDocuments, updated.name] };
                }
                return asset;
              })
            );
          }
          return updated;
        }
        return doc;
      })
    );
  };

  const deleteDocument = (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    // Remove from linked assets and plans
    if (docToDelete) {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => ({
          ...asset,
          relatedDocuments: asset.relatedDocuments.filter(
            (name) => name !== docToDelete.name && name !== docToDelete.id
          )
        }))
      );
      setPlans((prevPlans) =>
        prevPlans.map((plan) => ({
          ...plan,
          relevantDocuments: plan.relevantDocuments.filter((dId) => dId !== id)
        }))
      );
    }
  };

  // --- Asset Operations ---
  const addAsset = (newAsset: Omit<Asset, 'id'>) => {
    const id = `ast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const assetToAdd: Asset = {
      ...newAsset,
      id
    };
    setAssets((prev) => [assetToAdd, ...prev]);
  };

  const updateAsset = (id: string, updatedFields: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((asset) => (asset.id === id ? { ...asset, ...updatedFields } : asset))
    );
  };

  const deleteAsset = (id: string) => {
    const assetToDelete = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));

    // Clear relatedAsset reference from documents and plans
    if (assetToDelete) {
      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.relatedAsset === assetToDelete.name ? { ...doc, relatedAsset: undefined } : doc
        )
      );
      setPlans((prevPlans) =>
        prevPlans.map((plan) => ({
          ...plan,
          relevantAssets: plan.relevantAssets.filter((aId) => aId !== id)
        }))
      );
    }
  };

  // --- Contact Operations ---
  const addContact = (newContact: Omit<EmergencyContact, 'id'>) => {
    const id = `con-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const contactToAdd: EmergencyContact = {
      ...newContact,
      id
    };

    setContacts((prev) => {
      // If new contact is marked as primary, unmark others
      if (contactToAdd.primary) {
        return [contactToAdd, ...prev.map((c) => ({ ...c, primary: false }))];
      }
      return [...prev, contactToAdd];
    });
  };

  const updateContact = (id: string, updatedFields: Partial<EmergencyContact>) => {
    setContacts((prev) => {
      return prev.map((contact) => {
        if (contact.id === id) {
          const updated = { ...contact, ...updatedFields };
          return updated;
        }
        // If another was made primary, clear primary from other contacts
        if (updatedFields.primary) {
          return { ...contact, primary: false };
        }
        return contact;
      });
    });
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setPlans((prevPlans) =>
      prevPlans.map((plan) => ({
        ...plan,
        relevantContacts: plan.relevantContacts.filter((cId) => cId !== id)
      }))
    );
  };

  // --- Plan Operations ---
  const addPlan = (newPlan: Omit<EmergencyPlan, 'id'>) => {
    const id = `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const planToAdd: EmergencyPlan = {
      ...newPlan,
      id
    };
    setPlans((prev) => [...prev, planToAdd]);
  };

  const updatePlan = (id: string, updatedFields: Partial<EmergencyPlan>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const selectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  // --- State Machine Transitions ---
  const startActivation = (planId?: string) => {
    if (planId) setSelectedPlanId(planId);
    setDormantNotification(null);
    setMode('activating');
  };

  const confirmCrisisActivation = (scenarioId?: string) => {
    const activeId = scenarioId || selectedPlanId;
    const planForScenario = plans.find((p) => p.id === activeId);

    // Filter relevant information contextually using contextEngine
    const contextualData = contextEngine.filter(
      activeId,
      documents,
      assets,
      contacts,
      planForScenario
    );

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSession: CrisisSession = {
      id: `crisis-${Date.now()}`,
      scenarioId: activeId,
      scenario: contextualData.emergencyBriefData.scenarioName,
      scenarioEmoji: contextualData.emergencyBriefData.scenarioEmoji,
      activatedAt: now,
      status: 'active',
      surfacedDocuments: contextualData.relevantDocuments.map((d) => d.id),
      involvedContacts: contextualData.relevantContacts.map((c) => c.id),
      primaryContactId: contextualData.emergencyBriefData.primaryContact?.id,
      primaryAssetId: contextualData.emergencyBriefData.primaryAsset?.id,
      insurancePolicyName: contextualData.emergencyBriefData.insurancePolicyName,
      tasks: contextualData.priorityTasks,
      timelineEvents: [
        {
          id: `evt-${Date.now()}-1`,
          timestamp: now,
          title: 'Crisis activated',
          description: `${contextualData.emergencyBriefData.scenarioName} engaged. Cognitive Shadow entered Crisis Mode.`,
          type: 'activation'
        },
        {
          id: `evt-${Date.now()}-2`,
          timestamp: now,
          title: 'Contextual reduction executed',
          description: `${contextualData.relevantDocuments.length} relevant documents and ${contextualData.relevantContacts.length} emergency contacts surfaced.`,
          type: 'document_surfaced'
        },
        {
          id: `evt-${Date.now()}-3`,
          timestamp: now,
          title: 'Tasks dispatched',
          description: `${contextualData.priorityTasks.length} priority tasks assigned to CareCircle.`,
          type: 'task_assigned'
        }
      ]
    };

    setCrisisSession(newSession);
    setMode('crisis');
  };

  const cancelActivation = () => {
    setMode('dormant');
  };

  const endCrisis = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
          description: 'Crisis mode deactivated. All temporary access records expired. Shadow returned to standby.',
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

  // --- Interactive Crisis Actions ---
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
    const newRecord: SecureAccess = {
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

  // --- Reset to Demo Data ---
  const resetToDemoData = () => {
    const fresh = storageService.reset();
    setUserProfile(fresh.userProfile);
    setDocuments(fresh.documents);
    setAssets(fresh.assets);
    setContacts(fresh.contacts);
    setPlans(fresh.plans);
    setCrisisSession(fresh.crisisSession);
    setTemporaryAccessRecords(fresh.temporaryAccessRecords);
    setMode('dormant');
    setSelectedPlanId('plan-auto-accident');
    setDormantNotification(null);
  };

  return (
    <AppContext.Provider
      value={{
        crisisActive,
        mode,
        setMode,
        dormantNotification,
        clearDormantNotification,
        userProfile,
        updateUserProfile,
        selectedPlan,
        selectPlan,
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        plans,
        addPlan,
        updatePlan,
        deletePlan,
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
        addTimelineEvent,
        resetToDemoData
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
