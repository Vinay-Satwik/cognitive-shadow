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
      const hasVehIns = relevantDocuments.some((d) => 
        (d.category === 'Insurance' || d.name.toLowerCase().includes('insurance')) &&
        (d.category === 'Vehicle' || d.name.toLowerCase().includes('vehicle') || d.name.toLowerCase().includes('auto') || d.name.toLowerCase().includes('car') || !!d.relatedAsset)
      );
      const hasVehReg = relevantDocuments.some((d) => 
        d.category === 'Vehicle' || d.name.toLowerCase().includes('registration') || d.name.toLowerCase().includes('rc')
      );
      const hasLicense = relevantDocuments.some((d) => 
        d.name.toLowerCase().includes('license') || d.category === 'Identity'
      );

      if (!hasVehIns) {
        const found = documents.find((d) => 
          d.category === 'Insurance' || d.name.toLowerCase().includes('insurance')
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasVehReg) {
        const found = documents.find((d) => 
          d.category === 'Vehicle' || d.name.toLowerCase().includes('registration') || d.name.toLowerCase().includes('rc')
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasLicense) {
        const found = documents.find((d) => 
          d.name.toLowerCase().includes('license') || d.category === 'Identity'
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    } else if (scenarioKey === 'plan-medical-emergency') {
      // Health Insurance, Medical Summary, Identity doc
      const hasHealthIns = relevantDocuments.some((d) => 
        d.name.toLowerCase().includes('health') || (d.category === 'Insurance' && !d.name.toLowerCase().includes('vehicle'))
      );
      const hasMedSum = relevantDocuments.some((d) => 
        d.category === 'Medical' || d.name.toLowerCase().includes('medical')
      );
      const hasId = relevantDocuments.some((d) => 
        d.category === 'Identity' || d.name.toLowerCase().includes('id') || d.name.toLowerCase().includes('license') || d.name.toLowerCase().includes('passport')
      );

      if (!hasHealthIns) {
        const found = documents.find((d) => 
          d.name.toLowerCase().includes('health') || d.category === 'Insurance'
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasMedSum) {
        const found = documents.find((d) => 
          d.category === 'Medical' || d.name.toLowerCase().includes('medical')
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasId) {
        const found = documents.find((d) => d.category === 'Identity');
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    } else if (scenarioKey === 'plan-home-emergency') {
      // Property Document, Home Insurance, Identity document
      const hasPropDoc = relevantDocuments.some((d) => 
        d.category === 'Property' || d.name.toLowerCase().includes('deed') || d.name.toLowerCase().includes('property')
      );
      const hasHomeIns = relevantDocuments.some((d) => 
        d.name.toLowerCase().includes('home') || (d.category === 'Insurance' && !d.name.toLowerCase().includes('vehicle'))
      );
      const hasId = relevantDocuments.some((d) => d.category === 'Identity');

      if (!hasPropDoc) {
        const found = documents.find((d) => 
          d.category === 'Property' || d.name.toLowerCase().includes('deed') || d.name.toLowerCase().includes('property')
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasHomeIns) {
        const found = documents.find((d) => 
          d.name.toLowerCase().includes('home') || d.category === 'Insurance'
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasId) {
        const found = documents.find((d) => d.category === 'Identity');
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    } else if (scenarioKey === 'plan-travel-emergency') {
      // Passport, Health Insurance, Travel Insurance (or related)
      const hasPassport = relevantDocuments.some((d) => 
        d.name.toLowerCase().includes('passport') || d.category === 'Identity'
      );
      const hasHealthIns = relevantDocuments.some((d) => 
        d.name.toLowerCase().includes('health') || d.name.toLowerCase().includes('travel') || d.category === 'Insurance'
      );

      if (!hasPassport) {
        const found = documents.find((d) => 
          d.name.toLowerCase().includes('passport') || d.category === 'Identity'
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasHealthIns) {
        const found = documents.find((d) => 
          d.name.toLowerCase().includes('health') || d.name.toLowerCase().includes('travel') || d.category === 'Insurance'
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    } else if (scenarioKey === 'plan-identity-loss') {
      // Passport, Driving License, Identity doc
      const hasLicense = relevantDocuments.some((d) => 
        d.name.toLowerCase().includes('license') || d.category === 'Identity'
      );
      const hasPassport = relevantDocuments.some((d) => 
        d.name.toLowerCase().includes('passport')
      );

      if (!hasLicense) {
        const found = documents.find((d) => 
          d.name.toLowerCase().includes('license') || d.category === 'Identity'
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
      if (!hasPassport) {
        const found = documents.find((d) => 
          d.name.toLowerCase().includes('passport') || d.category === 'Identity'
        );
        if (found && !relevantDocuments.some((d) => d.id === found.id)) relevantDocuments.push(found);
      }
    }

    // --- 2. RESOLVE RELEVANT ASSETS ---
    let targetAssetIds = activePlan?.relevantAssets?.length
      ? activePlan.relevantAssets
      : blueprint.relevantAssetIds || [];

    let relevantAssets = assets.filter((a) => targetAssetIds.includes(a.id));

    if (scenarioKey === 'plan-auto-accident' && relevantAssets.length === 0) {
      const car = assets.find((a) => 
        a.type.toLowerCase().includes('vehicle') || 
        a.type.toLowerCase().includes('car') || 
        a.type.toLowerCase().includes('auto') || 
        a.name.toLowerCase().includes('car') || 
        a.name.toLowerCase().includes('model') || 
        a.name.toLowerCase().includes('sedan')
      );
      if (car) relevantAssets = [car];
    } else if (scenarioKey === 'plan-home-emergency' && relevantAssets.length === 0) {
      const home = assets.find((a) => 
        a.type.toLowerCase().includes('real estate') || 
        a.type.toLowerCase().includes('property') || 
        a.name.toLowerCase().includes('apartment') || 
        a.name.toLowerCase().includes('home') || 
        a.name.toLowerCase().includes('house')
      );
      if (home) relevantAssets = [home];
    } else if ((scenarioKey === 'plan-identity-loss' || scenarioKey === 'plan-travel-emergency') && relevantAssets.length === 0) {
      const device = assets.find((a) => 
        a.type.toLowerCase().includes('hardware') || 
        a.type.toLowerCase().includes('device') || 
        a.name.toLowerCase().includes('iphone') || 
        a.name.toLowerCase().includes('phone')
      );
      if (device) relevantAssets = [device];
    }

    // If still empty but user has assets, pick first asset
    if (relevantAssets.length === 0 && assets.length > 0) {
      relevantAssets = [assets[0]];
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

    // Scenario-specific contact heuristics
    if (scenarioKey === 'plan-medical-emergency') {
      const doctor = contacts.find((c) => c.medicalProxy || c.role.toLowerCase().includes('medical') || c.role.toLowerCase().includes('doctor') || c.name.toLowerCase().includes('dr'));
      if (doctor && !relevantContacts.some((c) => c.id === doctor.id)) {
        relevantContacts.push(doctor);
      }
    } else {
      const secondary = contacts.find((c) => !c.primary && c.id !== primaryContact?.id);
      if (secondary && !relevantContacts.some((c) => c.id === secondary.id)) {
        relevantContacts.push(secondary);
      }
    }

    const secondaryContact = relevantContacts.find((c) => c.id !== primaryContact?.id) || null;
    const primaryContactName = primaryContact?.name || 'Designated Proxy';
    const secondaryContactName = secondaryContact?.name || primaryContactName;

    // --- 4. RESOLVE PRIORITY TASKS ---
    let priorityTasks: CrisisTask[] = [];

    if (activePlan?.defaultTasks && activePlan.defaultTasks.length > 0) {
      priorityTasks = activePlan.defaultTasks.map((t, idx) => ({
        id: t.id || `task-${scenarioKey}-${idx + 1}`,
        userId: profile?.userId || profile?.id,
        title: t.title,
        description: t.description || `Pre-assigned to ${t.defaultAssigneeRole || primaryContactName}.`,
        assignedTo: t.defaultAssigneeRole || (relevantContacts[idx % relevantContacts.length]?.name || primaryContactName),
        status: 'Pending',
        priority: t.priority === 'Critical' ? 'Critical' : t.priority === 'Low' ? 'Medium' : 'High'
      }));
    } else if (blueprint.priorityTasks && blueprint.priorityTasks.length > 0) {
      priorityTasks = blueprint.priorityTasks.map((task) => {
        let assigned = task.assignedTo;
        if (assigned.toLowerCase().includes('rahul') || assigned.toLowerCase().includes('alex')) {
          assigned = primaryContactName;
        } else if (assigned.toLowerCase().includes('priya') || assigned.toLowerCase().includes('maya')) {
          assigned = secondaryContactName;
        } else if (assigned.toLowerCase().includes('dr') || assigned.toLowerCase().includes('doctor')) {
          const medContact = contacts.find((c) => c.medicalProxy || c.role.toLowerCase().includes('medical'));
          assigned = medContact?.name || primaryContactName;
        }

        // Clean description of hardcoded names
        let desc = task.description;
        desc = desc.replace(/Rahul Morgan/gi, primaryContactName);
        desc = desc.replace(/Priya Morgan/gi, secondaryContactName);

        return {
          ...task,
          userId: profile?.userId || profile?.id,
          assignedTo: assigned,
          description: desc,
          status: 'Pending'
        };
      });
    } else {
      // Fallback dynamic tasks
      priorityTasks = [
        {
          id: `tsk-${Date.now()}-1`,
          userId: profile?.userId || profile?.id,
          title: 'Notify primary emergency contact',
          description: `Coordinate with ${primaryContactName} immediately.`,
          assignedTo: primaryContactName,
          status: 'Pending',
          priority: 'Critical'
        },
        {
          id: `tsk-${Date.now()}-2`,
          userId: profile?.userId || profile?.id,
          title: 'Verify emergency documents',
          description: 'Access digital records in Shadow Vault and verify policy details.',
          assignedTo: profile?.name || 'Primary Account',
          status: 'Pending',
          priority: 'High'
        }
      ];
    }

    // --- 5. BUILD SCENARIO EMERGENCY BRIEF ---
    const primaryAsset = relevantAssets[0] || null;

    let insuranceName = blueprint.insurancePolicyName || 'Policy on file';
    if (primaryAsset?.insurance) {
      insuranceName = primaryAsset.insurance;
    } else {
      const matchDoc = relevantDocuments.find((d) => d.category === 'Insurance');
      if (matchDoc) {
        insuranceName = matchDoc.name;
      }
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
      person: profile?.name || 'Authorized Account Holder',
      bloodGroup: profile?.bloodGroup || 'Not specified',
      allergies: profile?.allergies || 'None declared',
      medicalNotes: profile?.medicalNotes || 'Advance directive on file with designated proxy.',
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
