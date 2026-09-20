/**
 * Cognitive Shadow Central Context Engine
 * 
 * CORE ARCHITECTURE:
 * User Data (Profile, Vault Documents, Assets, Emergency Contacts, Emergency Plans)
 * +
 * Selected Crisis Scenario
 * ↓
 * Context Engine
 * ↓
 * - Relevant Documents (scenario-scoped)
 * - Relevant Assets (scenario-scoped)
 * - Relevant Contacts (prioritized by proxy & role)
 * - Priority Tasks (actionable, dynamic)
 * - Emergency Brief (factual, zero hallucination)
 * - Sharing Rules (structured for secure access)
 * 
 * ZERO MOCK DATA: Operates strictly on authentic user-owned data.
 */

import {
  Document,
  Asset,
  EmergencyContact,
  EmergencyPlan,
  CrisisTask,
  UserProfile
} from '../types';
import { crisisScenarios } from '../data/crisisScenarios';

export interface EmergencyBrief {
  scenarioId: string;
  incident: string;
  incidentEmoji: string;
  scenarioName: string;
  scenarioEmoji: string;
  subtitle: string;
  person: string;
  bloodGroup: string;
  allergies: string;
  medicalNotes: string;
  emergencyDirective: string;
  primaryContact: EmergencyContact | null;
  secondaryContact: EmergencyContact | null;
  primaryAsset: Asset | null;
  insuranceName: string;
  insurancePolicyName: string;
  criticalDocuments: Document[];
  criticalNotes: string;
  sharingSummary: string;
}

export interface StructuredSharingRules {
  allowed: boolean;
  relevantDocuments: Document[];
  relevantContacts: EmergencyContact[];
}

export interface CrisisContextResult {
  scenario: {
    id: string;
    name: string;
    emoji: string;
    subtitle: string;
  };
  emergencyBrief: EmergencyBrief;
  emergencyBriefData: EmergencyBrief; // Backward compatibility
  relevantDocuments: Document[];
  relevantAssets: Asset[];
  relevantContacts: EmergencyContact[];
  priorityTasks: CrisisTask[];
  sharingRules: StructuredSharingRules;
  sharingRulesList: string[]; // Backward compatibility
}

export interface GenerateCrisisContextParams {
  userId?: string;
  scenario?: string; // Scenario ID or Name
  profile?: UserProfile | null;
  documents?: Document[];
  assets?: Asset[];
  emergencyContacts?: EmergencyContact[];
  emergencyPlans?: EmergencyPlan[];
}

/**
 * Normalizes scenario identifiers into canonical IDs
 */
export function normalizeScenarioId(scenario?: string): string {
  if (!scenario) return 'plan-auto-accident';
  const lower = scenario.toLowerCase().trim();
  if (lower.includes('auto') || lower.includes('car') || lower.includes('accident') || lower.includes('vehicle')) {
    return 'plan-auto-accident';
  }
  if (lower.includes('medic') || lower.includes('hospital') || lower.includes('health') || lower.includes('critical')) {
    return 'plan-medical-emergency';
  }
  if (lower.includes('home') || lower.includes('property') || lower.includes('house') || lower.includes('estate')) {
    return 'plan-home-emergency';
  }
  if (lower.includes('travel') || lower.includes('trip') || lower.includes('flight') || lower.includes('abroad')) {
    return 'plan-travel-emergency';
  }
  if (lower.includes('identity') || lower.includes('document') || lower.includes('loss') || lower.includes('theft') || lower.includes('fraud')) {
    return 'plan-identity-loss';
  }
  return 'plan-auto-accident';
}

/**
 * Evaluates semantic relevance for Major Automobile Accident.
 * Prioritizes:
 * - vehicle insurance, auto insurance, car insurance, motor insurance, vehicle policy
 * - vehicle registration, rc, title, vin
 * - driving licence, driver's licence, driver license
 * - vehicle-related legal documents or documents linked to a vehicle asset
 * Excludes generic insurance documents (such as Health Insurance Card & Advance Directive).
 */
