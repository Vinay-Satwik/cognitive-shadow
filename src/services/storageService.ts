/**
 * Cognitive Shadow Central Storage Service
 * 
 * Versioned local persistence layer with strict user data isolation.
 * Every record is associated with the authenticated user's userId.
 * Clean abstraction allowing straightforward replacement with Supabase
 * queries and Row Level Security (RLS).
 */

import {
  UserProfile,
  Document,
  Asset,
  EmergencyContact,
  EmergencyPlan,
  CrisisSession,
  SecureAccess,
  AppMode
} from '../types';
import {
  demoDocuments,
  demoAssets,
  demoEmergencyContacts,
  demoEmergencyPlans
} from '../data/demoData';
import { createCrisisSession } from '../lib/crisisEngine';

export const STORE_STORAGE_KEY = 'cs_store_v2';
export const CURRENT_STORE_VERSION = 2;

export interface AppStoreData {
  version: number;
  userProfile: UserProfile;
  documents: Document[];
  assets: Asset[];
  contacts: EmergencyContact[];
  plans: EmergencyPlan[];
  crisisSession: CrisisSession;
  temporaryAccessRecords: SecureAccess[];
  mode: AppMode;
  selectedPlanId: string;
}

export const defaultUserProfile: UserProfile = {
  id: 'usr-alex-morgan',
  userId: 'usr-alex-morgan',
  name: 'Alex Morgan',
  email: 'alex.morgan@shadowops.internal',
  phone: '+1 (555) 382-9901',
  bloodGroup: 'O+',
  allergies: 'Penicillin, Cephalosporins',
  medicalNotes: 'Asthma inhaler in travel kit. Advance medical proxy designated to Rahul Morgan.',
  emergencyDirective: 'In the event of medical incapacitation, notify Rahul Morgan immediately. Advance directive on file.',
  primaryLocation: 'San Francisco, CA',
  hasCompletedOnboarding: true,
  createdAt: '2025-01-01T00:00:00Z'
};

export const defaultAccessRecords: SecureAccess[] = [
  {
    id: 'acc-101',
    userId: 'usr-alex-morgan',
    recipient: 'Rahul Morgan',
    recipientEmail: 'rahul.morgan@example.com',
    documents: ['Vehicle Insurance Policy', 'Vehicle Registration (RC)'],
    expiration: '24 hours',
    status: 'Active',
    createdAt: 'Today, 10:05 AM'
  },
  {
    id: 'acc-102',
    userId: 'usr-alex-morgan',
    recipient: 'National Insurance Adjuster',
    recipientEmail: 'claims@insurancecorp.example',
    documents: ['Vehicle Insurance Policy'],
    expiration: '12 hours',
    status: 'Active',
    createdAt: 'Today, 10:12 AM'
  }
];

export function getUserStorageKey(userId: string): string {
  return `${STORE_STORAGE_KEY}_${userId}`;
}

/**
 * Generate fresh baseline data for a given user.
 * Demo accounts get seed records; new users start with clean, unpolluted data.
 */
