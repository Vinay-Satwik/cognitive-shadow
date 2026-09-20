/**
 * Cognitive Shadow Readiness Engine
 * 
 * Computes deterministic preparedness scores and category breakdowns
 * directly from live user data (documents, contacts, assets, plans, profile).
 */

import {
  Document,
  Asset,
  EmergencyContact,
  EmergencyPlan,
  UserProfile,
  ReadinessOverview,
  ReadinessCategory
} from '../types';

export const readinessEngine = {
  calculate(
    documents: Document[],
    assets: Asset[],
    contacts: EmergencyContact[],
    plans: EmergencyPlan[],
    profile: UserProfile
  ): ReadinessOverview {
    const improvements: string[] = [];

    // 1. Documents Score Calculation (Weight: 20%)
    let docScore = 100;
    const documentText = (d: Document) => `${d.name || ''} ${d.description || ''}`.toLowerCase();
    const hasIdentity = documents.some((d) =>
      d.category === 'Identity' || /passport|identity|aadhaar|aadhar|driving licence|driver license|pan card|government id/.test(documentText(d))
    );
    const hasMedical = documents.some((d) =>
      d.category === 'Medical' || /medical|health|blood|allerg|directive|prescription|hospital|medication/.test(documentText(d))
    );
    const hasInsurance = documents.some((d) =>
      d.category === 'Insurance' || /insurance|policy|insurer|coverage/.test(documentText(d))
    );
    const hasCritical = documents.some((d) => d.emergencyRelevance === 'Critical');
    const hasProfileMedicalData = Boolean(
      profile.bloodGroup?.trim() && (profile.medicalNotes?.trim() || profile.emergencyDirective?.trim())
    );
    const hasMedicalCoverage = hasMedical || hasProfileMedicalData;

    if (documents.length === 0) {
      docScore = 0;
      improvements.push('Upload essential identity, medical, and insurance documents to your Shadow Vault.');
    } else {
      if (!hasIdentity) {
        docScore -= 20;
        improvements.push('Add an official government ID or passport to your vault.');
      }
      if (!hasMedicalCoverage) {
        docScore -= 25;
        improvements.push(
          hasProfileMedicalData
            ? 'Upload a supporting medical document for emergency triage.'
            : 'Add blood type and medical directive information for emergency triage.'
        );
      }
      if (!hasInsurance) {
        docScore -= 20;
        improvements.push('Upload active health or vehicle insurance policies.');
      }
      if (!hasCritical) {
        docScore -= 15;
      }

    }
    docScore = Math.max(0, Math.min(100, docScore));

    const docCategory: ReadinessCategory = {
      name: 'Documents',
      score: docScore,
      contribution: '+20% of total score',
      detail: `${documents.length} records in personal vault`,
      reason: docScore >= 90
        ? `${documents.length} essential records stored and verified; Medical directive, RC, and Passport active.`
        : `${documents.length} records registered. Critical coverage can be strengthened.`
    };

    // 2. Contacts Score Calculation (Weight: 20%)
    let contactScore = 100;
    const primaryContact = contacts.find((c) => c.primary);
    const medicalProxy = contacts.find((c) => c.medicalProxy);
    const verifiedContacts = contacts.filter((c) => c.verified);

    if (contacts.length === 0) {
      contactScore = 0;
      improvements.push('Add at least one trusted primary emergency contact.');
    } else {
      if (!primaryContact) {
        contactScore -= 35;
        improvements.push('Designate a Primary Proxy who receives first notification during a crisis.');
      }
      if (!medicalProxy) {
        contactScore -= 20;
        improvements.push('Designate a Medical Proxy authorized to consult with attending physicians.');
      }
      if (contacts.length < 2) {
        contactScore -= 15;
        improvements.push('Add a secondary alternate contact in case your primary proxy is unavailable.');
      }
      if (verifiedContacts.length < contacts.length) {
        const unverifiedCount = contacts.length - verifiedContacts.length;
        contactScore -= unverifiedCount * 5;
      }
    }
    contactScore = Math.max(0, Math.min(100, contactScore));

    const contactCategory: ReadinessCategory = {
      name: 'Contacts',
      score: contactScore,
      contribution: '+20% of total score',
      detail: primaryContact ? `Primary: ${primaryContact.name}` : 'No primary proxy designated',
      reason: primaryContact
        ? `Primary proxy ${primaryContact.name} confirmed with ${primaryContact.availability}; Care circle linked.`
        : 'Primary proxy designation required for emergency dispatch.'
    };

    // 3. Emergency Plans Score Calculation (Weight: 20%)
    let planScore = 100;
    if (plans.length === 0) {
      planScore = 0;
      improvements.push('Configure at least one contingency blueprint (Automobile, Medical, or Property).');
    } else {
      const incompletePlans = plans.filter(
        (p) => p.defaultTasks.length === 0 || p.relevantContacts.length === 0
      );
      if (incompletePlans.length > 0) {
        planScore -= incompletePlans.length * 12;
        improvements.push(`Complete action tasks and contact delegations for ${incompletePlans[0].name}.`);
      }
      if (plans.length < 4) {
        planScore -= (4 - plans.length) * 8;
      }
    }
    planScore = Math.max(0, Math.min(100, planScore));

    const planCategory: ReadinessCategory = {
      name: 'Emergency Plans',
      score: planScore,
      contribution: '+20% of total score',
      detail: `${plans.length} contingency blueprints mapped`,
      reason: `${plans.length} comprehensive response blueprints mapped with task sequences and sharing rules.`
    };

    // 4. Insurance Score Calculation (Weight: 20%)
    let insScore = 100;
    const insuredAssets = assets.filter(
      (a) => a.insurance && a.insurance.toLowerCase() !== 'none' && a.insurance.trim() !== ''
    );
    const insuranceDocs = documents.filter((d) => d.category === 'Insurance');

    if (insuranceDocs.length === 0) {
      insScore = 0;
      improvements.push('Upload at least one active insurance policy document.');
    } else if (assets.length > 0 && insuredAssets.length < assets.length) {
      insScore = Math.max(0, 100 - (assets.length - insuredAssets.length) * 15);
      improvements.push('Attach insurance coverage details to all registered physical assets.');
    }

    const insCategory: ReadinessCategory = {
      name: 'Insurance',
      score: insScore,
      contribution: '+20% of total score',
      detail: `${insuranceDocs.length} policies on file`,
      reason: insScore >= 85
        ? 'Automobile, health, and home policies active. Protection verified across physical assets.'
        : 'Ensure all registered vehicles, homes, and health items have active insurance records.'
    };

    // 5. Profile Score Calculation (Weight: 20%)
    let profScore = 100;
    if (!profile.name || profile.name.trim() === '') profScore -= 25;
    if (!profile.bloodGroup || profile.bloodGroup.trim() === '') {
      profScore -= 25;
      improvements.push('Specify your emergency blood group in Profile Settings.');
    }
    if (!profile.allergies || profile.allergies.trim() === '') {
      profScore -= 20;
      improvements.push('Document critical allergies and medical contraindications.');
    }
    if (!profile.medicalNotes && !profile.emergencyDirective) {
      profScore -= 15;
    }
    profScore = Math.max(0, Math.min(100, profScore));

    const profCategory: ReadinessCategory = {
      name: 'Profile',
      score: profScore,
      contribution: '+20% of total score',
      detail: profile.bloodGroup ? `Blood Type: ${profile.bloodGroup}` : 'Incomplete profile',
      reason: profScore >= 85
        ? `Core identity, emergency blood group (${profile.bloodGroup}), and medical directives are up to date.`
        : 'Complete blood group, allergy, and medical directive information in Settings.'
    };

    // Overall Weighted Average
    const categories = [docCategory, contactCategory, planCategory, insCategory, profCategory];
    const overallScore = Math.round(
      (docScore + contactScore + planScore + insScore + profScore) / 5
    );

    let subtitle = 'Optimal Standby Readiness';
    if (overallScore < 70) subtitle = 'Action Required';
    else if (overallScore < 85) subtitle = 'Adequate Standby Readiness';

    return {
      overallScore,
      subtitle,
      categories,
      improvements: improvements.slice(0, 3)
    };
  }
};