export function isAutomobileRelevant(doc: Document): boolean {
  const name = (doc.name || '').toLowerCase();
  const cat = (doc.category || '').toLowerCase();
  const desc = (doc.description || '').toLowerCase();
  const related = (doc.relatedAsset || '').toLowerCase();

  const hasHealthSignal = name.includes('health') || name.includes('medical') || name.includes('advance directive') || name.includes('living will') || name.includes('doctor') || name.includes('hospital');
  const hasHomeSignal = name.includes('homeowner') || name.includes('property deed') || name.includes('apartment deed');

  // Exact automobile/vehicle positive signals
  const autoKeywords = [
    'vehicle insurance', 'auto insurance', 'car insurance', 'motor insurance', 'vehicle policy',
    'automobile insurance', 'motorcycle insurance',
    'vehicle registration', 'registration certificate', 'rc book', 'rc copy', 'vehicle title', 'car title',
    'driving licence', "driver's licence", "driver licence", 'driver license', 'driving license', "drivers license",
    'puc', 'pollution certificate', 'roadside assistance', 'vehicle lease', 'auto loan', 'bill of sale'
  ];

  if (autoKeywords.some((kw) => name.includes(kw) || desc.includes(kw))) {
    return true;
  }

  // Check related asset
  if (related.length > 0) {
    const vehicleAssetTerms = ['car', 'vehicle', 'auto', 'motor', 'bike', 'truck', 'suv', 'sedan', 'honda', 'toyota', 'tesla', 'ford', 'bmw', 'audi', 'hyundai', 'chevrolet'];
    if (vehicleAssetTerms.some((term) => related.includes(term))) {
      return true;
    }
  }

  // Category is vehicle
  if (cat === 'vehicle') {
    return true;
  }

  // Registration & Title (excluding property)
  if ((name.includes('registration') || name.includes('title') || name.includes('rc') || name.includes('vin')) && !hasHomeSignal && !hasHealthSignal) {
    return true;
  }

  // Driving license
  if ((name.includes('driver') || name.includes('driving')) && !hasHealthSignal) {
    return true;
  }

  // Insurance category: MUST have explicit auto terms and NOT health/home terms
  if (cat === 'insurance' || name.includes('insurance')) {
    const hasVehicleTerm = name.includes('vehicle') || name.includes('auto') || name.includes('car') || name.includes('motor') || desc.includes('vehicle') || desc.includes('auto') || desc.includes('car') || desc.includes('motor');
    if (hasVehicleTerm && !hasHealthSignal && !hasHomeSignal) {
      return true;
    }
  }

  return false;
}

export function isMedicalRelevant(doc: Document): boolean {
  const name = (doc.name || '').toLowerCase();
  const cat = (doc.category || '').toLowerCase();
  const desc = (doc.description || '').toLowerCase();

  const medKeywords = [
    'health insurance', 'medical insurance', 'mediclaim', 'tpa', 'cashless',
    'medical summary', 'medical record', 'medical history', 'allergy', 'allergies',
    'prescription', 'advance directive', 'medical directive', 'living will',
    'medical proxy', 'hospital', 'doctor', 'physician', 'immunization', 'vaccine'
  ];

  if (medKeywords.some((kw) => name.includes(kw) || desc.includes(kw))) {
    return true;
  }

  if (cat === 'medical') {
    return true;
  }

  if (cat === 'insurance' || name.includes('insurance')) {
    if (name.includes('health') || name.includes('medical') || name.includes('mediclaim') || name.includes('tpa') || name.includes('care')) {
      return true;
    }
    // Generic insurance without auto/home/property
    if (!name.includes('vehicle') && !name.includes('auto') && !name.includes('car') && !name.includes('motor') && !name.includes('home') && !name.includes('property')) {
      return true;
    }
  }

  if (cat === 'legal' && (name.includes('directive') || name.includes('will') || name.includes('proxy') || name.includes('power of attorney'))) {
    return true;
  }

  return false;
}

