export type AppMode = 'dormant' | 'activating' | 'crisis';

export type DocumentCategory = 
  | 'Identity' 
  | 'Medical' 
  | 'Insurance' 
  | 'Vehicle' 
  | 'Property' 
  | 'Legal'
  | 'Other';

export interface UserProfile {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalNotes?: string;
  emergencyDirective?: string;
  primaryLocation?: string;
  hasCompletedOnboarding?: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  userId?: string;
  name: string;
  category: DocumentCategory;
  description: string;
  expiryDate?: string;
  relatedAsset?: string;
  emergencyRelevance: 'Critical' | 'High' | 'Moderate' | 'Low';
  accessLevel?: string;
  uploadDate: string;
  filePath?: string;
  fileSize?: string;
  fileType?: string;
  tags?: string[];
}

// Backwards compatibility alias
export type DocumentItem = Document;

export interface Asset {
  id: string;
  userId?: string;
  name: string;
  type: string;
  registrationOrSerial: string;
  purchaseDate: string;
  estimatedValue: string;
  insurance: string;
  warranty: string;
  description?: string;
  relatedDocuments: string[]; // Document names or IDs
}

// Backwards compatibility alias
export type AssetItem = Asset;

export interface EmergencyContact {
  id: string;
  userId?: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  role: string;
  availability: string;
  verified: boolean;
  primary: boolean;
  medicalProxy: boolean;
  avatar?: string;
}

export interface PlanTask {
  id: string;
  title: string;
  description?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  defaultAssigneeRole?: string;
}

// Backwards compatibility alias
export type DefaultTask = PlanTask;

export interface EmergencyPlan {
  id: string;
  userId?: string;
  name: string;
  emoji: string;
  description: string;
  scenario?: string;
  relevantDocuments: string[]; // document IDs
  relevantAssets: string[]; // asset IDs
  relevantContacts: string[]; // contact IDs
  defaultTasks: PlanTask[];
  sharingRules: string[];
}

export type CrisisTaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type CrisisTaskPriority = 'Critical' | 'High' | 'Medium';

export interface CrisisTask {
  id: string;
  userId?: string;
  title: string;
  description: string;
  assignedTo: string;
  status: CrisisTaskStatus;
  priority: CrisisTaskPriority;
}

export interface TimelineEvent {
  id: string;
  userId?: string;
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

export interface SecureAccess {
  id: string;
  userId?: string;
  recipient: string;
  recipientEmail?: string;
  roleOrPurpose?: string;
  crisisSessionId?: string;
  scenario?: string;
  documents: string[];
  scope?: string[];
  expiration: string;
  expiresAt?: string;
  status: 'Active' | 'Revoked' | 'Expired';
  createdAt: string;
  revokedAt?: string;
}

// Backwards compatibility alias
export type SecureAccessRecord = SecureAccess;

export interface CrisisSession {
  id: string;
  userId?: string;
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
  primaryContactId?: string;
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
  contribution?: string;
  reason?: string;
}

export interface ReadinessOverview {
  overallScore: number;
  subtitle: string;
  categories: ReadinessCategory[];
  improvements: string[];
}
