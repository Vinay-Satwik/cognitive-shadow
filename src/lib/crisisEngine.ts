import { DocumentItem, EmergencyContact, AssetItem, CrisisSession, TimelineEvent } from '../types';
import { demoDocuments, demoAssets, demoEmergencyContacts } from '../data/demoData';
import { crisisScenarios } from '../data/crisisScenarios';

/**
 * Cognitive Shadow Context Engine
 * 
 * Core principle:
 * 12 documents → 3 relevant documents
 * 4 contacts → 2 relevant people
 * 5 emergency plans → 1 active crisis scenario
 */

export function getScenario(scenarioId: string) {
  return crisisScenarios[scenarioId] || crisisScenarios['plan-auto-accident'];
}

export function getRelevantDocuments(scenarioId: string): DocumentItem[] {
  const scenario = getScenario(scenarioId);
  return demoDocuments.filter((doc) => scenario.relevantDocumentIds.includes(doc.id));
}

export function getRelevantContacts(scenarioId: string): EmergencyContact[] {
  const scenario = getScenario(scenarioId);
  return demoEmergencyContacts.filter((contact) => scenario.relevantContactIds.includes(contact.id));
}

export function getRelevantAssets(scenarioId: string): AssetItem[] {
  const scenario = getScenario(scenarioId);
  return demoAssets.filter((asset) => scenario.relevantAssetIds.includes(asset.id));
}

export function createCrisisSession(scenarioId: string): CrisisSession {
  const scenario = getScenario(scenarioId);
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const initialTimelineEvents: TimelineEvent[] = [
    {
      id: `evt-${Date.now()}-1`,
      timestamp: timeString,
      title: 'Crisis activated',
      description: `${scenario.name} engaged by Alex Morgan. Cognitive Shadow switched to Crisis Mode.`,
      type: 'activation'
    },
    {
      id: `evt-${Date.now()}-2`,
      timestamp: timeString,
      title: 'Relevant information prepared',
      description: `${scenario.relevantDocumentIds.length} relevant documents and ${scenario.relevantContactIds.length} emergency contacts surfaced.`,
      type: 'document_surfaced'
    },
    {
      id: `evt-${Date.now()}-3`,
      timestamp: timeString,
      title: 'Tasks assigned',
      description: `${scenario.priorityTasks.length} priority tasks dispatched to CareCircle.`,
      type: 'task_assigned'
    }
  ];

  return {
    id: `crisis-${Date.now()}`,
    scenarioId: scenario.id,
    scenario: scenario.name,
    scenarioEmoji: scenario.emoji,
    activatedAt: timeString,
    status: 'active',
    surfacedDocuments: scenario.relevantDocumentIds,
    involvedContacts: scenario.relevantContactIds,
    primaryContactId: scenario.primaryContactId,
    primaryAssetId: scenario.primaryAssetId,
    insurancePolicyName: scenario.insurancePolicyName,
    tasks: scenario.priorityTasks.map((task) => ({ ...task })),
    timelineEvents: initialTimelineEvents
  };
}