export const getDefaultStoreData = (userId = 'usr-alex-morgan', initialProfile?: Partial<UserProfile>): AppStoreData => {
  const isDemo = userId === 'usr-alex-morgan' || initialProfile?.email?.toLowerCase().includes('alex.morgan');

  if (isDemo) {
    return {
      version: CURRENT_STORE_VERSION,
      userProfile: { ...defaultUserProfile, userId },
      documents: demoDocuments.map((d) => ({ ...d, userId })),
      assets: demoAssets.map((a) => ({ ...a, userId })),
      contacts: demoEmergencyContacts.map((c) => ({ ...c, userId })),
      plans: demoEmergencyPlans.map((p) => ({ ...p, userId })),
      crisisSession: createCrisisSession('plan-auto-accident', 'Alex Morgan', userId),
      temporaryAccessRecords: defaultAccessRecords.map((a) => ({ ...a, userId })),
      mode: 'dormant',
      selectedPlanId: 'plan-auto-accident'
    };
  }

  // Clean slate for new registered user
  const newProfile: UserProfile = {
    id: userId,
    userId,
    name: initialProfile?.name || 'Registered User',
    email: initialProfile?.email || '',
    phone: initialProfile?.phone || '',
    bloodGroup: initialProfile?.bloodGroup || '',
    allergies: initialProfile?.allergies || '',
    medicalNotes: initialProfile?.medicalNotes || '',
    emergencyDirective: initialProfile?.emergencyDirective || '',
    primaryLocation: initialProfile?.primaryLocation || '',
    hasCompletedOnboarding: initialProfile?.hasCompletedOnboarding || false,
    createdAt: new Date().toISOString()
  };

  // New users begin with no personal emergency plans. The five system scenarios
  // remain available for crisis activation, but they are not treated as configured
  // user plans and therefore do not contribute to readiness until the user saves one.
  return {
    version: CURRENT_STORE_VERSION,
    userProfile: newProfile,
    documents: [],
    assets: [],
    contacts: [],
    plans: [],
    crisisSession: createCrisisSession('plan-auto-accident', newProfile.name, userId),
    temporaryAccessRecords: [],
    mode: 'dormant',
    selectedPlanId: 'plan-auto-accident'
  };* Cognitive Shadow Central Storage Service
 * 
 * Versioned local persistence layer with strict user data isolation.
 * Every record is associated with the authenticated user's userId.
 * Clean abstraction allowing straightforward replacement with Supabase
 * queries and Row Level Security (RLS).
 */

import {
  UserProfile,
  Document,
  Asset,
  EmergencyContact,
  EmergencyPlan,
  CrisisSession,
  SecureAccess,
  AppMode
} from '../types';
import {
  demoDocuments,
  demoAssets,
  demoEmergencyContacts,
  demoEmergencyPlans
} from '../data/demoData';
import { createCrisisSession } from '../lib/crisisEngine';

export const STORE_STORAGE_KEY = 'cs_store_v2';
export const CURRENT_STORE_VERSION = 2;

export interface AppStoreData {
  version: number;
  userProfile: UserProfile;
  documents: Document[];
  assets: Asset[];
  contacts: EmergencyContact[];
  plans: EmergencyPlan[];
  crisisSession: CrisisSession;
  temporaryAccessRecords: SecureAccess[];
  mode: AppMode;
  selectedPlanId: string;
}

export const defaultUserProfile: UserProfile = {
  id: 'usr-alex-morgan',
  userId: 'usr-alex-morgan',
  name: 'Alex Morgan',
  email: 'alex.morgan@shadowops.internal',
  phone: '+1 (555) 382-9901',
  bloodGroup: 'O+',
  allergies: 'Penicillin, Cephalosporins',
  medicalNotes: 'Asthma inhaler in travel kit. Advance medical proxy designated to Rahul Morgan.',
  emergencyDirective: 'In the event of medical incapacitation, notify Rahul Morgan immediately. Advance directive on file.',
  primaryLocation: 'San Francisco, CA',
  hasCompletedOnboarding: true,
  createdAt: '2025-01-01T00:00:00Z'
};

export const defaultAccessRecords: SecureAccess[] = [
  {
    id: 'acc-101',
    userId: 'usr-alex-morgan',
    recipient: 'Rahul Morgan',
    recipientEmail: 'rahul.morgan@example.com',
    documents: ['Vehicle Insurance Policy', 'Vehicle Registration (RC)'],
    expiration: '24 hours',
    status: 'Active',
    createdAt: 'Today, 10:05 AM'
  },
  {
    id: 'acc-102',
    userId: 'usr-alex-morgan',
    recipient: 'National Insurance Adjuster',
    recipientEmail: 'claims@insurancecorp.example',
    documents: ['Vehicle Insurance Policy'],
    expiration: '12 hours',
    status: 'Active',
    createdAt: 'Today, 10:12 AM'
  }
];

export function getUserStorageKey(userId: string): string {
  return `${STORE_STORAGE_KEY}_${userId}`;
}

/**
 * Generate fresh baseline data for a given user.
 * Demo accounts get seed records; new users start with clean, unpolluted data.
 */
export const getDefaultStoreData = (userId = 'usr-alex-morgan', initialProfile?: Partial<UserProfile>): AppStoreData => {
  const isDemo = userId === 'usr-alex-morgan' || initialProfile?.email?.toLowerCase().includes('alex.morgan');

  if (isDemo) {
    return {
      version: CURRENT_STORE_VERSION,
      userProfile: { ...defaultUserProfile, userId },
      documents: demoDocuments.map((d) => ({ ...d, userId })),
      assets: demoAssets.map((a) => ({ ...a, userId })),
      contacts: demoEmergencyContacts.map((c) => ({ ...c, userId })),
      plans: demoEmergencyPlans.map((p) => ({ ...p, userId })),
      crisisSession: createCrisisSession('plan-auto-accident', 'Alex Morgan', userId),
      temporaryAccessRecords: defaultAccessRecords.map((a) => ({ ...a, userId })),
      mode: 'dormant',
      selectedPlanId: 'plan-auto-accident'
    };
  }

  // Clean slate for new registered user
  const newProfile: UserProfile = {
    id: userId,
    userId,
    name: initialProfile?.name || 'Registered User',
    email: initialProfile?.email || '',
    phone: initialProfile?.phone || '',
    bloodGroup: initialProfile?.bloodGroup || '',
    allergies: initialProfile?.allergies || '',
    medicalNotes: initialProfile?.medicalNotes || '',
    emergencyDirective: initialProfile?.emergencyDirective || '',
    primaryLocation: initialProfile?.primaryLocation || '',
    hasCompletedOnboarding: initialProfile?.hasCompletedOnboarding || false,
    createdAt: new Date().toISOString()
  };

  const userPlans: EmergencyPlan[] = demoEmergencyPlans.map((p) => ({
    ...p,
    id: `${p.id}`,
    userId,
    relevantDocuments: [],
    relevantAssets: [],
    relevantContacts: []
  }));

  return {
    version: CURRENT_STORE_VERSION,
    userProfile: newProfile,
    documents: [],
    assets: [],
    contacts: [],
    plans: userPlans,
    crisisSession: createCrisisSession('plan-auto-accident', newProfile.name, userId),
    temporaryAccessRecords: [],
    mode: 'dormant',
    selectedPlanId: userPlans[0]?.id || 'plan-auto-accident'
  };
};

export const storageService = {
  /**
   * Load store data for a specific user from localStorage with isolated fallback
   */
  load(userId?: string, initialProfile?: Partial<UserProfile>): AppStoreData {
    const effectiveUserId = userId || 'usr-alex-morgan';
    const userKey = getUserStorageKey(effectiveUserId);

    try {
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const parsed = JSON.parse(raw) as AppStoreData;
        if (parsed.documents && parsed.assets && parsed.contacts && parsed.plans && parsed.userProfile) {
          // Filter out legacy fake documents created with empty file paths
          parsed.documents = (parsed.documents || []).filter(
            (d) => !(d.name === 'Health Insurance Card & Advance Directive' && (!d.filePath || d.filePath === '' || d.filePath === 'none'))
          );

          // Ensure every record is tagged with the current userId
          parsed.userProfile.userId = effectiveUserId;
          parsed.documents = parsed.documents.map((d) => ({ ...d, userId: d.userId || effectiveUserId }));
          parsed.assets = parsed.assets.map((a) => ({ ...a, userId: a.userId || effectiveUserId }));
          parsed.contacts = parsed.contacts.map((c) => ({ ...c, userId: c.userId || effectiveUserId }));
          parsed.plans = parsed.plans.map((p) => ({
            ...p,
            userId: p.userId || effectiveUserId,
            defaultTasks: p.defaultTasks?.map((t) => {
              let role = t.defaultAssigneeRole;
              if (role === 'Rahul' || role === 'Priya' || role === 'Maya') role = 'Primary Proxy';
              if (role === 'Dr. Mehta') role = 'Medical Proxy';
              return { ...t, defaultAssigneeRole: role };
            })
          }));

          // Remove system/demo scenario templates from real users' personal plan
          // collection. User-created plans use their own generated IDs and are preserved.
          if (effectiveUserId !== 'usr-alex-morgan') {
            const baselinePlanIds = new Set(demoEmergencyPlans.map((p) => p.id));
            parsed.plans = parsed.plans.filter((p) => !baselinePlanIds.has(p.id));
            if (parsed.selectedPlanId && baselinePlanIds.has(parsed.selectedPlanId)) {
              parsed.selectedPlanId = parsed.plans[0]?.id || '';
            }
          }

          if (parsed.crisisSession) parsed.crisisSession.userId = effectiveUserId;
          return parsed;
        }
      }

      // Check legacy single-key store if this is the demo user
      if (effectiveUserId === 'usr-alex-morgan') {
        const legacyRaw = localStorage.getItem(STORE_STORAGE_KEY);
        if (legacyRaw) {
          const parsed = JSON.parse(legacyRaw) as AppStoreData;
          if (parsed.documents && parsed.assets && parsed.contacts && parsed.plans) {
            this.save(parsed, effectiveUserId);
            return parsed;
          }
        }
      }

      // Generate initial baseline for this user
      const initial = getDefaultStoreData(effectiveUserId, initialProfile);
      this.save(initial, effectiveUserId);
      return initial;
    } catch (err) {
      console.error('[storageService] Failed to load user store, initializing default:', err);
      const fallback = getDefaultStoreData(effectiveUserId, initialProfile);
      this.save(fallback, effectiveUserId);
      return fallback;
    }
  },

  /**
   * Persist current state to localStorage, isolated by user
   */
  save(data: AppStoreData, userId?: string): void {
    const effectiveUserId = userId || data.userProfile?.userId || data.userProfile?.id || 'usr-alex-morgan';
    const userKey = getUserStorageKey(effectiveUserId);

    try {
      // Stamp userId on all collections
      data.userProfile.userId = effectiveUserId;
      data.documents = data.documents.map((d) => ({ ...d, userId: d.userId || effectiveUserId }));
      data.assets = data.assets.map((a) => ({ ...a, userId: a.userId || effectiveUserId }));
      data.contacts = data.contacts.map((c) => ({ ...c, userId: c.userId || effectiveUserId }));
      data.plans = data.plans.map((p) => ({ ...p, userId: p.userId || effectiveUserId }));
      if (data.crisisSession) data.crisisSession.userId = effectiveUserId;
      data.temporaryAccessRecords = data.temporaryAccessRecords.map((r) => ({ ...r, userId: r.userId || effectiveUserId }));

      localStorage.setItem(userKey, JSON.stringify(data));
      // Also update generic key for convenience
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[storageService] Failed to persist data to storage:', err);
    }
  },

  /**
   * Reset store back to fresh baseline state for this user
   */
  reset(userId?: string, initialProfile?: Partial<UserProfile>): AppStoreData {
    const effectiveUserId = userId || 'usr-alex-morgan';
    const fresh = getDefaultStoreData(effectiveUserId, initialProfile);
    this.save(fresh, effectiveUserId);
    return fresh;
  },

  /**
   * Export all data as a JSON blob string
   */
  export(data: AppStoreData): string {
    return JSON.stringify(data, null, 2);
  }
};
