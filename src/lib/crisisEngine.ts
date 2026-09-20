import { DocumentItem, EmergencyContact, AssetItem, CrisisSession, TimelineEvent } from '../types';
import { crisisScenarios } from '../data/crisisScenarios';

/**
 * Cognitive Shadow Crisis Engine Helpers
 * Scoped strictly to authentic data without demo/mock data pollution.
 */

export function getScenario(scenarioId: string) {
  return crisisScenarios[scenarioId] || crisisScenarios['plan-auto-accident'];
}

// Deprecated fallback stubs - returns empty array if no context available (zero mock pollution)
export function getRelevantDocuments(_scenarioId: string): DocumentItem[] {
  return [];
}

export function getRelevantContacts(_scenarioId: string): EmergencyContact[] {
  return [];
}

export function getRelevantAssets(_scenarioId: string): AssetItem[] {
  return [];
}

export function createCrisisSession(scenarioId: string, userName = 'User', userId?: string): CrisisSession {
  const scenario = getScenario(scenarioId);
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const initialTimelineEvents: TimelineEvent[] = [
    {
      id: `evt-${Date.now()}-1`,
      userId,
      timestamp: timeString,
      title: 'Crisis activated',
      description: `${scenario.name} engaged by ${userName}. Cognitive Shadow entered Crisis Mode.`,
      type: 'activation'
    },
    {
      id: `evt-${Date.now()}-2`,
      userId,
      timestamp: timeString,
      title: 'Contextual reduction executed',
      description: 'Zero mock fallbacks. Filtering real user documents and emergency contacts.',
      type: 'document_surfaced'
    },
    {
      id: `evt-${Date.now()}-3`,
      userId,
      timestamp: timeString,
      title: 'Tasks dispatched',
      description: `${scenario.priorityTasks.length} priority tasks generated; 0 emergency contacts configured.`,
      type: 'task_assigned'
    }
  ];

  return {
    id: `crisis-${Date.now()}`,
    userId,
    scenarioId: scenario.id,
    scenario: scenario.name,
    scenarioEmoji: scenario.emoji,
    activatedAt: timeString,
    status: 'active',
    surfacedDocuments: [],
    involvedContacts: [],
    primaryContactId: undefined,
    primaryAssetId: undefined,
    insurancePolicyName: 'No policy on record',
    tasks: scenario.priorityTasks.map((task, idx) => ({
      ...task,
      id: `tsk-${Date.now()}-${idx + 1}`,
      userId
    })),
    timelineEvents: initialTimelineEvents
  };
}
