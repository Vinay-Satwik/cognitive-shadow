import {
  DocumentItem,
  AssetItem,
  EmergencyContact,
  EmergencyPlan,
  CrisisSession,
  ReadinessOverview
} from '../types';

export const demoDocuments: DocumentItem[] = [
  {
    id: 'doc-vehicle-ins',
    name: 'Vehicle Insurance Policy',
    category: 'Insurance',
    description: 'Comprehensive policy with road assistance and third-party liability cover.',
    expiryDate: 'Oct 2026',
    relatedAsset: 'Honda City',
    emergencyRelevance: 'Critical',
    accessLevel: 'Important',
    uploadDate: 'Jan 2025'
  },
  {
    id: 'doc-vehicle-reg',
    name: 'Vehicle Registration (RC)',
    category: 'Vehicle',
    description: 'Official motor vehicle registration card issued in state transport department.',
    expiryDate: 'May 2032',
    relatedAsset: 'Honda City',
    emergencyRelevance: 'Critical',
    accessLevel: 'Important',
    uploadDate: 'Jan 2025'
  },
  {
    id: 'doc-driver-lic',
    name: 'Driving License',
    category: 'Identity',
    description: 'Official motor vehicle driving authorization with blood group (O+).',
    expiryDate: 'Aug 2035',
    relatedAsset: undefined,
    emergencyRelevance: 'Critical',
    accessLevel: 'Important',
    uploadDate: 'Dec 2024'
  },
  {
    id: 'doc-health-ins',
    name: 'Health Insurance Card & Policy',
    category: 'Insurance',
    description: 'Family health coverage including emergency hospitalization cashless card.',
    expiryDate: 'Nov 2026',
    relatedAsset: undefined,
    emergencyRelevance: 'Critical',
    accessLevel: 'Important',
    uploadDate: 'Feb 2025'
  },
  {
    id: 'doc-med-sum',
    name: 'Medical Summary & Allergies',
    category: 'Medical',
    description: 'Physician-certified summary of chronic history, penicillin sensitivity, and blood type.',
    expiryDate: 'Jan 2027',
    relatedAsset: undefined,
    emergencyRelevance: 'Critical',
    accessLevel: 'Important',
    uploadDate: 'Feb 2025'
  },
  {
    id: 'doc-passport',
    name: 'Passport (International)',
    category: 'Identity',
    description: 'Primary identification and travel document with valid multi-entry visas.',
    expiryDate: 'Jun 2030',
    relatedAsset: undefined,
    emergencyRelevance: 'High',
    accessLevel: 'Personal',
    uploadDate: 'Nov 2024'
  },
  {
    id: 'doc-prop-doc',
    name: 'Property Deed & Title Deed',
    category: 'Property',
    description: 'Registered title deed and society membership certificate for Apartment #402.',
    expiryDate: 'Indefinite',
    relatedAsset: 'Apartment',
    emergencyRelevance: 'High',
    accessLevel: 'Confidential',
    uploadDate: 'Oct 2024'
  },
  {
    id: 'doc-home-ins',
    name: 'Home & Contents Insurance',
    category: 'Insurance',
    description: 'Fire, earthquake, and burglary coverage policy for residential apartment.',
    expiryDate: 'Dec 2026',
    relatedAsset: 'Apartment',
    emergencyRelevance: 'Moderate',
    accessLevel: 'Important',
    uploadDate: 'Dec 2024'
  },
  {
    id: 'doc-life-ins',
    name: 'Term Life Insurance',
    category: 'Insurance',
    description: 'Primary beneficiary term policy with claim assistance hotline info.',
    expiryDate: '2045',
    relatedAsset: undefined,
    emergencyRelevance: 'High',
    accessLevel: 'Confidential',
    uploadDate: 'Jan 2025'
  },
  {
    id: 'doc-will',
    name: 'Will & Personal Directives',
    category: 'Identity',
    description: 'Notarized personal testament and emergency guardianship preferences.',
    expiryDate: 'Indefinite',
    relatedAsset: undefined,
    emergencyRelevance: 'High',
    accessLevel: 'Confidential',
    uploadDate: 'Jan 2025'
  },
  {
    id: 'doc-laptop-inv',
    name: 'MacBook Pro Purchase Receipt & AppleCare',
    category: 'Other',
    description: 'Proof of purchase, serial number registry, and extended warranty invoice.',
    expiryDate: 'Dec 2026',
    relatedAsset: 'MacBook Pro',
    emergencyRelevance: 'Low',
    accessLevel: 'Personal',
    uploadDate: 'Jan 2025'
  },
  {
    id: 'doc-phone-inv',
    name: 'iPhone 16 Pro Purchase Receipt & AppleCare+',
    category: 'Other',
    description: 'Original purchase invoice, IMEI credentials, and AppleCare+ Theft & Loss coverage.',
    expiryDate: 'Jan 2027',
    relatedAsset: 'iPhone 16 Pro',
    emergencyRelevance: 'Low',
    accessLevel: 'Personal',
    uploadDate: 'Feb 2025'
  }
];

