export type AppMode = 'dormant' | 'activating' | 'crisis';

export type DocumentCategory = 
  | 'Identity' 
  | 'Medical' 
  | 'Insurance' 
  | 'Vehicle' 
  | 'Property' 
  | 'Other';

export interface DocumentItem {
  id: string;
  name: string;
  category: DocumentCategory;
  description: string;
  expiryDate?: string;
  relatedAsset?: string;
  emergencyRelevance: 'Critical' | 'High' | 'Moderate' | 'Low';
  accessLevel?: string;
  uploadDate: string;
}

export interface AssetItem {
  id: string;
  name: string;
  type: string;
  registrationOrSerial: string;
  purchaseDate: string;
  estimatedValue: string;
  insurance: string;
  warranty: string;
  relatedDocuments: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  role: string;
  availability: string;
  verified: boolean;
  primary: boolean;
  medicalProxy: boolean;
}

export interface DefaultTask {
  id: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  defaultAssigneeRole?: string;
}

export interface EmergencyPlan {
  id: string;
  name: string;
  emoji: string;
  description: string;
  relevantDocuments: string[]; // document IDs
  relevantAssets: string[]; // asset IDs
  relevantContacts: string[]; // contact IDs
  defaultTasks: DefaultTask[];
  sharingRules: string[];
}

export type CrisisTaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type CrisisTaskPriority = 'Critical' | 'High' | 'Medium';

export interface CrisisTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: CrisisTaskStatus;
  priority: CrisisTaskPriority;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 
    | 'activation' 
    | 'contact_notified' 
    | 'document_surfaced' 
    | 'task_assigned' 
    | 'task_completed' 
    | 'access_created' 
    | 'access_revoked' 
    | 'status_change';
}

export interface SecureAccessRecord {
  id: string;
  recipient: string;
  documents: string[];
  expiration: string;
  status: 'Active' | 'Revoked' | 'Expired';
  createdAt: string;
}

export interface CrisisSession {
  id: string;
  scenarioId: string;
  scenario: string;
  scenarioEmoji: string;
  activatedAt: string;
  status: 'active' | 'resolved';
  surfacedDocuments: string[]; // document IDs
  involvedContacts: string[]; // contact IDs
  primaryContactId?: string;
  primaryAssetId?: string;
  insurancePolicyName: string;
  tasks: CrisisTask[];
  timelineEvents: TimelineEvent[];
}

export interface EmergencyScenario {
  id: string;
  name: string;
  emoji: string;
  description: string;
  briefSubtitle: string;
  relevantDocumentIds: string[];
  relevantContactIds: string[];
  relevantAssetIds: string[];
  primaryContactId: string;
  primaryAssetId?: string;
  insurancePolicyName: string;
  priorityTasks: {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    status: CrisisTaskStatus;
    priority: CrisisTaskPriority;
  }[];
}

export interface ReadinessCategory {
  name: 'Documents' | 'Contacts' | 'Emergency Plans' | 'Insurance' | 'Profile';
  score: number;
  detail: string;
}

export interface ReadinessOverview {
  overallScore: number;
  subtitle: string;
  categories: ReadinessCategory[];
  improvements: string[];
}