export function isHomePropertyRelevant(doc: Document): boolean {
  const name = (doc.name || '').toLowerCase();
  const cat = (doc.category || '').toLowerCase();
  const desc = (doc.description || '').toLowerCase();
  const related = (doc.relatedAsset || '').toLowerCase();

  const homeKeywords = [
    'homeowners insurance', 'home insurance', 'property insurance', 'hazard insurance',
    'renters insurance', 'flood insurance', 'property deed', 'house deed', 'apartment deed',
    'title deed', 'lease agreement', 'lease', 'mortgage', 'society', 'building'
  ];
  if (homeKeywords.some((kw) => name.includes(kw) || desc.includes(kw))) return true;
  if (cat === 'property') return true;
  if (related.includes('home') || related.includes('apartment') || related.includes('house') || related.includes('property')) return true;
  if ((cat === 'insurance' || name.includes('insurance')) && (name.includes('home') || name.includes('property') || name.includes('renter') || name.includes('hazard') || name.includes('flood'))) return true;
  return false;
}

export function isTravelRelevant(doc: Document): boolean {
  const name = (doc.name || '').toLowerCase();
  const cat = (doc.category || '').toLowerCase();
  const desc = (doc.description || '').toLowerCase();

  const travelKeywords = [
    'passport', 'visa', 'travel insurance', 'flight', 'ticket', 'boarding pass',
    'international health', 'travel certificate', 'itinerary', 'consular'
  ];
  if (travelKeywords.some((kw) => name.includes(kw) || desc.includes(kw))) return true;
  if ((cat === 'identity' || cat === 'travel') && (name.includes('passport') || name.includes('visa') || name.includes('travel'))) return true;
  if ((cat === 'insurance' || name.includes('insurance')) && (name.includes('travel') || name.includes('international') || name.includes('overseas') || name.includes('global'))) return true;
  return false;
}

export function isIdentityRelevant(doc: Document): boolean {
  const name = (doc.name || '').toLowerCase();
  const cat = (doc.category || '').toLowerCase();
  const desc = (doc.description || '').toLowerCase();

  const idKeywords = [
    'passport', 'driver', 'driving licence', 'driver license', 'national id',
    'social security', 'ssn', 'aadhaar', 'pan card', 'birth certificate',
    'id card', 'identity card', 'voter id', 'citizenship'
  ];
  if (idKeywords.some((kw) => name.includes(kw) || desc.includes(kw))) return true;
  if (cat === 'identity') return true;
  return false;
}

export function getScenarioDocFilter(scenarioId: string): (doc: Document) => boolean {
  if (scenarioId === 'plan-auto-accident') return isAutomobileRelevant;
  if (scenarioId === 'plan-medical-emergency') return isMedicalRelevant;
  if (scenarioId === 'plan-home-emergency') return isHomePropertyRelevant;
  if (scenarioId === 'plan-travel-emergency') return isTravelRelevant;
  return isIdentityRelevant;
}

/**
 * Main Context Engine: Generates deterministic, user-isolated crisis context.
 */
