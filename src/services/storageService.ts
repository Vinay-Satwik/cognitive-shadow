/**
 * Cognitive Shadow Central Storage Service
 * 
 * Versioned local persistence layer.
 * Clean abstraction allowing straightforward replacement with Supabase
 * or a remote backend.
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
    recipient: 'Rahul Morgan',
    recipientEmail: 'rahul.morgan@example.com',
    documents: ['Vehicle Insurance Policy', 'Vehicle Registration (RC)'],
    expiration: '24 hours',
    status: 'Active',
    createdAt: 'Today, 10:05 AM'
  },
  {
    id: 'acc-102',
    recipient: 'National Insurance Adjuster',
    recipientEmail: 'claims@insurancecorp.example',
    documents: ['Vehicle Insurance Policy'],
    expiration: '12 hours',
    status: 'Active',
    createdAt: 'Today, 10:12 AM'
  }
];

export const getDefaultStoreData = (): AppStoreData => {
  return {
    version: CURRENT_STORE_VERSION,
    userProfile: { ...defaultUserProfile },
    documents: JSON.parse(JSON.stringify(demoDocuments)),
    assets: JSON.parse(JSON.stringify(demoAssets)),
    contacts: JSON.parse(JSON.stringify(demoEmergencyContacts)),
    plans: JSON.parse(JSON.stringify(demoEmergencyPlans)),
    crisisSession: createCrisisSession('plan-auto-accident'),
    temporaryAccessRecords: [...defaultAccessRecords],
    mode: 'dormant',
    selectedPlanId: 'plan-auto-accident'
  };
};

export const storageService = {
  /**
   * Load store data from local storage with graceful fallback to demo baseline
   */
  load(): AppStoreData {
    try {
      const raw = localStorage.getItem(STORE_STORAGE_KEY);
      if (!raw) {
        const initial = getDefaultStoreData();
        this.save(initial);
        return initial;
      }

      const parsed = JSON.parse(raw) as AppStoreData;
      
      // Basic integrity check
      if (!parsed.documents || !parsed.assets || !parsed.contacts || !parsed.plans) {
        const fallback = getDefaultStoreData();
        this.save(fallback);
        return fallback;
      }

      return parsed;
    } catch (err) {
      console.error('[storageService] Failed to load data from storage, resetting to default:', err);
      const fallback = getDefaultStoreData();
      this.save(fallback);
      return fallback;
    }
  },

  /**
   * Persist current state to localStorage
   */
  save(data: AppStoreData): void {
    try {
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[storageService] Failed to persist data to storage:', err);
    }
  },

  /**
   * Reset store back to fresh default demo state
   */
  reset(): AppStoreData {
    const fresh = getDefaultStoreData();
    this.save(fresh);
    return fresh;
  },

  /**
   * Export all data as a JSON blob string
   */
  export(data: AppStoreData): string {
    return JSON.stringify(data, null, 2);
  }
};
