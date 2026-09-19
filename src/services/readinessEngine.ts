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
    const hasIdentity = documents.some((d) => d.category === 'Identity');
    const hasMedical = documents.some((d) => d.category === 'Medical');
    const hasInsurance = documents.some((d) => d.category === 'Insurance');
    const hasCritical = documents.some((d) => d.emergencyRelevance === 'Critical');

    if (documents.length === 0) {
      docScore = 0;
      improvements.push('Upload essential identity, medical, and insurance documents to your Shadow Vault.');
    } else {
      if (!hasIdentity) {
        docScore -= 20;
        improvements.push('Add an official government ID or passport to your vault.');
      }
      if (!hasMedical) {
        docScore -= 25;
        improvements.push('Add medical directives and blood type records for emergency triage.');
      }
      if (!hasInsurance) {
        docScore -= 20;
        improvements.push('Upload active health or vehicle insurance policies.');
      }
      if (!hasCritical) {
        docScore -= 15;
      }
      if (documents.length < 5) {
        docScore -= 10;
        improvements.push('Add secondary property, vehicle registration, and emergency records.');
      }
    }
    docScore = Math.max(15, Math.min(100, docScore));

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
    contactScore = Math.max(10, Math.min(100, contactScore));

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
    planScore = Math.max(20, Math.min(100, planScore));

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
      insScore -= 40;
      improvements.push('Add your health, automobile, or property insurance policy documents.');
    }
    if (assets.length > 0 && insuredAssets.length < assets.length) {
      insScore -= (assets.length - insuredAssets.length) * 15;
      improvements.push('Attach insurance coverage numbers to all registered physical assets.');
    }
    if (assets.length === 0) {
      insScore -= 10;
    }
    insScore = Math.max(15, Math.min(100, insScore));

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
    profScore = Math.max(20, Math.min(100, profScore));

    const profCategory: ReadinessCategory = {
      name: 'Profile',
      score: profScore,
      contribution: '+20% of total score',
      detail: profile.bloodGroup ? `Blood Type: ${profile.bloodGroup}` : 'Incomplete profile',
      reason: profScore >= 85
        ? `Core personal identity, emergency blood group (${profile.bloodGroup || 'O+'}), and health directives up to date.`
        : 'Update blood markers and emergency directives in Settings to ensure medical safety.'
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