export const demoAssets: AssetItem[] = [
  {
    id: 'ast-car',
    name: 'Honda City',
    type: 'Automobile',
    registrationOrSerial: 'KA-01-MJ-4921',
    purchaseDate: 'March 2023',
    estimatedValue: '$18,500',
    insurance: 'Vehicle Insurance Policy (National Insurance #488102)',
    warranty: '3-Year Manufacturer Warranty (Active)',
    relatedDocuments: ['Vehicle Insurance Policy', 'Vehicle Registration (RC)']
  },
  {
    id: 'ast-phone',
    name: 'iPhone 16 Pro',
    type: 'Mobile Phone',
    registrationOrSerial: 'IMEI ending in 4821 (demo data)',
    purchaseDate: 'January 2025',
    estimatedValue: '$999',
    insurance: 'AppleCare+ with Theft and Loss',
    warranty: 'Active',
    relatedDocuments: ['iPhone 16 Pro Purchase Receipt & AppleCare+']
  },
  {
    id: 'ast-laptop',
    name: 'MacBook Pro 16"',
    type: 'Laptop Computer',
    registrationOrSerial: 'Serial: C02G9941MD6R',
    purchaseDate: 'November 2023',
    estimatedValue: '$2,400',
    insurance: 'AppleCare+ Theft & Accidental Damage',
    warranty: 'AppleCare+ active through Nov 2026',
    relatedDocuments: ['MacBook Pro Purchase Receipt & AppleCare']
  },
  {
    id: 'ast-apartment',
    name: 'Apartment #402 (Silver Oaks)',
    type: 'Residential Home',
    registrationOrSerial: 'Reg Doc: 2021/498-A',
    purchaseDate: 'June 2021',
    estimatedValue: '$320,000',
    insurance: 'Home & Contents Insurance (#HOM-9901)',
    warranty: 'Builder Structural Warranty (Active)',
    relatedDocuments: ['Property Deed & Title Deed', 'Home & Contents Insurance']
  }
];

export const demoEmergencyContacts: EmergencyContact[] = [
  {
    id: 'con-rahul',
    name: 'Rahul Morgan',
    relationship: 'Spouse & Primary Contact',
    phone: '+1 (555) 349-8812',
    email: 'rahul.morgan@example.com',
    role: 'Primary Contact',
    availability: 'Immediate 24/7',
    verified: true,
    primary: true,
    medicalProxy: true
  },
  {
    id: 'con-priya',
    name: 'Priya Morgan',
    relationship: 'Sister',
    phone: '+1 (555) 882-9014',
    email: 'priya.m@example.com',
    role: 'Family Support',
    availability: 'Available / Nearby',
    verified: true,
    primary: false,
    medicalProxy: false
  },
  {
    id: 'con-mehta',
    name: 'Dr. Mehta',
    relationship: 'Family Physician',
    phone: '+1 (555) 901-2244',
    email: 'clinic@drmehtacare.example',
    role: 'Medical Contact',
    availability: 'On-Call & Clinic Hours',
    verified: true,
    primary: false,
    medicalProxy: false
  },
  {
    id: 'con-maya',
    name: 'Maya Vance',
    relationship: 'Trusted Neighbor & Friend',
    phone: '+1 (555) 771-3329',
    email: 'maya.vance@example.com',
    role: 'Local Alternate',
    availability: 'Evenings & Emergency',
    verified: false,
    primary: false,
    medicalProxy: false
  }
];

