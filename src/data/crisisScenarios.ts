import { EmergencyScenario } from '../types';

export const crisisScenarios: Record<string, EmergencyScenario> = {
  'plan-auto-accident': {
    id: 'plan-auto-accident',
    name: 'Major Automobile Accident',
    emoji: '🚗',
    description: 'Immediate vehicle identification, roadside insurance claims, and emergency family coordination.',
    briefSubtitle: 'Vehicle collision or severe roadside emergency protocol',
    relevantDocumentIds: ['doc-vehicle-ins', 'doc-vehicle-reg', 'doc-driver-lic'],
    relevantContactIds: [],
    relevantAssetIds: ['ast-car'],
    primaryContactId: undefined,
    primaryAssetId: 'ast-car',
    insurancePolicyName: 'Vehicle Insurance Policy',
    priorityTasks: [
      {
        id: 'tsk-auto-1',
        title: 'Contact insurance provider',
        description: 'Call claims helpline and report accident location.',
        assignedTo: 'Primary Proxy',
        status: 'Pending',
        priority: 'Critical'
      },
      {
        id: 'tsk-auto-2',
        title: 'Bring vehicle documents',
        description: 'Bring physical vehicle registration (RC) and driving license copy to the site or service depot.',
        assignedTo: 'Secondary Responder',
        status: 'In Progress',
        priority: 'High'
      },
      {
        id: 'tsk-auto-3',
        title: 'Notify immediate family',
        description: 'Check in with immediate family members and confirm well-being status.',
        assignedTo: 'Primary Proxy',
        status: 'Completed',
        priority: 'High'
      }
    ]
  },

  'plan-medical-emergency': {
    id: 'plan-medical-emergency',
    name: 'Critical Medical Emergency',
    emoji: '🏥',
    description: 'Sudden hospitalization, severe illness, or acute medical incapacitation.',
    briefSubtitle: 'Hospitalization and medical proxy coordination protocol',
    relevantDocumentIds: ['doc-health-ins', 'doc-med-sum', 'doc-will'],
    relevantContactIds: [],
    relevantAssetIds: [],
    primaryContactId: undefined,
    primaryAssetId: undefined,
    insurancePolicyName: 'Family Health Insurance',
    priorityTasks: [
      {
        id: 'tsk-med-1',
        title: 'Present Medical Summary & Allergies',
        description: 'Hand over physician-certified medical history to attending medical team.',
        assignedTo: 'Medical Proxy',
        status: 'In Progress',
        priority: 'Critical'
      },
      {
        id: 'tsk-med-2',
        title: 'Authorize Health Insurance cashless desk',
        description: 'Submit cashless hospitalization pre-authorization request with insurance documentation.',
        assignedTo: 'Primary Proxy',
        status: 'Pending',
        priority: 'Critical'
      },
      {
        id: 'tsk-med-3',
        title: 'Consult attending physician on medical history',
        description: 'Contact primary doctor for physician-to-physician handoff consultation.',
        assignedTo: 'Medical Proxy',
        status: 'Pending',
        priority: 'High'
      }
    ]
  },

  'plan-home-emergency': {
    id: 'plan-home-emergency',
    name: 'Home / Property Emergency',
    emoji: '🏠',
    description: 'Catastrophic fire, major structural damage, water pipe burst, or building evacuation.',
    briefSubtitle: 'Residential property contingency and emergency claim protocol',
    relevantDocumentIds: ['doc-home-ins', 'doc-prop-doc'],
    relevantContactIds: [],
    relevantAssetIds: ['ast-apartment'],
    primaryContactId: undefined,
    primaryAssetId: 'ast-apartment',
    insurancePolicyName: 'Home & Contents Insurance',
    priorityTasks: [
      {
        id: 'tsk-home-1',
        title: 'Coordinate building management & utilities',
        description: 'Verify gas and water mains are shut off with building security.',
        assignedTo: 'Secondary Responder',
        status: 'In Progress',
        priority: 'Critical'
      },
      {
        id: 'tsk-home-2',
        title: 'File Home Insurance initial claim notice',
        description: 'Log formal claim ticket with policy for immediate adjuster dispatch.',
        assignedTo: 'Primary Proxy',
        status: 'Pending',
        priority: 'High'
      },
      {
        id: 'tsk-home-3',
        title: 'Arrange temporary accommodation',
        description: 'Confirm hotel or safe family stay location for the next 72 hours.',
        assignedTo: 'Primary Proxy',
        status: 'Pending',
        priority: 'Medium'
      }
    ]
  },

  'plan-travel-emergency': {
    id: 'plan-travel-emergency',
    name: 'Travel Emergency',
    emoji: '✈️',
    description: 'Overseas emergency: lost passport, flight strandings, international injury, or consular support.',
    briefSubtitle: 'International travel contingency and consular brief',
    relevantDocumentIds: ['doc-passport', 'doc-health-ins', 'doc-phone-inv'],
    relevantContactIds: [],
    relevantAssetIds: ['ast-phone'],
    primaryContactId: undefined,
    primaryAssetId: 'ast-phone',
    insurancePolicyName: 'International Travel & Medical Insurance',
    priorityTasks: [
      {
        id: 'tsk-trv-1',
        title: 'Contact Embassy / Consulate hotline',
        description: 'Request expedited Emergency Travel Certificate using verified digital passport copy.',
        assignedTo: 'Primary Proxy',
        status: 'Pending',
        priority: 'Critical'
      },
      {
        id: 'tsk-trv-2',
        title: 'Notify international travel insurer',
        description: 'Activate 24/7 global travel medical emergency assistance line.',
        assignedTo: 'Secondary Responder',
        status: 'In Progress',
        priority: 'High'
      },
      {
        id: 'tsk-trv-3',
        title: 'Secure credit lines & backup communications',
        description: 'Enable emergency roaming or eSIM data package and notify bank of overseas incident.',
        assignedTo: 'Primary Proxy',
        status: 'Completed',
        priority: 'Medium'
      }
    ]
  },

  'plan-identity-loss': {
    id: 'plan-identity-loss',
    name: 'Identity / Document Loss',
    emoji: '🪪',
    description: 'Theft or loss of wallet, core phone, passport, driving license, or critical identity credentials.',
    briefSubtitle: 'Identity protection and emergency document replacement protocol',
    relevantDocumentIds: ['doc-driver-lic', 'doc-passport', 'doc-phone-inv', 'doc-laptop-inv'],
    relevantContactIds: [],
    relevantAssetIds: ['ast-phone', 'ast-laptop'],
    primaryContactId: undefined,
    primaryAssetId: 'ast-phone',
    insurancePolicyName: 'Theft & Loss / Cyber Cover',
    priorityTasks: [
      {
        id: 'tsk-id-1',
        title: 'File lost property police report online',
        description: 'Obtain official police acknowledgment receipt number for document reissuance.',
        assignedTo: 'Primary Proxy',
        status: 'Pending',
        priority: 'Critical'
      },
      {
        id: 'tsk-id-2',
        title: 'Remotely lock devices via cloud services',
        description: 'Put primary mobile device into Lost Mode and file insurance claim.',
        assignedTo: 'Primary Proxy',
        status: 'In Progress',
        priority: 'Critical'
      },
      {
        id: 'tsk-id-3',
        title: 'Request duplicate Driving License & Identity documents',
        description: 'Submit online application for duplicate license using verified records.',
        assignedTo: 'Primary Proxy',
        status: 'Pending',
        priority: 'High'
      }
    ]
  }
};