export function generateCrisisContext(params: GenerateCrisisContextParams): CrisisContextResult {
  const {
    userId,
    scenario,
    profile,
    documents = [],
    assets = [],
    emergencyContacts = [],
    emergencyPlans = []
  } = params;

  const scenarioId = normalizeScenarioId(scenario);
  const blueprint = crisisScenarios[scenarioId] || crisisScenarios['plan-auto-accident'];

  // Match the user's configured emergency plan for this scenario
  const userPlan = emergencyPlans.find(
    (p) => p.id === scenarioId || normalizeScenarioId(p.name) === scenarioId
  );

  const scenarioMeta = {
    id: scenarioId,
    name: userPlan?.name || blueprint.name,
    emoji: userPlan?.emoji || blueprint.emoji,
    subtitle: blueprint.briefSubtitle || userPlan?.description || 'Emergency Standby Protocol'
  };

  // =========================================================================
  // 1. RELEVANT DOCUMENTS FILTERING
  // =========================================================================
  // Deterministic scenario relevance applied to user's real documents.
  // Documents must match the scenario's strict relevance rules.
  const docFilter = getScenarioDocFilter(scenarioId);
  const finalDocuments = documents.filter(docFilter);

  // =========================================================================
  // 2. RELEVANT ASSETS FILTERING
  // =========================================================================
  let relevantAssets: Asset[] = [];

  if (userPlan?.relevantAssets && userPlan.relevantAssets.length > 0) {
    relevantAssets = assets.filter((a) => userPlan.relevantAssets.includes(a.id));
  }

  if (scenarioId === 'plan-auto-accident') {
    const vehicleAssets = assets.filter((a) => {
      const type = a.type?.toLowerCase() || '';
      const name = a.name?.toLowerCase() || '';
      return type.includes('vehicle') || type.includes('car') || type.includes('auto') ||
             name.includes('car') || name.includes('sedan') || name.includes('suv') ||
             name.includes('truck') || name.includes('motorcycle') || name.includes('vehicle');
    });
    for (const a of vehicleAssets) {
      if (!relevantAssets.some((item) => item.id === a.id)) relevantAssets.push(a);
    }
  } else if (scenarioId === 'plan-home-emergency') {
    const propertyAssets = assets.filter((a) => {
      const type = a.type?.toLowerCase() || '';
      const name = a.name?.toLowerCase() || '';
      return type.includes('real estate') || type.includes('property') || type.includes('home') ||
             name.includes('home') || name.includes('apartment') || name.includes('house') ||
             name.includes('condo') || name.includes('residence') || name.includes('flat');
    });
    for (const a of propertyAssets) {
      if (!relevantAssets.some((item) => item.id === a.id)) relevantAssets.push(a);
    }
  } else if (scenarioId === 'plan-identity-loss' || scenarioId === 'plan-travel-emergency') {
    const deviceAssets = assets.filter((a) => {
      const type = a.type?.toLowerCase() || '';
      const name = a.name?.toLowerCase() || '';
      return type.includes('hardware') || type.includes('device') || type.includes('electronics') ||
             name.includes('phone') || name.includes('iphone') || name.includes('laptop') ||
             name.includes('macbook') || name.includes('wallet');
    });
    for (const a of deviceAssets) {
      if (!relevantAssets.some((item) => item.id === a.id)) relevantAssets.push(a);
    }
  }
  // Medical emergency does not filter irrelevant physical assets

  // =========================================================================
  // 3. RELEVANT CONTACTS FILTERING & PRIORITIZATION
  // =========================================================================
  let relevantContacts: EmergencyContact[] = [];

  // Match explicitly selected contacts on the plan if present
  if (userPlan?.relevantContacts && userPlan.relevantContacts.length > 0) {
    relevantContacts = emergencyContacts.filter((c) => userPlan.relevantContacts.includes(c.id));
  }

  // Ensure primary contact is prioritized at index 0
  const primaryContact = emergencyContacts.find((c) => c.primary) || emergencyContacts[0] || null;
  if (primaryContact && !relevantContacts.some((c) => c.id === primaryContact.id)) {
    relevantContacts.unshift(primaryContact);
  }

  // Scenario-specific contact prioritization
  if (scenarioId === 'plan-medical-emergency') {
    const medicalProxy = emergencyContacts.find(
      (c) => c.medicalProxy || c.role?.toLowerCase().includes('medical') || c.role?.toLowerCase().includes('doctor')
    );
    if (medicalProxy && !relevantContacts.some((c) => c.id === medicalProxy.id)) {
      relevantContacts.push(medicalProxy);
    }
  }

  // Add secondary contacts if available
  const secondaryContacts = emergencyContacts.filter((c) => c.id !== primaryContact?.id);
  for (const sec of secondaryContacts) {
    if (!relevantContacts.some((c) => c.id === sec.id)) {
      relevantContacts.push(sec);
    }
  }

  const secondaryContact = relevantContacts.find((c) => c.id !== primaryContact?.id) || null;
  const effectiveUserName = profile?.name || 'Account Holder';

  // Helper to resolve task assignee strictly from authentic emergency contacts
  const resolveTaskAssignee = (roleHint?: string, idx: number = 0): string => {
    if (relevantContacts.length === 0) {
      return 'Primary emergency contact (not configured)';
    }

    const hint = (roleHint || '').toLowerCase();
    if (hint.includes('med') || hint.includes('doc') || hint.includes('physician') || hint.includes('health')) {
      const medProxy = relevantContacts.find((c) => c.medicalProxy || c.role?.toLowerCase().includes('med') || c.role?.toLowerCase().includes('doc'));
      return medProxy ? medProxy.name : (primaryContact?.name || relevantContacts[0].name);
    }

    if (hint.includes('sec') || hint.includes('alt') || hint.includes('second')) {
      return secondaryContact ? secondaryContact.name : (primaryContact?.name || relevantContacts[0].name);
    }

    // Default to primary contact or round-robin among authentic contacts
    return primaryContact ? primaryContact.name : relevantContacts[idx % relevantContacts.length].name;
  };

  const sanitizeTaskText = (text: string): string => {
    const contactName = relevantContacts[0]?.name;
    const fallbackText = contactName || 'emergency contact';
    return text
      .replace(/Rahul Morgan/gi, fallbackText)
      .replace(/Rahul/gi, fallbackText)
      .replace(/Priya Morgan/gi, relevantContacts[1]?.name || fallbackText)
      .replace(/Priya/gi, relevantContacts[1]?.name || fallbackText)
      .replace(/Dr\. Mehta/gi, 'attending physician')
      .replace(/Maya Vance/gi, 'building management')
      .replace(/Maya/gi, 'building management');
  };

  // =========================================================================
  // 4. PRIORITY TASKS RESOLUTION
  // =========================================================================
  let priorityTasks: CrisisTask[] = [];

  if (userPlan?.defaultTasks && userPlan.defaultTasks.length > 0) {
    // Use user-configured plan tasks with authentic contact assignment
    priorityTasks = userPlan.defaultTasks.map((t, idx) => ({
      id: t.id || `task-${scenarioId}-${idx + 1}`,
      userId: userId || profile?.userId || profile?.id,
      title: sanitizeTaskText(t.title),
      description: sanitizeTaskText(t.description || t.title),
      assignedTo: resolveTaskAssignee(t.defaultAssigneeRole, idx),
      status: 'Pending',
      priority: t.priority === 'Critical' ? 'Critical' : t.priority === 'Low' ? 'Medium' : 'High'
    }));
  } else {
    // Generate deterministic scenario tasks scoped strictly to authentic contacts
    if (scenarioId === 'plan-auto-accident') {
      priorityTasks = [
        {
          id: `tsk-auto-1`,
          userId: userId || profile?.id,
          title: 'Review insurance policy & claim helpline',
          description: relevantContacts.length > 0
            ? `Access vehicle insurance record from vault and coordinate claims notice with ${primaryContact?.name}.`
            : 'Access vehicle insurance record from vault and review emergency claim details.',
          assignedTo: resolveTaskAssignee('Primary Proxy', 0),
          status: 'Pending',
          priority: 'Critical'
        },
        {
          id: `tsk-auto-2`,
          userId: userId || profile?.id,
          title: 'Surface vehicle registration and driver credentials',
          description: 'Ensure digital copy of registration and driver license is available for emergency responders.',
          assignedTo: effectiveUserName,
          status: 'Pending',
          priority: 'High'
        },
        {
          id: `tsk-auto-3`,
          userId: userId || profile?.id,
          title: 'Coordinate responder check-in',
          description: relevantContacts.length > 0
            ? `Notify ${primaryContact?.name} regarding physical location and incident status.`
            : 'Notify immediate proxy once contact configuration is active.',
          assignedTo: resolveTaskAssignee('Primary Proxy', 1),
          status: 'Pending',
          priority: 'High'
        }
      ];
    } else if (scenarioId === 'plan-medical-emergency') {
      priorityTasks = [
        {
          id: `tsk-med-1`,
          userId: userId || profile?.id,
          title: 'Provide medical constraints & allergies to attending team',
          description: `Allergies: ${profile?.allergies || 'None declared'}. Blood Group: ${profile?.bloodGroup || 'Not specified'}.`,
          assignedTo: resolveTaskAssignee('Medical Proxy', 0),
          status: 'Pending',
          priority: 'Critical'
        },
        {
          id: `tsk-med-2`,
          userId: userId || profile?.id,
          title: 'Authorize medical proxy protocol',
          description: relevantContacts.length > 0
            ? `Designated emergency proxy ${primaryContact?.name} authorized to communicate with hospital staff.`
            : 'Authorize hospital communication once emergency proxy is configured.',
          assignedTo: resolveTaskAssignee('Primary Proxy', 1),
          status: 'Pending',
          priority: 'Critical'
        },
        {
          id: `tsk-med-3`,
          userId: userId || profile?.id,
          title: 'Verify health insurance pre-authorization',
          description: 'Locate health policy in Shadow Vault for hospital admission authorization.',
          assignedTo: effectiveUserName,
          status: 'Pending',
          priority: 'High'
        }
      ];
    } else if (scenarioId === 'plan-home-emergency') {
      priorityTasks = [
        {
          id: `tsk-home-1`,
          userId: userId || profile?.id,
          title: 'Assess property perimeter & document damage',
          description: 'Take timestamped photos and reference property deed policy details.',
          assignedTo: effectiveUserName,
          status: 'Pending',
          priority: 'Critical'
        },
        {
          id: `tsk-home-2`,
          userId: userId || profile?.id,
          title: 'Initiate homeowner insurance claim',
          description: 'Reference policy record in Shadow Vault and report incident damage.',
          assignedTo: resolveTaskAssignee('Primary Proxy', 0),
          status: 'Pending',
          priority: 'High'
        },
        {
          id: `tsk-home-3`,
          userId: userId || profile?.id,
          title: 'Coordinate temporary relocation or contractor support',
          description: relevantContacts.length > 0
            ? `Liaise with ${primaryContact?.name} on temporary accommodation or utility shutdown.`
            : 'Arrange safe temporary accommodation or utility shutdown.',
          assignedTo: resolveTaskAssignee('Secondary Responder', 1),
          status: 'Pending',
          priority: 'Medium'
        }
      ];
    } else if (scenarioId === 'plan-travel-emergency') {
      priorityTasks = [
        {
          id: `tsk-trv-1`,
          userId: userId || profile?.id,
          title: 'Access digital passport & visa copies',
          description: 'Keep verified travel identification ready for consular or carrier verification.',
          assignedTo: effectiveUserName,
          status: 'Pending',
          priority: 'Critical'
        },
        {
          id: `tsk-trv-2`,
          userId: userId || profile?.id,
          title: 'Contact travel assistance & insurance provider',
          description: 'Access overseas coverage documentation and file emergency notice.',
          assignedTo: resolveTaskAssignee('Primary Proxy', 0),
          status: 'Pending',
          priority: 'High'
        },
        {
          id: `tsk-trv-3`,
          userId: userId || profile?.id,
          title: 'Notify designated emergency contact of transit location',
          description: relevantContacts.length > 0
            ? `Send current GPS / hotel coordinates to ${primaryContact?.name}.`
            : 'Broadcast current coordinates to family once emergency contact is configured.',
          assignedTo: effectiveUserName,
          status: 'Pending',
          priority: 'Medium'
        }
      ];
    } else if (scenarioId === 'plan-identity-loss') {
      priorityTasks = [
        {
          id: `tsk-id-1`,
          userId: userId || profile?.id,
          title: 'Freeze compromised accounts & cards',
          description: 'Contact financial institutions and request immediate security lock.',
          assignedTo: effectiveUserName,
          status: 'Pending',
          priority: 'Critical'
        },
        {
          id: `tsk-id-2`,
          userId: userId || profile?.id,
          title: 'File official identity theft / loss report',
          description: 'Retrieve national ID / passport copies from vault to file formal report.',
          assignedTo: effectiveUserName,
          status: 'Pending',
          priority: 'High'
        },
        {
          id: `tsk-id-3`,
          userId: userId || profile?.id,
          title: 'Notify designated security proxy',
          description: relevantContacts.length > 0
            ? `Alert ${primaryContact?.name} to monitor secondary communication channels.`
            : 'Prepare notification for designated security proxy.',
          assignedTo: resolveTaskAssignee('Primary Proxy', 0),
          status: 'Pending',
          priority: 'Medium'
        }
      ];
    }
  }

  // =========================================================================
  // 5. EMERGENCY BRIEF GENERATION (FACTUAL & OBJECTIVE)
  // =========================================================================
  const primaryAsset = relevantAssets[0] || null;

  // Resolve insurance identifier objectively from primary asset or scenario-relevant documents
  let resolvedInsurance = 'No policy on record';
  if (primaryAsset?.insurance && primaryAsset.insurance.trim()) {
    resolvedInsurance = primaryAsset.insurance.trim();
  } else {
    const insDoc = finalDocuments.find(
      (d) => d.category?.toLowerCase() === 'insurance' || d.name.toLowerCase().includes('insurance') || d.name.toLowerCase().includes('policy')
    );
    if (insDoc) {
      resolvedInsurance = insDoc.name;
    }
  }

  const criticalDocuments = finalDocuments.filter(
    (d) => d.emergencyRelevance === 'Critical' ||
           d.category?.toLowerCase() === 'identity' ||
           d.category?.toLowerCase() === 'medical' ||
           d.category?.toLowerCase() === 'insurance'
  );

  const emergencyBrief: EmergencyBrief = {
    scenarioId,
    incident: scenarioMeta.name,
    incidentEmoji: scenarioMeta.emoji,
    scenarioName: scenarioMeta.name,
    scenarioEmoji: scenarioMeta.emoji,
    subtitle: scenarioMeta.subtitle,
    person: effectiveUserName,
    bloodGroup: profile?.bloodGroup?.trim() || 'Not specified',
    allergies: profile?.allergies?.trim() || 'None declared',
    medicalNotes: profile?.medicalNotes?.trim() || 'No medical notes on record',
    emergencyDirective: profile?.emergencyDirective?.trim() || (
      primaryContact ? `In case of incapacitation, coordinate with ${primaryContact.name}.` : 'No emergency directive on file'
    ),
    primaryContact,
    secondaryContact,
    primaryAsset,
    insuranceName: resolvedInsurance,
    insurancePolicyName: resolvedInsurance,
    criticalDocuments: criticalDocuments.length > 0 ? criticalDocuments : finalDocuments,
    criticalNotes: `${scenarioMeta.name} engaged. Cognitive Shadow filtered ${finalDocuments.length} relevant documents and ${relevantContacts.length} emergency contacts for response coordination.`,
    sharingSummary: `${finalDocuments.length} documents and ${relevantContacts.length} contacts surfaced.`
  };

  // =========================================================================
  // 6. SHARING RULES (STRUCTURED FOR SECURE ACCESS)
  // =========================================================================
  const sharingRules: StructuredSharingRules = {
    allowed: Boolean(finalDocuments.length > 0 || relevantContacts.length > 0),
    relevantDocuments: finalDocuments,
    relevantContacts
  };

  const sharingRulesList = userPlan?.sharingRules && userPlan.sharingRules.length > 0
    ? userPlan.sharingRules
    : [
        'Grant temporary 24-hour access tokens only to verified responder personnel',
        'Expire all shared document links immediately upon crisis resolution'
      ];

  return {
    scenario: scenarioMeta,
    emergencyBrief,
    emergencyBriefData: emergencyBrief,
    relevantDocuments: finalDocuments,
    relevantAssets,
    relevantContacts,
    priorityTasks,
    sharingRules,
    sharingRulesList
  };
}

/**
 * Backward compatibility wrapper matching the existing contextEngine.filter API
 */
export const contextEngine = {
  filter(
    scenarioId: string,
    documents: Document[],
    assets: Asset[],
    contacts: EmergencyContact[],
    plan?: EmergencyPlan,
    profile?: UserProfile
  ): CrisisContextResult {
    return generateCrisisContext({
      scenario: scenarioId,
      documents,
      assets,
      emergencyContacts: contacts,
      emergencyPlans: plan ? [plan] : [],
      profile
    });
  },
  generateCrisisContext
};
