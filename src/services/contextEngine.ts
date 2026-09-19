/**
 * Cognitive Shadow Context Engine
 * 
 * Contextual information reduction engine:
 * In a crisis, eliminates noise and surfaces only the documents,
 * contacts, assets, and tasks essential to the specific incident scenario.
 */

import {
  Document,
  Asset,
  EmergencyContact,
  EmergencyPlan,
  CrisisTask
} from '../types';
import { crisisScenarios } from '../data/crisisScenarios';

export interface ContextFilterResult {
  relevantDocuments: Document[];
  relevantAssets: Asset[];
  relevantContacts: EmergencyContact[];
  priorityTasks: CrisisTask[];
  emergencyBriefData: {
    scenarioId: string;
    scenarioName: string;
    scenarioEmoji: string;
    briefSubtitle: string;
    primaryContact: EmergencyContact | null;
    primaryAsset: Asset | null;
    criticalDocuments: Document[];
    criticalNotes: string;
    insurancePolicyName: string;
  };
}

export const contextEngine = {
  /**
   * Filter all personal records down to the minimal essential dossier
   * for the designated emergency scenario.
   */
  filter(
    scenarioId: string,
    documents: Document[],
    assets: Asset[],
    contacts: EmergencyContact[],
    plan?: EmergencyPlan
  ): ContextFilterResult {
    // 1. Resolve Scenario Baseline
    const scenarioBlueprint = crisisScenarios[scenarioId] || crisisScenarios['plan-auto-accident'];
    const activePlan = plan || undefined;

    const docIdsToMatch = activePlan?.relevantDocuments || scenarioBlueprint.relevantDocumentIds || [];
    const assetIdsToMatch = activePlan?.relevantAssets || scenarioBlueprint.relevantAssetIds || [];
    const contactIdsToMatch = activePlan?.relevantContacts || scenarioBlueprint.relevantContactIds || [];

    // 2. Filter Documents
    const relevantDocuments = documents.filter((doc) => {
      // Match by exact ID
      if (docIdsToMatch.includes(doc.id)) return true;
      // Or match if doc is directly related to a relevant asset
      if (doc.relatedAsset) {
        const matchingAsset = assets.find((a) => a.name === doc.relatedAsset && assetIdsToMatch.includes(a.id));
        if (matchingAsset) return true;
      }
      return false;
    });

    // 3. Filter Assets
    const relevantAssets = assets.filter((asset) => assetIdsToMatch.includes(asset.id));

    // 4. Filter Contacts
    const relevantContacts = contacts.filter((c) => contactIdsToMatch.includes(c.id));

    // 5. Build Priority Tasks
    const priorityTasks: CrisisTask[] = activePlan?.defaultTasks && activePlan.defaultTasks.length > 0
      ? activePlan.defaultTasks.map((t, index) => ({
          id: t.id || `task-${scenarioId}-${index + 1}`,
          title: t.title,
          description: t.description || `Action assigned to ${t.defaultAssigneeRole || 'Primary Proxy'}.`,
          assignedTo: t.defaultAssigneeRole || (relevantContacts[0]?.name.split(' ')[0] || 'Primary Proxy'),
          status: 'Pending',
          priority: t.priority === 'Critical' ? 'Critical' : t.priority === 'Low' ? 'Medium' : 'High'
        }))
      : scenarioBlueprint.priorityTasks.map((task) => ({ ...task }));

    // 6. Identify Primary Roles for the Emergency Brief
    const primaryContact = contacts.find((c) => c.id === scenarioBlueprint.primaryContactId) 
      || contacts.find((c) => c.primary) 
      || relevantContacts[0] 
      || null;

    const primaryAsset = assets.find((a) => a.id === scenarioBlueprint.primaryAssetId) 
      || relevantAssets[0] 
      || null;

    const criticalDocuments = relevantDocuments.filter(
      (d) => d.emergencyRelevance === 'Critical' || d.category === 'Identity' || d.category === 'Medical'
    );

    return {
      relevantDocuments,
      relevantAssets,
      relevantContacts,
      priorityTasks,
      emergencyBriefData: {
        scenarioId: scenarioBlueprint.id,
        scenarioName: activePlan?.name || scenarioBlueprint.name,
        scenarioEmoji: activePlan?.emoji || scenarioBlueprint.emoji,
        briefSubtitle: scenarioBlueprint.briefSubtitle || activePlan?.description || '',
        primaryContact,
        primaryAsset,
        criticalDocuments: criticalDocuments.length > 0 ? criticalDocuments : relevantDocuments,
        criticalNotes: activePlan?.sharingRules.join('. ') || 'Handover essential documents only to verified responders.',
        insurancePolicyName: scenarioBlueprint.insurancePolicyName || 'Active Policy on File'
      }
    };
  }
};