export const demoEmergencyPlans: EmergencyPlan[] = [
  {
    id: 'plan-auto-accident',
    name: 'Major Automobile Accident',
    emoji: '🚗',
    description: 'For collisions or severe road incidents requiring immediate vehicle info, insurance dispatch, and emergency family coordination.',
    relevantDocuments: ['doc-vehicle-ins', 'doc-vehicle-reg', 'doc-driver-lic'],
    relevantAssets: ['ast-car'],
    relevantContacts: ['con-rahul', 'con-priya'],
    defaultTasks: [
      { id: 'task-car-1', title: 'Contact insurance company and file emergency notice', priority: 'High', defaultAssigneeRole: 'Rahul' },
      { id: 'task-car-2', title: 'Bring vehicle documents and physical ID to site/hospital', priority: 'High', defaultAssigneeRole: 'Priya' },
      { id: 'task-car-3', title: 'Notify immediate family members and confirm status', priority: 'Medium', defaultAssigneeRole: 'Rahul' }
    ],
    sharingRules: [
      'Share digital vehicle insurance and registration with roadside assistance',
      'Provide medical summary to first responders if hospitalized'
    ]
  },
  {
    id: 'plan-medical-emergency',
    name: 'Critical Medical Emergency',
    emoji: '🏥',
    description: 'When sudden hospitalization, severe illness, or medical incapacitation occurs.',
    relevantDocuments: ['doc-health-ins', 'doc-med-sum', 'doc-will'],
    relevantAssets: [],
    relevantContacts: ['con-rahul', 'con-mehta', 'con-priya'],
    defaultTasks: [
      { id: 'task-med-1', title: 'Hand over Medical Summary & Allergies list to attending doctor', priority: 'High', defaultAssigneeRole: 'Rahul' },
      { id: 'task-med-2', title: 'Present Health Insurance cashless hospitalization card', priority: 'High', defaultAssigneeRole: 'Rahul' },
      { id: 'task-med-3', title: 'Call Dr. Mehta for medical history consultation', priority: 'Medium', defaultAssigneeRole: 'Dr. Mehta' }
    ],
    sharingRules: [
      'Grant temporary access to health insurance card to hospital desk',
      'Alert Rahul Morgan immediately via emergency phone line'
    ]
  },
  {
    id: 'plan-home-emergency',
    name: 'Home / Property Emergency',
    emoji: '🏠',
    description: 'For house fires, severe storm or water leakage, burglary, or building evacuation.',
    relevantDocuments: ['doc-home-ins', 'doc-prop-doc'],
    relevantAssets: ['ast-apartment'],
    relevantContacts: ['con-rahul', 'con-maya'],
    defaultTasks: [
      { id: 'task-home-1', title: 'Contact building management and turn off main water/gas valves', priority: 'High', defaultAssigneeRole: 'Maya' },
      { id: 'task-home-2', title: 'Notify Homeowners Insurance claims representative', priority: 'High', defaultAssigneeRole: 'Rahul' },
      { id: 'task-home-3', title: 'Secure temporary accommodation and safe rendezvous', priority: 'Medium', defaultAssigneeRole: 'Rahul' }
    ],
    sharingRules: [
      'Provide apartment deed details to society secretary and insurer'
    ]
  },
  {
    id: 'plan-travel-emergency',
    name: 'Travel Emergency',
    emoji: '✈️',
    description: 'For emergencies abroad: lost passport, flight strandings, overseas hospital stays, or consular assistance.',
    relevantDocuments: ['doc-passport', 'doc-health-ins', 'doc-driver-lic'],
    relevantAssets: ['ast-phone'],
    relevantContacts: ['con-rahul', 'con-priya'],
    defaultTasks: [
      { id: 'task-trv-1', title: 'Contact embassy/consulate for temporary travel certificate', priority: 'High', defaultAssigneeRole: 'Rahul' },
      { id: 'task-trv-2', title: 'Contact international travel medical insurance helpline', priority: 'High', defaultAssigneeRole: 'Priya' },
      { id: 'task-trv-3', title: 'Block lost cards and verify digital passport copy', priority: 'Medium', defaultAssigneeRole: 'Rahul' }
    ],
    sharingRules: [
      'Prepare one-click emergency brief with passport copy for embassy'
    ]
  },
  {
    id: 'plan-identity-loss',
    name: 'Identity / Document Loss',
    emoji: '🪪',
    description: 'When wallet, passport, driving license, or core phones are lost or stolen.',
    relevantDocuments: ['doc-driver-lic', 'doc-passport', 'doc-phone-inv'],
    relevantAssets: ['ast-phone', 'ast-laptop'],
    relevantContacts: ['con-rahul'],
    defaultTasks: [
      { id: 'task-id-1', title: 'File lost property police report online', priority: 'High', defaultAssigneeRole: 'Rahul' },
      { id: 'task-id-2', title: 'Lock stolen mobile device via remote IMEI block', priority: 'High', defaultAssigneeRole: 'Rahul' },
      { id: 'task-id-3', title: 'Request replacement driving license and identity cards', priority: 'Medium', defaultAssigneeRole: 'Rahul' }
    ],
    sharingRules: [
      'Generate verifiable identity dossier for local police and banks'
    ]
  }
];

