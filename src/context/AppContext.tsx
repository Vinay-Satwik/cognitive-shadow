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
import { storageService, getDefaultStoreData, AppStoreData } from '../services/storageService';
import { readinessEngine } from '../services/readinessEngine';
import { contextEngine } from '../services/contextEngine';
import { createCrisisSession } from '../lib/crisisEngine';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => void;
  updateDocument: (id: string, doc: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  // Assets CRUD
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  // Emergency Contacts CRUD
  contacts: EmergencyContact[];
  setContacts: React.Dispatch<React.SetStateAction<EmergencyContact[]>>;
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateContact: (id: string, contact: Partial<EmergencyContact>) => void;
  deleteContact: (id: string) => void;

  // Emergency Plans CRUD
  plans: EmergencyPlan[];
  setPlans: React.Dispatch<React.SetStateAction<EmergencyPlan[]>>;
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
  confirmCrisisActivation: (scenarioId?: string) => Promise<CrisisSession> | void;
  cancelActivation: () => void;
  endCrisis: () => Promise<void> | void;

  // Interactive Crisis Actions
  setTaskStatus: (taskId: string, status: CrisisTask['status']) => void;
  toggleTaskStatus: (taskId: string) => void;
  claimTask: (taskId: string, personName: string) => void;
  createAccessRecord: (
    recipient: string,
    documents: string[],
    expiration?: string,
    roleOrPurpose?: string,
    scope?: string[]
  ) => Promise<void> | void;
  revokeAccessRecord: (recordId: string) => Promise<void> | void;
  addTimelineEvent: (title: string, description: string, type: TimelineEvent['type']) => void;

  // Data Store Management
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile: updateAuthProfile } = useAuth();

  // Hydrate initial store from storageService based on active authenticated user
  const initialStore = useMemo(() => {
    if (!user) {
      return getDefaultStoreData('unauthenticated', { name: 'Guest', email: '' });
    }
    return storageService.load(user.id, user);
  }, []);

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

  // Synchronize store when authenticated user changes
  useEffect(() => {
    if (!user) {
      const guestStore = getDefaultStoreData('unauthenticated', { name: 'Guest', email: '' });
      setUserProfile(guestStore.userProfile);
      setDocuments(guestStore.documents);
      setAssets(guestStore.assets);
      setContacts(guestStore.contacts);
      setPlans(guestStore.plans);
      setCrisisSession(guestStore.crisisSession);
      setTemporaryAccessRecords(guestStore.temporaryAccessRecords);
      setMode(guestStore.mode);
      setSelectedPlanId(guestStore.selectedPlanId);
      return;
    }
    const store = storageService.load(user.id, user);
    setUserProfile(store.userProfile);
    setDocuments(store.documents);
    setAssets(store.assets);
    setContacts(store.contacts);
    setPlans(store.plans);
    setCrisisSession(store.crisisSession);
    setTemporaryAccessRecords(store.temporaryAccessRecords.filter((r) => r.userId === user.id));
    setMode(store.mode);
    setSelectedPlanId(store.selectedPlanId);

    // Reconcile active crisis session and real user data with Supabase
    if (isSupabaseConfigured && supabase) {
      // 1. Reconcile active crisis session
      supabase
        .from('crisis_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('activated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data: activeSession, error }) => {
          if (error) {
            console.warn('[Crisis Sync] Error querying active crisis session:', error);
            return;
          }
          if (activeSession) {
            console.log('[Crisis Sync] Active crisis session found in Supabase:', activeSession.id);
            setMode('crisis');
            setCrisisSession((prev) => ({
              ...prev,
              id: activeSession.id,
              status: 'active',
              scenario: activeSession.scenario,
              scenarioId: activeSession.scenario_id || prev.scenarioId
            }));
          } else if (store.mode === 'crisis') {
            console.log('[Crisis Sync] No active session in DB, reconciling mode to dormant');
            setMode('dormant');
          }
        });

      // 2. Clean up legacy fake document from Supabase if present
      supabase
        .from('documents')
        .delete()
        .eq('user_id', user.id)
        .eq('name', 'Health Insurance Card & Advance Directive')
        .or('file_path.is.null,file_path.eq.,file_path.eq.none')
        .then(({ error }) => {
          if (error) {
            console.warn('[Doc Cleanup] Error deleting fake document:', error.message);
          } else {
            console.log('[Doc Cleanup] Cleaned up fake documents from Supabase');
          }
        });

      // 3. Hydrate real documents from Supabase
      supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data: dbDocs, error }) => {
          if (error) {
            console.warn('[Doc Sync] Error loading documents from Supabase:', error.message);
            return;
          }
          if (dbDocs) {
            const realDocs = dbDocs
              .filter((d: any) => !(d.name === 'Health Insurance Card & Advance Directive' && (!d.file_path || d.file_path === '')))
              .map((d: any): Document => ({
                id: d.id,
                userId: d.user_id,
                name: d.name,
                category: d.category,
                description: d.description || '',
                filePath: d.file_path || undefined,
                fileSize: d.file_size || '1.0 MB',
                fileType: d.file_type || 'PDF',
                expiryDate: d.expiry_date || undefined,
                emergencyRelevance: (d.emergency_access_level === 'Critical' ? 'Critical' : 'High') as any,
                accessLevel: d.emergency_access_level,
                relatedAsset: d.related_asset || undefined,
                uploadDate: d.created_at ? new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Today'
              }));
            setDocuments(realDocs);
          }
        });

      // 4. Hydrate emergency contacts from Supabase
      supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .then(({ data: dbContacts, error }) => {
          if (error) {
            console.warn('[Contacts Sync] Error loading contacts from Supabase:', error.message);
            return;
          }
          if (dbContacts && dbContacts.length > 0) {
            setContacts(
              dbContacts.map((c: any): EmergencyContact => ({
                id: c.id,
                userId: c.user_id,
                name: c.full_name,
                relationship: c.relationship,
                role: c.role,
                phone: c.phone,
                email: c.email,
                primary: c.is_primary,
                medicalProxy: c.is_medical_proxy,
                availability: c.availability,
                verified: c.verified
              }))
            );
          }
        });

      // 5. Hydrate critical assets from Supabase
      supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data: dbAssets, error }) => {
          if (error) {
            console.warn('[Assets Sync] Error loading assets from Supabase:', error.message);
            return;
          }
          if (dbAssets && dbAssets.length > 0) {
            setAssets(
              dbAssets.map((a: any): Asset => ({
                id: a.id,
                userId: a.user_id,
                name: a.name,
                type: a.category,
                registrationOrSerial: a.registration_or_serial,
                purchaseDate: a.purchase_date || '2024',
                insurance: a.insurer,
                estimatedValue: a.estimated_value,
                warranty: a.warranty_status,
                relatedDocuments: a.related_documents || []
              }))
            );
          }
        });

      // 6. Hydrate emergency plans from Supabase
      supabase
        .from('emergency_plans')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data: dbPlans, error }) => {
          if (error) {
            console.warn('[Plans Sync] Error loading emergency plans from Supabase:', error.message);
            return;
          }
          if (dbPlans && dbPlans.length > 0) {
            const mappedDbPlans: EmergencyPlan[] = dbPlans.map((p: any): EmergencyPlan => ({
              id: p.id,
              userId: p.user_id,
              name: p.name || p.scenario_type,
              emoji: p.emoji || '🛡️',
              description: p.description || '',
              scenario: p.scenario_type || p.name,
              relevantDocuments: Array.isArray(p.relevant_document_ids) ? p.relevant_document_ids.map(String) : [],
              relevantAssets: Array.isArray(p.relevant_asset_ids) ? p.relevant_asset_ids.map(String) : [],
              relevantContacts: Array.isArray(p.relevant_contact_ids) ? p.relevant_contact_ids.map(String) : [],
              defaultTasks: Array.isArray(p.default_tasks) ? p.default_tasks : [],
              sharingRules: Array.isArray(p.sharing_rules) ? p.sharing_rules : []
            }));

            setPlans((prevPlans) => {
              const merged = [...prevPlans];
              for (const dbPlan of mappedDbPlans) {
                const existingIdx = merged.findIndex(
                  (ep) => ep.id === dbPlan.id || ep.name === dbPlan.name || ep.scenario === dbPlan.scenario
                );
                if (existingIdx >= 0) {
                  merged[existingIdx] = { ...merged[existingIdx], ...dbPlan };
                } else {
                  merged.push(dbPlan);
                }
              }
              return merged;
            });
          }
        });

      // 5. Hydrate real secure shares from Supabase
      supabase
        .from('secure_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(async ({ data: dbShares, error: sharesErr }) => {
          if (sharesErr) {
            console.warn('[Secure Share Sync] Error querying secure shares:', sharesErr);
            return;
          }
          if (dbShares) {
            const nowMs = Date.now();
            const expiredIdsToSync: string[] = [];

            const mapped: SecureAccess[] = dbShares.map((row) => {
              let metadata: {
                recipient?: string;
                roleOrPurpose?: string;
                scenario?: string;
                documents?: string[];
                scope?: string[];
                expiration?: string;
              } = {};

              try {
                if (row.recipient_information && row.recipient_information.startsWith('{')) {
                  metadata = JSON.parse(row.recipient_information);
                }
              } catch {
                metadata = {};
              }

              let status = row.access_status as 'Active' | 'Revoked' | 'Expired';
              if (status === 'Active' && row.expires_at) {
                if (new Date(row.expires_at).getTime() <= nowMs) {
                  status = 'Expired';
                  expiredIdsToSync.push(row.id);
                }
              }

              return {
                id: row.id,
                userId: row.user_id,
                recipient: metadata.recipient || row.recipient_information || 'Authorized Responder',
                recipientEmail: row.recipient_email || undefined,
                roleOrPurpose: metadata.roleOrPurpose || 'Emergency Responder',
                crisisSessionId: row.crisis_session_id || undefined,
                scenario: metadata.scenario || undefined,
                documents: Array.isArray(metadata.documents) ? metadata.documents : [],
                scope: Array.isArray(metadata.scope)
                  ? metadata.scope
                  : ['Emergency Brief', 'Critical Contacts', 'Relevant Assets', 'Priority Tasks', 'Surfaced Documents'],
                expiration: metadata.expiration || '24 hours',
                expiresAt: row.expires_at || undefined,
                status,
                createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : 'Recent',
                revokedAt: row.revoked_at || undefined
              };
            });

            // Authoritatively set records from Supabase
            setTemporaryAccessRecords(mapped);

            // In background, sync expired status back to Supabase if any active share expired
            if (expiredIdsToSync.length > 0 && supabase) {
              supabase
                .from('secure_shares')
                .update({ access_status: 'Expired' })
                .in('id', expiredIdsToSync)
                .then(() => {
                  console.log('[Secure Share Sync] Expired passes synchronized');
                });
            }
          }
        });
    }
  }, [user?.id]);

  // Compute Readiness Dynamically from actual living data
  const readiness = useMemo(() => {
    return readinessEngine.calculate(documents, assets, contacts, plans, userProfile);
  }, [documents, assets, contacts, plans, userProfile]);

  // Persist current state whenever any data or active session changes
  useEffect(() => {
    if (!user) return; // Never overwrite or persist storage when signed out
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
    storageService.save(dataToSave, user.id);
  }, [
    user?.id,
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
    setUserProfile((prev) => {
      const next = {
        ...prev,
        ...updated,
        updatedAt: new Date().toISOString()
      };
      if (updateAuthProfile) {
        updateAuthProfile({
          name: next.name,
          bloodGroup: next.bloodGroup,
          allergies: next.allergies,
          medicalNotes: next.medicalNotes,
          hasCompletedOnboarding: next.hasCompletedOnboarding
        }).catch((e) => console.warn('Auth sync failed:', e));
      }
      return next;
    });
  };

  // --- Document Operations ---
  const addDocument = (newDoc: Omit<Document, 'id' | 'uploadDate'>) => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const uploadDate = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const effectiveUserId = user?.id || userProfile.userId || '';

    const docToAdd: Document = {
      ...newDoc,
      id,
      userId: effectiveUserId,
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

      // Delete from Supabase Database and Storage if configured
      if (isSupabaseConfigured && supabase && user?.id) {
        supabase
          .from('documents')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.warn('[Doc Delete] Supabase delete error:', error.message);
            else console.log('[Doc Delete] Document deleted from Supabase:', id);
          });

        if (docToDelete.filePath) {
          supabase.storage
            .from('documents')
            .remove([docToDelete.filePath])
            .then(({ error }) => {
              if (error) console.warn('[Doc Delete] Storage remove error:', error.message);
              else console.log('[Doc Delete] File removed from storage:', docToDelete.filePath);
            });
        }
      }
    }
  };

  // --- Asset Operations ---
  const addAsset = (newAsset: Omit<Asset, 'id'>) => {
    const id = `ast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const effectiveUserId = user?.id || userProfile.userId || '';
    const assetToAdd: Asset = {
      ...newAsset,
      id,
      userId: effectiveUserId
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
    const effectiveUserId = user?.id || userProfile.userId || '';
    const contactToAdd: EmergencyContact = {
      ...newContact,
      id,
      userId: effectiveUserId
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
    const effectiveUserId = user?.id || userProfile.userId || '';
    const planToAdd: EmergencyPlan = {
      ...newPlan,
      id,
      userId: effectiveUserId
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

  const confirmCrisisActivation = async (scenarioId?: string): Promise<CrisisSession> => {
    const activeId = scenarioId || selectedPlanId;

    let targetUserId = user?.id || '';
    let supabaseSessionId: string | null = null;
    const nowIso = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. In Supabase mode, verify authenticated user and persist session to database
    if (isSupabaseConfigured && supabase) {
      const supabaseUrlStr = import.meta.env.VITE_SUPABASE_URL || '';
      let supabaseProjectRef = 'unknown';
      try {
        supabaseProjectRef = new URL(supabaseUrlStr).hostname.split('.')[0];
      } catch (e) {
        // ignore url parse error
      }

      console.log('[CrisisSession] Verifying environment & credentials:');
      console.log('  Supabase Project:', {
        url: supabaseUrlStr,
        ref: supabaseProjectRef
      });
      console.log('  AuthContext user:', {
        id: user?.id,
        email: user?.email
      });

      const { data: authData, error: userErr } = await supabase.auth.getUser();
      const authUser = authData?.user;
      console.log('  Supabase auth.getUser():', {
        id: authUser?.id,
        email: authUser?.email,
        error: userErr ? { message: userErr.message, status: userErr.status } : null
      });

      if (user?.id && authUser?.id && user.id !== authUser.id) {
        console.warn('[CrisisSession] AuthContext user.id and Supabase authUser.id mismatch:', {
          authContextId: user.id,
          supabaseAuthId: authUser.id
        });
      }

      const effectiveAuthUser = authUser || (user?.id ? { id: user.id } : null);
      if (!effectiveAuthUser || !effectiveAuthUser.id) {
        console.error('[CrisisSession] Authentication verification failed: No active user.');
        throw new Error(userErr?.message || 'Authentication required: User ID not found.');
      }
      targetUserId = effectiveAuthUser.id;

      // Filter relevant information contextually using central contextEngine
      const contextualData = contextEngine.generateCrisisContext({
        userId: targetUserId,
        scenario: activeId,
        profile: userProfile,
        documents,
        assets,
        emergencyContacts: contacts,
        emergencyPlans: plans
      });

      // End any existing active sessions to prevent duplicate active state
      const { error: cleanupErr } = await supabase
        .from('crisis_sessions')
        .update({ status: 'ended', ended_at: nowIso })
        .eq('user_id', targetUserId)
        .eq('status', 'active');

      if (cleanupErr) {
        console.warn('[CrisisSession] Prior session cleanup warning:', cleanupErr);
      }

      // Prepare insert payload
      const insertPayload = {
        user_id: targetUserId,
        scenario: contextualData.scenario.name,
        scenario_id: contextualData.scenario.id,
        status: 'active',
        activated_at: nowIso
      };

      console.log('[CrisisSession] INSERT ATTEMPT', {
        userId: user?.id || targetUserId,
        scenario: contextualData.scenario.name,
        scenarioId: contextualData.scenario.id
      });

      // Create new active session record in Supabase
      let dbSession: any = null;
      let sessErr: any = null;

      const insertResult = await supabase
        .from('crisis_sessions')
        .insert(insertPayload)
        .select()
        .single();

      dbSession = insertResult.data;
      sessErr = insertResult.error;

      // Schema compatibility check: if activated_at column does not exist, retry with core columns
      if (sessErr && (sessErr.code === 'PGRST204' || sessErr.message?.includes('activated_at'))) {
        console.warn('[CrisisSession] Column "activated_at" missing from crisis_sessions table schema. Retrying with core schema columns...');
        const corePayload = {
          user_id: targetUserId,
          scenario: contextualData.scenario.name,
          scenario_id: contextualData.scenario.id,
          status: 'active'
        };
        console.log('[CrisisSession] Retrying insert with core payload:', corePayload);
        const retryResult = await supabase
          .from('crisis_sessions')
          .insert(corePayload)
          .select()
          .single();
        dbSession = retryResult.data;
        sessErr = retryResult.error;
      }

      if (sessErr || !dbSession) {
        console.error('[CrisisSession] INSERT FAILED', {
          message: sessErr?.message,
          code: sessErr?.code,
          details: sessErr?.details,
          hint: sessErr?.hint
        });
        throw new Error(`[CrisisSession] INSERT FAILED: ${sessErr?.message || 'Unknown database error'} (code: ${sessErr?.code || 'N/A'})`);
      }

      console.log('[CrisisSession] INSERT SUCCESS', dbSession);
      supabaseSessionId = dbSession.id;

      const effectiveUserId = targetUserId;
      const newSession: CrisisSession = {
        id: dbSession.id,
        userId: effectiveUserId,
        scenarioId: activeId,
        scenario: contextualData.scenario.name,
        scenarioEmoji: contextualData.scenario.emoji,
        activatedAt: nowTime,
        status: 'active',
        surfacedDocuments: contextualData.relevantDocuments.map((d) => d.id),
        involvedContacts: contextualData.relevantContacts.map((c) => c.id),
        primaryContactId: contextualData.emergencyBrief.primaryContact?.id,
        primaryAssetId: contextualData.emergencyBrief.primaryAsset?.id,
        insurancePolicyName: contextualData.emergencyBrief.insurancePolicyName,
        tasks: contextualData.priorityTasks.map((t) => ({ ...t, userId: effectiveUserId })),
        timelineEvents: [
          {
            id: `evt-${Date.now()}-1`,
            userId: effectiveUserId,
            timestamp: nowTime,
            title: 'Crisis activated',
            description: `${contextualData.scenario.name} engaged. Cognitive Shadow entered Crisis Mode.`,
            type: 'activation'
          },
          {
            id: `evt-${Date.now()}-2`,
            userId: effectiveUserId,
            timestamp: nowTime,
            title: 'Contextual reduction executed',
            description: `${contextualData.relevantDocuments.length} relevant documents and ${contextualData.relevantContacts.length} emergency contacts surfaced.`,
            type: 'document_surfaced'
          },
          {
            id: `evt-${Date.now()}-3`,
            userId: effectiveUserId,
            timestamp: nowTime,
            title: 'Tasks dispatched',
            description: contextualData.relevantContacts.length > 0
              ? `${contextualData.priorityTasks.length} priority tasks assigned to emergency contacts.`
              : `${contextualData.priorityTasks.length} priority tasks generated; 0 emergency contacts configured.`,
            type: 'task_assigned'
          }
        ]
      };

      setCrisisSession(newSession);
      setMode('crisis');
      return newSession;
    } else {
      // Local demo mode fallback only if Supabase is completely unconfigured
      const effectiveUserId = targetUserId || userProfile.userId || '';
      const contextualData = contextEngine.generateCrisisContext({
        userId: effectiveUserId,
        scenario: activeId,
        profile: userProfile,
        documents,
        assets,
        emergencyContacts: contacts,
        emergencyPlans: plans
      });

      const newSession: CrisisSession = {
        id: `crisis-${Date.now()}`,
        userId: effectiveUserId,
        scenarioId: activeId,
        scenario: contextualData.scenario.name,
        scenarioEmoji: contextualData.scenario.emoji,
        activatedAt: nowTime,
        status: 'active',
        surfacedDocuments: contextualData.relevantDocuments.map((d) => d.id),
        involvedContacts: contextualData.relevantContacts.map((c) => c.id),
        primaryContactId: contextualData.emergencyBrief.primaryContact?.id,
        primaryAssetId: contextualData.emergencyBrief.primaryAsset?.id,
        insurancePolicyName: contextualData.emergencyBrief.insurancePolicyName,
        tasks: contextualData.priorityTasks.map((t) => ({ ...t, userId: effectiveUserId })),
        timelineEvents: [
          {
            id: `evt-${Date.now()}-1`,
            userId: effectiveUserId,
            timestamp: nowTime,
            title: 'Crisis activated',
            description: `${contextualData.scenario.name} engaged. Cognitive Shadow entered Crisis Mode.`,
            type: 'activation'
          }
        ]
      };

      setCrisisSession(newSession);
      setMode('crisis');
      return newSession;
    }
  };

  const cancelActivation = () => {
    setMode('dormant');
  };

  const endCrisis = async () => {
    const nowIso = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const effectiveUserId = user?.id || userProfile.userId || '';

    // Update active session in Supabase to resolved
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: userErr } = await supabase.auth.getUser();
      const targetUserId = authData?.user?.id || user?.id;
      if (targetUserId) {
        const { error: endErr } = await supabase
          .from('crisis_sessions')
          .update({ status: 'resolved', ended_at: nowIso })
          .eq('user_id', targetUserId)
          .eq('status', 'active');

        if (endErr) {
          console.error('[Crisis End] Supabase crisis_sessions update error:', {
            message: endErr.message,
            code: endErr.code,
            details: endErr.details,
            hint: endErr.hint
          });
          throw endErr;
        }

        // Expire active secure shares in Supabase
        const { error: expireErr } = await supabase
          .from('secure_shares')
          .update({ access_status: 'Expired' })
          .eq('user_id', targetUserId)
          .eq('access_status', 'Active');

        if (expireErr) {
          console.error('[Crisis End] Supabase secure_shares update error:', expireErr);
        }
      }
    }

    setTemporaryAccessRecords((prev) =>
      prev.map((rec) => ({ ...rec, status: 'Expired' as const }))
    );

    setCrisisSession((prev) => ({
      ...prev,
      status: 'resolved',
      timelineEvents: [
        {
          id: `evt-${Date.now()}-end`,
          userId: effectiveUserId,
          timestamp: nowTime,
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
    const effectiveUserId = user?.id || userProfile.userId || '';
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      userId: effectiveUserId,
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

  const createAccessRecord = async (
    recipient: string,
    docNames: string[],
    expiration = '24 hours',
    roleOrPurpose = 'Emergency Responder',
    scope: string[] = ['Emergency Brief', 'Critical Contacts', 'Relevant Assets', 'Priority Tasks', 'Surfaced Documents']
  ) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const effectiveUserId = user?.id || userProfile.userId || '';

    let hours = 24;
    if (expiration.includes('1 hour')) hours = 1;
    else if (expiration.includes('4 hour')) hours = 4;
    else if (expiration.includes('6 hour')) hours = 6;
    else if (expiration.includes('12 hour')) hours = 12;
    else if (expiration.includes('24 hour')) hours = 24;
    else if (expiration.includes('48 hour')) hours = 48;

    const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    const recipientInfoJson = JSON.stringify({
      recipient,
      roleOrPurpose,
      scenario: crisisSession.scenario,
      documents: docNames,
      scope,
      expiration
    });

    const isUuid = (str?: string) =>
      typeof str === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let createdId = `acc-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        const payload = {
          user_id: user.id,
          crisis_session_id: isUuid(crisisSession.id) ? crisisSession.id : null,
          recipient_information: recipientInfoJson,
          recipient_email: recipient.includes('@') ? recipient : null,
          access_status: 'Active' as const,
          expires_at: expiresAt
        };

        const { data: dbShare, error: insertErr } = await supabase
          .from('secure_shares')
          .insert(payload)
          .select()
          .single();

        if (insertErr) {
          console.error('[Secure Share] Supabase insert error:', insertErr);
        } else if (dbShare?.id) {
          createdId = dbShare.id;
        }
      } catch (err) {
        console.error('[Secure Share] Unexpected error inserting to Supabase:', err);
      }
    }

    const newRecord: SecureAccess = {
      id: createdId,
      userId: effectiveUserId,
      recipient,
      recipientEmail: recipient.includes('@') ? recipient : undefined,
      roleOrPurpose,
      crisisSessionId: crisisSession.id,
      scenario: crisisSession.scenario,
      documents: docNames,
      scope,
      expiration,
      expiresAt,
      status: 'Active',
      createdAt: `Today, ${now}`
    };

    setTemporaryAccessRecords((prev) => [newRecord, ...prev]);

    addTimelineEvent(
      `Temporary access created for ${recipient}`,
      `Granted ${expiration} access for ${roleOrPurpose} (${docNames.length} documents, ${scope.length} sections).`,
      'access_created'
    );
  };

  const revokeAccessRecord = async (recordId: string) => {
    let recRecipient = '';
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recordId);
        if (isUuid) {
          const { error: updateErr } = await supabase
            .from('secure_shares')
            .update({
              access_status: 'Revoked',
              revoked_at: nowIso
            })
            .eq('user_id', user.id)
            .eq('id', recordId);

          if (updateErr) {
            console.error('[Secure Share Revoke] Supabase update error:', updateErr);
          }
        }
      } catch (err) {
        console.error('[Secure Share Revoke] Unexpected error:', err);
      }
    }

    setTemporaryAccessRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          recRecipient = rec.recipient;
          return { ...rec, status: 'Revoked' as const, revokedAt: nowIso };
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
    if (!user) return;
    const fresh = storageService.reset(user.id, userProfile);
    setUserProfile(fresh.userProfile);
    setDocuments(fresh.documents);
    setAssets(fresh.assets);
    setContacts(fresh.contacts);
    setPlans(fresh.plans);
    setCrisisSession(fresh.crisisSession);
    setTemporaryAccessRecords(fresh.temporaryAccessRecords);
    setMode('dormant');
    setSelectedPlanId(fresh.selectedPlanId);
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
        setDocuments,
        addDocument,
        updateDocument,
        deleteDocument,
        assets,
        setAssets,
        addAsset,
        updateAsset,
        deleteAsset,
        contacts,
        setContacts,
        addContact,
        updateContact,
        deleteContact,
        plans,
        setPlans,
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
