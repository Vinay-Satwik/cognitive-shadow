/**
 * Cognitive Shadow Context Engine
 * 
 * Core Concept:
 * Transforms the user's information based on context:
 * 12 documents → 3 relevant documents
 * 4 contacts → 2 relevant people
 * 5 emergency plans → 1 active crisis scenario
 * 
 * Produces:
 * - relevantDocuments
 * - relevantAssets
 * - relevantContacts
 * - priorityTasks
 * - emergencyBrief
 * - sharingRules
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
  bloodGroup?: string;
  allergies?: string;
  medicalNotes?: string;
  primaryContact: EmergencyContact | null;
  secondaryContact?: EmergencyContact | null;
  primaryAsset: Asset | null;
  insuranceName: string;
  insurancePolicyName: string;
  criticalDocuments: Document[];
  criticalNotes: string;
  sharingSummary: string;
}

export interface ContextFilterResult {
  relevantDocuments: Document[];
  relevantAssets: Asset[];
  relevantContacts: EmergencyContact[];
  priorityTasks: CrisisTask[];
  emergencyBrief: EmergencyBrief;
  emergencyBriefData: EmergencyBrief; // backward compatibility
  sharingRules: string[];
}

export const contextEngine = {
  /**
   * Filter all stored information contextually for the chosen scenario.
   */
  filter(
    scenarioId: string,
    documents: Document[],
    assets: Asset[],
    contacts: EmergencyContact[],
    plan?: EmergencyPlan,
    profile?: UserProfile
  ): ContextFilterResult {
    const scenarioKey = scenarioId || 'plan-auto-accident';
    const blueprint = crisisScenarios[scenarioKey] || crisisScenarios['plan-auto-accident'];
    const activePlan = plan;

    // --- 1. RESOLVE RELEVANT DOCUMENTS ---
    // Start with plan/blueprint document IDs
    const targetDocIds = activePlan?.relevantDocuments?.length
      ? activePlan.relevantDocuments
      : blueprint.relevantDocumentIds || [];

    let relevantDocuments = documents.filter((doc) => targetDocIds.includes(doc.id));

    // Fallback/heuristic matching to ensure scenario requirements are strictly met
    if (scenarioKey === 'plan-auto-accident') {
      // Must include Vehicle Insurance, Vehicle Registration, Driving License
      const hasVehIns = relevantDocuments.some((d) => d.name.toLowerCase().includes('insurance') && (d.relatedAsset?.toLowerCase().includes('honda') || d.relatedAsset?.toLowerCase().includes('car') || d.category === 'Insurance'));
      const hasVehReg = relevantDocuments.some((d) => d.category === 'Vehicle' || d.name.toLowerCase().includes('registration') || d.name.toLowerCase().includes('rc'));
      const hasLicense = relevantDocuments.some((d) => d.name.toLowerCase().includes('driving') || d.name.toLowerCase().includes('license'));

      if (!hasVehIns) {
        const found = documents.find((d) => d.name.toLowerCase().includes('insurance') && (d.relatedAsset?.toLowerCase().includes('car') || d.relatedAsset?.toLowerCase().includes('honda') || d.category === 'Insurance'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasVehReg) {
        const found = documents.find((d) => d.category === 'Vehicle' || d.name.toLowerCase().includes('registration'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasLicense) {
        const found = documents.find((d) => d.name.toLowerCase().includes('license'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    } else if (scenarioKey === 'plan-medical-emergency') {
      // Health Insurance, Medical Summary, Identity doc
      const hasHealthIns = relevantDocuments.some((d) => d.name.toLowerCase().includes('health') || d.category === 'Insurance');
      const hasMedSum = relevantDocuments.some((d) => d.category === 'Medical' || d.name.toLowerCase().includes('medical'));
      const hasId = relevantDocuments.some((d) => d.category === 'Identity' || d.name.toLowerCase().includes('passport') || d.name.toLowerCase().includes('license'));

      if (!hasHealthIns) {
        const found = documents.find((d) => d.name.toLowerCase().includes('health'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasMedSum) {
        const found = documents.find((d) => d.category === 'Medical');
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasId) {
        const found = documents.find((d) => d.category === 'Identity');
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    } else if (scenarioKey === 'plan-home-emergency') {
      // Property Document, Home Insurance, Identity document
      const hasPropDoc = relevantDocuments.some((d) => d.category === 'Property' || d.name.toLowerCase().includes('deed') || d.name.toLowerCase().includes('property'));
      const hasHomeIns = relevantDocuments.some((d) => d.name.toLowerCase().includes('home') || d.relatedAsset?.toLowerCase().includes('apartment'));
      const hasId = relevantDocuments.some((d) => d.category === 'Identity');

      if (!hasPropDoc) {
        const found = documents.find((d) => d.category === 'Property' || d.name.toLowerCase().includes('deed'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasHomeIns) {
        const found = documents.find((d) => d.name.toLowerCase().includes('home') || d.relatedAsset?.toLowerCase().includes('apartment'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasId) {
        const found = documents.find((d) => d.category === 'Identity');
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    } else if (scenarioKey === 'plan-travel-emergency') {
      // Passport, Health Insurance, Travel Insurance (or related)
      const hasPassport = relevantDocuments.some((d) => d.name.toLowerCase().includes('passport'));
      const hasHealthIns = relevantDocuments.some((d) => d.name.toLowerCase().includes('health') || d.category === 'Insurance');

      if (!hasPassport) {
        const found = documents.find((d) => d.name.toLowerCase().includes('passport'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasHealthIns) {
        const found = documents.find((d) => d.name.toLowerCase().includes('health') || d.category === 'Insurance');
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    } else if (scenarioKey === 'plan-identity-loss') {
      // Passport, Driving License, Identity doc
      const hasLicense = relevantDocuments.some((d) => d.name.toLowerCase().includes('license'));
      const hasPassport = relevantDocuments.some((d) => d.name.toLowerCase().includes('passport'));

      if (!hasLicense) {
        const found = documents.find((d) => d.name.toLowerCase().includes('license'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasPassport) {
        const found = documents.find((d) => d.name.toLowerCase().includes('passport'));
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    }

    // --- 2. RESOLVE RELEVANT ASSETS ---
    let targetAssetIds = activePlan?.relevantAssets?.length
      ? activePlan.relevantAssets
      : blueprint.relevantAssetIds || [];

    let relevantAssets = assets.filter((a) => targetAssetIds.includes(a.id));

    if (scenarioKey === 'plan-auto-accident' && relevantAssets.length === 0) {
      const car = assets.find((a) => a.type.toLowerCase().includes('vehicle') || a.name.toLowerCase().includes('car') || a.name.toLowerCase().includes('honda'));
      if (car) relevantAssets = [car];
    } else if (scenarioKey === 'plan-home-emergency' && relevantAssets.length === 0) {
      const home = assets.find((a) => a.type.toLowerCase().includes('real estate') || a.name.toLowerCase().includes('apartment') || a.name.toLowerCase().includes('home'));
      if (home) relevantAssets = [home];
    } else if ((scenarioKey === 'plan-identity-loss' || scenarioKey === 'plan-travel-emergency') && relevantAssets.length === 0) {
      const device = assets.find((a) => a.name.toLowerCase().includes('iphone') || a.type.toLowerCase().includes('device'));
      if (device) relevantAssets = [device];
    }

    // --- 3. RESOLVE RELEVANT CONTACTS ---
    const targetContactIds = activePlan?.relevantContacts?.length
      ? activePlan.relevantContacts
      : blueprint.relevantContactIds || [];

    let relevantContacts = contacts.filter((c) => targetContactIds.includes(c.id));

    // Ensure primary proxy is always present
    const primaryContact = contacts.find((c) => c.primary) || contacts[0] || null;
    if (primaryContact && !relevantContacts.some((c) => c.id === primaryContact.id)) {
      relevantContacts = [primaryContact, ...relevantContacts];
    }

    // Scenario-specific contact guarantees
    if (scenarioKey === 'plan-medical-emergency') {
      const doctor = contacts.find((c) => c.medicalProxy || c.role.toLowerCase().includes('medical') || c.name.toLowerCase().includes('dr'));
      if (doctor && !relevantContacts.some((c) => c.id === doctor.id)) {
        relevantContacts.push(doctor);
      }
    } else if (scenarioKey === 'plan-auto-accident' || scenarioKey === 'plan-travel-emergency' || scenarioKey === 'plan-home-emergency') {
      const familySupport = contacts.find((c) => !c.primary && (c.relationship.toLowerCase().includes('sister') || c.role.toLowerCase().includes('family') || c.role.toLowerCase().includes('alternate')));
      if (familySupport && !relevantContacts.some((c) => c.id === familySupport.id)) {
        relevantContacts.push(familySupport);
      }
    }

    // --- 4. RESOLVE PRIORITY TASKS ---
    let priorityTasks: CrisisTask[] = [];

    if (activePlan?.defaultTasks && activePlan.defaultTasks.length > 0) {
      priorityTasks = activePlan.defaultTasks.map((t, idx) => ({
        id: t.id || `task-${scenarioKey}-${idx + 1}`,
        title: t.title,
        description: t.description || `Pre-assigned to ${t.defaultAssigneeRole || primaryContact?.name || 'Primary Proxy'}.`,
        assignedTo: t.defaultAssigneeRole || (relevantContacts[idx % relevantContacts.length]?.name || primaryContact?.name || 'Primary Proxy'),
        status: 'Pending',
        priority: t.priority === 'Critical' ? 'Critical' : t.priority === 'Low' ? 'Medium' : 'High'
      }));
    } else if (blueprint.priorityTasks && blueprint.priorityTasks.length > 0) {
      priorityTasks = blueprint.priorityTasks.map((task) => ({
        ...task,
        status: 'Pending'
      }));
    } else {
      // Fallback default tasks
      priorityTasks = [
        {
          id: `tsk-${Date.now()}-1`,
          title: 'Notify primary emergency contact',
          description: `Coordinate with ${primaryContact?.name || 'designated proxy'} immediately.`,
          assignedTo: primaryContact?.name || 'Primary Proxy',
          status: 'Pending',
          priority: 'Critical'
        },
        {
          id: `tsk-${Date.now()}-2`,
          title: 'Prepare critical emergency documents',
          description: 'Access digital records in Shadow Vault and verify identity details.',
          assignedTo: 'Alex Morgan',
          status: 'Pending',
          priority: 'High'
        }
      ];
    }

    // --- 5. BUILD SCENARIO EMERGENCY BRIEF ---
    const primaryAsset = relevantAssets[0] || null;
    const secondaryContact = relevantContacts.find((c) => c.id !== primaryContact?.id) || null;

    let insuranceName = blueprint.insurancePolicyName || 'Policy on file';
    if (scenarioKey === 'plan-auto-accident') {
      const carIns = relevantDocuments.find((d) => d.category === 'Insurance' && (d.relatedAsset?.toLowerCase().includes('car') || d.relatedAsset?.toLowerCase().includes('honda')));
      if (carIns) insuranceName = `${carIns.name} (National Insurance #488102)`;
    } else if (scenarioKey === 'plan-medical-emergency') {
      const healthIns = relevantDocuments.find((d) => d.name.toLowerCase().includes('health'));
      if (healthIns) insuranceName = `${healthIns.name} (Cashless TPA #HLT-99214)`;
    } else if (scenarioKey === 'plan-home-emergency') {
      const homeIns = relevantDocuments.find((d) => d.name.toLowerCase().includes('home'));
      if (homeIns) insuranceName = `${homeIns.name} (Policy #HOM-9901)`;
    } else if (scenarioKey === 'plan-travel-emergency') {
      insuranceName = 'International Travel & Medical Insurance (#TRV-8812)';
    } else if (scenarioKey === 'plan-identity-loss') {
      insuranceName = 'AppleCare+ Theft & Loss / Identity Shield';
    }

    const criticalDocuments = relevantDocuments.filter(
      (d) => d.emergencyRelevance === 'Critical' || d.category === 'Identity' || d.category === 'Medical' || d.category === 'Insurance'
    );

    const sharingRules = activePlan?.sharingRules && activePlan.sharingRules.length > 0
      ? activePlan.sharingRules
      : [
          'Grant temporary 24-hour access tokens only to verified responder personnel',
          'Expire all shared document links immediately upon crisis resolution'
        ];

    const emergencyBrief: EmergencyBrief = {
      scenarioId: scenarioKey,
      incident: activePlan?.name || blueprint.name,
      incidentEmoji: activePlan?.emoji || blueprint.emoji,
      scenarioName: activePlan?.name || blueprint.name,
      scenarioEmoji: activePlan?.emoji || blueprint.emoji,
      subtitle: blueprint.briefSubtitle || activePlan?.description || 'Emergency Standby Protocol',
      person: profile?.name || 'Alex Morgan',
      bloodGroup: profile?.bloodGroup || 'O+ (Universal Donor)',
      allergies: profile?.allergies || 'Penicillin, Cephalosporins',
      medicalNotes: profile?.medicalNotes || 'Advance directive on file with medical proxy.',
      primaryContact,
      secondaryContact,
      primaryAsset,
      insuranceName,
      insurancePolicyName: insuranceName,
      criticalDocuments: criticalDocuments.length > 0 ? criticalDocuments : relevantDocuments,
      criticalNotes: `${activePlan?.name || blueprint.name} response protocol active. Handover records only through verified temporary links.`,
      sharingSummary: `${relevantDocuments.length} documents and ${relevantContacts.length} contacts surfaced.`
    };

    return {
      relevantDocuments,
      relevantAssets,
      relevantContacts,
      priorityTasks,
      emergencyBrief,
      emergencyBriefData: emergencyBrief,
      sharingRules
    };
  }
};