export const demoCrisisSession: CrisisSession = {
  id: 'crisis-auto-accident',
  scenarioId: 'plan-auto-accident',
  scenario: 'Major Automobile Accident',
  scenarioEmoji: '🚗',
  insurancePolicyName: 'Vehicle Insurance Policy (National Insurance #488102)',
  primaryContactId: 'con-rahul',
  primaryAssetId: 'ast-car',
  activatedAt: 'Just now',
  status: 'active',
  surfacedDocuments: ['doc-vehicle-ins', 'doc-vehicle-reg', 'doc-driver-lic'],
  involvedContacts: ['con-rahul', 'con-priya'],
  tasks: [
    {
      id: 'tsk-1',
      title: 'Contact insurance',
      description: 'Call insurance claims hotline (#488102) and provide policy number.',
      assignedTo: 'Rahul',
      status: 'Pending',
      priority: 'Critical'
    },
    {
      id: 'tsk-2',
      title: 'Bring vehicle documents',
      description: 'Deliver physical RC card and license to the scene or service depot.',
      assignedTo: 'Priya',
      status: 'In Progress',
      priority: 'High'
    },
    {
      id: 'tsk-3',
      title: 'Contact family',
      description: 'Confirm everyone is safe and inform immediate relatives.',
      assignedTo: 'Rahul',
      status: 'Completed',
      priority: 'Medium'
    }
  ],
  timelineEvents: [
    {
      id: 'evt-1',
      timestamp: '10:02 AM',
      title: 'Crisis activated',
      description: 'Major Automobile Accident protocol engaged by Alex.',
      type: 'activation'
    },
    {
      id: 'evt-2',
      timestamp: '10:03 AM',
      title: 'Relevant information prepared',
      description: 'Vehicle insurance, RC book, and driving license surfaced to top view.',
      type: 'document_surfaced'
    },
    {
      id: 'evt-3',
      timestamp: '10:04 AM',
      title: 'Task assigned',
      description: 'Tasks routed to Rahul Morgan and Priya Morgan.',
      type: 'status_change'
    }
  ]
};

export const demoReadiness: ReadinessOverview = {
  overallScore: 94,
  subtitle: 'Prepared before the unexpected.',
  categories: [
    { name: 'Documents', score: 96, detail: '12 important documents up to date' },
    { name: 'Contacts', score: 92, detail: '3 primary family & medical contacts ready' },
    { name: 'Emergency Plans', score: 95, detail: '5 crisis blueprints configured' },
    { name: 'Insurance', score: 90, detail: 'Automobile, health, and home policies active' },
    { name: 'Profile', score: 98, detail: 'Key personal identity and vehicle details verified' }
  ],
  improvements: [
    'Vehicle insurance renewal approaching in October',
    'Emergency contact Maya Vance needs phone verification',
    'Travel emergency plan review overdue by 3 months'
  ]
};
