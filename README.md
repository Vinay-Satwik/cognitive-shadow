# Cognitive Shadow

> *"When you can't think, your Shadow does."*

**Cognitive Shadow** is a personal crisis operating system designed for proactive readiness and rapid, calm coordination during personal emergencies. 

In normal life, the user organizes their documents, emergency contacts, assets, and contingency plans. When a crisis occurs, the user tells their Shadow what happened. Cognitive Shadow dynamically switches context, eliminates informational noise, and surfaces only the specific records, contacts, and tasks needed for that incident.

---

## Core Principle: Contextual Information Reduction

In a high-stress emergency, too much information is paralyzing. Cognitive Shadow filters noise down to only actionable essentials:

```
12 stored documents    →    3 relevant critical documents
 4 emergency contacts  →    2 relevant people
 5 emergency plans     →    1 active crisis scenario
```

---

## Key Features

### Normal Mode (Calm & Organized)
- **Personal Dashboard**: Greeting ("Good evening, Alex. Your Shadow is standing by"), readiness metric (`94% READY`), summary metrics, attention items, and quick emergency plan triggers.
- **My Documents**: Categorized repository (Identity, Medical, Insurance, Vehicle, Property) with expiration tracking and linked assets. No enterprise or fake cryptographic jargon.
- **My Assets**: Cataloged property (Honda City, iPhone 16 Pro, MacBook Pro, Apartment) with active warranty and insurance policy linkages.
- **Emergency Contacts**: Clean directory of personal proxies (Rahul Morgan, Priya Morgan, Dr. Mehta) with verified statuses and direct communication lines.
- **Emergency Plans**: Blueprints for 5 key emergencies answering three foundational questions:
  1. *What information matters?*
  2. *Who matters?*
  3. *What needs to be done?*
- **Shadow Readiness**: Clean 94% preparedness audit across documents, contacts, plans, insurance, and personal profile, with actionable improvement suggestions.
- **Crisis Simulator**: Interactive demonstration showcasing the before-and-after contextual reduction principle (*"Your Shadow doesn't show everything. It shows what matters"*).

### Crisis Mode (Focused & Action-Oriented)
- **State Shift**: Activating a scenario shifts the entire application into high-contrast Crisis Mode with a restrained emergency crimson accent. Normal navigation disappears, replaced exclusively by crisis coordination views.
- **Crisis Command Center**: Real-time incident hub featuring the Emergency Brief snapshot, surfaced records, and active task progress.
- **Emergency Brief (`/crisis/brief`)**: Printable and scannable dossier titled *"WHAT YOU NEED TO KNOW RIGHT NOW"*, ready for first responders, medical staff, and family. Includes one-click Copy and Print actions.
- **Priority Tasks (`/crisis/tasks`)**: Interactive task queue with real-time state updates (`Pending` → `In Progress` → `Completed`) and claim/reassign actions.
- **People (`/crisis/people`)**: Strictly filtered roster showing only the contacts relevant to the active scenario with direct call and email actions.
- **Relevant Documents (`/crisis/documents`)**: Contextual view displaying only the records needed for the incident, with modal detail inspection and copy shortcuts.
- **Secure Access (`/crisis/access`)**: Application-level temporary access management enabling creation and revocation of time-limited sharing records (e.g. 24-hour access for adjusters or hospital desks).
- **Crisis Timeline (`/crisis/timeline`)**: Automatic, chronological event stream recording activation, task completions, and access delegations.
- **End Crisis**: Confirmed modal exit that expires temporary shares, archives the crisis session, restores normal navigation, and returns the user to calm standby (*"Your Shadow is dormant again"*).

---

## Supported Emergency Scenarios

The platform is driven by a reusable **Context Engine** (`src/lib/crisisEngine.ts`) supporting:
1. 🚗 **Major Automobile Accident**: Honda City vehicle documents, National Insurance claims desk, roadside family coordination.
2. 🏥 **Critical Medical Emergency**: Medical summary, penicillin allergy directive, health insurance cashless card, Dr. Mehta consultation.
3. 🏠 **Home / Property Emergency**: Residential apartment deed, homeowner insurance claims, building utilities coordination.
4. ✈️ **Travel Emergency**: International passport, travel medical helpline, embassy coordination, duplicate card protection.
5. 🪪 **Identity / Document Loss**: Online police reports, remote iPhone 16 Pro device lock via Find My, duplicate license application.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router v7

---

## Project Structure

```
CognitiveShadow/
├── src/
│   ├── components/
│   │   ├── crisis/
│   │   │   └── EndCrisisModal.tsx       # Standby restoration confirmation
│   │   └── layout/
│   │       ├── AppLayout.tsx            # Main shell with responsive containers
│   │       ├── Sidebar.tsx              # Adaptive navigation (Normal vs Crisis)
│   │       ├── Topbar.tsx               # Status indicators & action controls
│   │       └── MobileNav.tsx            # Framer Motion mobile slide-out drawer
│   ├── context/
│   │   └── AppContext.tsx               # Reactive crisis state machine
│   ├── data/
│   │   ├── demoData.ts                  # Clean personal mock data (Alex Morgan)
│   │   └── crisisScenarios.ts           # Complete scenario definitions
│   ├── lib/
│   │   ├── crisisEngine.ts              # Contextual information reduction engine
│   │   └── utils.ts                     # Tailwind class merger utility
│   ├── pages/
│   │   ├── crisis/                      # Crisis-specific views
│   │   │   ├── CrisisOverview.tsx       # Crisis Command Center
│   │   │   ├── CrisisTasks.tsx          # Interactive task queue
│   │   │   ├── CrisisPeople.tsx         # Filtered scenario contacts
│   │   │   ├── CrisisDocuments.tsx      # Filtered scenario documents
│   │   │   ├── CrisisAccess.tsx         # Temporary access manager
│   │   │   └── CrisisTimeline.tsx       # Event audit log
│   │   ├── Landing.tsx                  # Public visual north star
│   │   ├── Dashboard.tsx                # Personal command surface
│   │   ├── ShadowVault.tsx              # My Documents repository
│   │   ├── Assets.tsx                   # My Assets catalog
│   │   ├── EmergencyContacts.tsx        # Emergency contacts directory
│   │   ├── EmergencyPlans.tsx           # Emergency plan blueprints
│   │   ├── Readiness.tsx                # Readiness audit breakdown
│   │   ├── CrisisSimulator.tsx          # Before/after sandbox demonstration
│   │   ├── CrisisActivation.tsx         # Pre-activation "What happened?" review
│   │   ├── EmergencyBrief.tsx           # Printable emergency handover dossier
│   │   └── Settings.tsx                 # Personal preferences & check-ins
│   ├── types/
│   │   └── index.ts                     # Core TypeScript interfaces
│   ├── App.tsx                          # Complete route registry
│   ├── index.css                        # Design system tokens & grid background
│   └── main.tsx                         # React root entrypoint
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Local Setup & Development

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation
```bash
# Clone repository
git clone <repository-url>
cd CognitiveShadow

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## Build & Production Verification

```bash
# Type-check and production build
npm run build

# Preview production build
npm run preview
```
