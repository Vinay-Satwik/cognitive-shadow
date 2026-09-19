import { EmergencyScenario } from '../types';

export const crisisScenarios: Record<string, EmergencyScenario> = {
  'plan-auto-accident': {
    id: 'plan-auto-accident',
    name: 'Major Automobile Accident',
    emoji: '🚗',
    description: 'Immediate vehicle identification, roadside insurance claims, and emergency family coordination.',
    briefSubtitle: 'Vehicle collision or severe roadside emergency protocol',
    relevantDocumentIds: ['doc-vehicle-ins', 'doc-vehicle-reg', 'doc-driver-lic'],
    relevantContactIds: ['con-rahul', 'con-priya'],
    relevantAssetIds: ['ast-car'],
    primaryContactId: 'con-rahul',
    primaryAssetId: 'ast-car',
    insurancePolicyName: 'Vehicle Insurance Policy (National Insurance #488102)',
    priorityTasks: [
      {
        id: 'tsk-auto-1',
        title: 'Contact insurance provider',
        description: 'Call National Insurance claims helpline (#488102) and report accident location.',
        assignedTo: 'Rahul Morgan',
        status: 'Pending',
        priority: 'Critical'
      },
      {
        id: 'tsk-auto-2',
        title: 'Bring vehicle documents',
        description: 'Bring physical vehicle registration (RC) and driving license copy to the site or service depot.',
        assignedTo: 'Priya Morgan',
        status: 'In Progress',
        priority: 'High'
      },
      {
        id: 'tsk-auto-3',
        title: 'Notify immediate family',
        description: 'Check in with immediate family members and confirm well-being status.',
        assignedTo: 'Rahul Morgan',
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
    relevantContactIds: ['con-rahul', 'con-mehta', 'con-priya'],
    relevantAssetIds: [],
    primaryContactId: 'con-rahul',
    primaryAssetId: undefined,
    insurancePolicyName: 'Family Health Insurance (Cashless TPA #HLT-99214)',
    priorityTasks: [
      {
        id: 'tsk-med-1',
        title: 'Present Medical Summary & Allergies',
        description: 'Hand over physician-certified medical history (penicillin allergy, O+ blood type) to attending medical team.',
        assignedTo: 'Rahul Morgan',
        status: 'In Progress',
        priority: 'Critical'
      },
      {
        id: 'tsk-med-2',
        title: 'Authorize Health Insurance cashless desk',
        description: 'Submit cashless hospitalization pre-authorization request with TPA insurance card.',
        assignedTo: 'Rahul Morgan',
        status: 'Pending',
        priority: 'Critical'
      },
      {
        id: 'tsk-med-3',
        title: 'Consult Dr. Mehta on medical history',
        description: 'Call Dr. Mehta for physician-to-physician handoff consultation.',
        assignedTo: 'Dr. Mehta',
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
    relevantContactIds: ['con-rahul', 'con-maya'],
    relevantAssetIds: ['ast-apartment'],
    primaryContactId: 'con-rahul',
    primaryAssetId: 'ast-apartment',
    insurancePolicyName: 'Home & Contents Insurance (Policy #HOM-9901)',
    priorityTasks: [
      {
        id: 'tsk-home-1',
        title: 'Coordinate building management & utilities',
        description: 'Verify gas and water mains are shut off with building security.',
        assignedTo: 'Maya Vance',
        status: 'In Progress',
        priority: 'Critical'
      },
      {
        id: 'tsk-home-2',
        title: 'File Home Insurance initial claim notice',
        description: 'Log formal claim ticket with policy number #HOM-9901 for immediate adjuster dispatch.',
        assignedTo: 'Rahul Morgan',
        status: 'Pending',
        priority: 'High'
      },
      {
        id: 'tsk-home-3',
        title: 'Arrange temporary accommodation',
        description: 'Confirm hotel or family stay location for the next 72 hours.',
        assignedTo: 'Rahul Morgan',
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
    relevantContactIds: ['con-rahul', 'con-priya'],
    relevantAssetIds: ['ast-phone'],
    primaryContactId: 'con-rahul',
    primaryAssetId: 'ast-phone',
    insurancePolicyName: 'International Travel & Medical Insurance (#TRV-8812)',
    priorityTasks: [
      {
        id: 'tsk-trv-1',
        title: 'Contact Embassy / Consulate hotline',
        description: 'Request expedited Emergency Travel Certificate using verified digital passport copy.',
        assignedTo: 'Rahul Morgan',
        status: 'Pending',
        priority: 'Critical'
      },
      {
        id: 'tsk-trv-2',
        title: 'Notify international travel insurer',
        description: 'Activate 24/7 global travel medical emergency assistance line.',
        assignedTo: 'Priya Morgan',
        status: 'In Progress',
        priority: 'High'
      },
      {
        id: 'tsk-trv-3',
        title: 'Secure credit lines & backup communications',
        description: 'Enable emergency roaming or eSIM data package and notify bank of overseas incident.',
        assignedTo: 'Rahul Morgan',
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
    relevantContactIds: ['con-rahul'],
    relevantAssetIds: ['ast-phone', 'ast-laptop'],
    primaryContactId: 'con-rahul',
    primaryAssetId: 'ast-phone',
    insurancePolicyName: 'AppleCare+ Theft & Loss / Personal Cyber Cover',
    priorityTasks: [
      {
        id: 'tsk-id-1',
        title: 'File lost property police report online',
        description: 'Obtain official police acknowledgment receipt number for document reissuance.',
        assignedTo: 'Rahul Morgan',
        status: 'Pending',
        priority: 'Critical'
      },
      {
        id: 'tsk-id-2',
        title: 'Remotely lock iPhone 16 Pro via Find My',
        description: 'Put iPhone 16 Pro (IMEI ending 4821) into Lost Mode and file AppleCare+ Theft & Loss claim.',
        assignedTo: 'Rahul Morgan',
        status: 'In Progress',
        priority: 'Critical'
      },
      {
        id: 'tsk-id-3',
        title: 'Request duplicate Driving License & Identity documents',
        description: 'Submit online application for duplicate license using verified license records.',
        assignedTo: 'Rahul Morgan',
        status: 'Pending',
        priority: 'High'
      }
    ]
  }
};
