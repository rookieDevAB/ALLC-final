/**
 * seed-services.js
 * Seeds all 9 clinic programs + their pathways into the DB.
 * priceRs = 0 means "no price / contact us" (e.g. Kitchen Cure).
 * Run: node prisma/seed-services.js
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const services = [
  {
    id: '00',
    programNumber: 'CONSULTATION',
    title: 'Lifestyle Consultation',
    subtitle: 'Initial Assessment →',
    category: 'DIAGNOSTIC & ADVISORY',
    description: 'A deep-dive, expert-led health assessment including a 20-minute physiotherapy session and a comprehensive prescription.',
    outcomes: ['1:1 Expert Consultation', '20-minute physiotherapy session', 'Detailed prescription (4–22 pages)', 'Clear next steps for your health journey'],
    sortOrder: 0,
    pathways: [
      { id: 'ind-ess',   name: 'Essential',         duration: '60 Min',  description: 'First-time individual consultation.',           priceRs: 5000  },
      { id: 'ind-comp',  name: 'Comprehensive',     duration: '90 Min',  description: 'Ideal for most individual patients.',           priceRs: 7500  },
      { id: 'ind-prem',  name: 'Premium',           duration: '120 Min', description: 'Ideal for complex conditions.',                 priceRs: 12500 },
      { id: 'part-ess',  name: 'Partner Essential', duration: '90 Min',  description: 'Budget-friendly couples.',                      priceRs: 8500  },
      { id: 'part-comp', name: 'Partner Comp.',     duration: '120 Min', description: 'Ideal for most couples.',                       priceRs: 12500 },
      { id: 'part-prem', name: 'Partner Premium',   duration: '150 Min', description: 'Deep transformation for couples.',             priceRs: 22500 },
    ],
  },
  {
    id: '01',
    programNumber: 'PROGRAM 01',
    title: '90-Day Lifestyle Program',
    subtitle: 'From Normal To Optimal →',
    category: 'PREVENTIVE & LIFESTYLE MEDICINE',
    description: 'Feeling unwell despite "normal" reports? This structured program identifies root causes and rebuilds your health across all 6 pillars.',
    outcomes: ['1:1 expert consultations', 'Fully personalized health blueprint', 'Daily accountability support', 'Lifetime usable resources'],
    sortOrder: 1,
    pathways: [
      { id: '01-ind',    name: 'Individual', duration: '3 Months', description: 'Personalized 1-on-1 lifestyle transformation.',              priceRs: 75000  },
      { id: '01-couple', name: 'Couples',    duration: '3 Months', description: 'Transform together with shared accountability.',             priceRs: 125000 },
    ],
  },
  {
    id: '02',
    programNumber: 'PROGRAM 02',
    title: 'Diabetes Reversal Program',
    subtitle: 'Decode & Restructure →',
    category: 'DIABETES REVERSAL PROGRAM',
    description: 'A science-backed, doctor-led program designed to help you understand your diabetes, reduce medications safely, and achieve long-term control—naturally.',
    outcomes: ['Better blood sugar control', 'Reduced or eliminated medications', 'Improved energy, weight & confidence', 'A sustainable, healthy lifestyle'],
    sortOrder: 2,
    pathways: [
      { id: '02-ind',     name: 'Individual',              duration: '12 Months', description: 'Includes Continuous Glucose Support.',                   priceRs: 375000 },
      { id: '02-c-both',  name: 'Couples (Both Diabetic)', duration: '12 Months', description: 'Includes Continuous Glucose Support for both.',           priceRs: 595000 },
      { id: '02-c-mixed', name: 'Couples (1 Preventive)',  duration: '12 Months', description: '1 Diabetic + 1 Preventive partner.',                     priceRs: 495000 },
    ],
  },
  {
    id: '03',
    programNumber: 'PROGRAM 03',
    title: 'Metabolic Liberation',
    subtitle: 'Obesity & Weight →',
    category: 'OBESITY & WEIGHT MANAGEMENT',
    description: 'Not weight loss. A complete biological transformation.',
    outcomes: ['Permanent fat mass reduction', 'Increased lean muscle tissue', 'Healed relationship with food', 'Restored metabolic flexibility'],
    sortOrder: 3,
    pathways: [
      { id: '03-ind',    name: 'Individual', duration: '6 Months', description: 'Dedicated personal biological transformation.',             priceRs: 130000 },
      { id: '03-couple', name: 'Couples',    duration: '6 Months', description: 'Transform together with shared accountability.',            priceRs: 195000 },
    ],
  },
  {
    id: '04',
    programNumber: 'PROGRAM 04',
    title: 'Hormonal Harmony',
    subtitle: 'PCOD Management →',
    category: 'PCOD & HORMONE MANAGEMENT',
    description: 'Restore your cycle. Reclaim your energy.',
    outcomes: ['Regulated natural cycles', 'Cleared hormonal acne', 'Eliminated chronic fatigue', 'Balanced mood & emotional stability', 'Improved energy within weeks', 'Sustainable hormonal health for life'],
    sortOrder: 4,
    pathways: [
      { id: '04-c',  name: 'Androgen Phenotype',  duration: '9 Months',  description: 'Acne · Hair growth · Hormonal balance.',                                                priceRs: 120000 },
      { id: '04-d',  name: 'Cycle Phenotype',     duration: '9 Months',  description: 'Regular periods · Ovulation · Fertility.',                                              priceRs: 120000 },
      { id: '04-ab', name: 'Metabolic Phenotype', duration: '12 Months', description: 'Insulin resistance, weight gain, irregular periods, skin changes.',                    priceRs: 160000 },
    ],
  },
  {
    id: '05',
    programNumber: 'PROGRAM 05',
    title: 'The Liver Renewal Protocol',
    subtitle: 'Liver Detoxification →',
    category: 'LIVER DETOXIFICATION & REPAIR',
    description: 'Reverse the damage. Rebuild from within.',
    outcomes: ['Reversed fatty liver markers', 'Normalized liver enzymes', 'Enhanced natural detoxification', 'Reduced systemic inflammation', 'Improved energy & metabolic health', 'Sustainable liver protection for life'],
    sortOrder: 5,
    pathways: [
      { id: '05-path-a', name: 'Path A: Early Stage (F0–F1)',    duration: '6 Months', description: 'Fatty liver, no major scarring. Complete reversal achievable.',                    priceRs: 100000 },
      { id: '05-path-b', name: 'Path B: Moderate Stage (F2–F3)', duration: '6 Months', description: 'Moderate to advanced fibrosis. Measurable recovery in 70%+ patients.',             priceRs: 160000 },
      { id: '05-path-c', name: 'Path C: Advanced Stage (F4)',    duration: '6 Months', description: 'Cirrhosis stage. Reduce complications, improve quality of life significantly.',    priceRs: 210000 },
    ],
  },
  {
    id: '06',
    programNumber: 'PROGRAM 06',
    title: 'Metabolic Reawakening',
    subtitle: 'Marker Correction →',
    category: 'CLINICAL MARKER CORRECTION',
    description: 'One protocol. Every marker, corrected.',
    outcomes: ['Optimized lipid profiles', 'Lowered inflammatory markers', 'Reduced cardiovascular risk', 'Crystal-clear laboratory results', 'Improved blood pressure, sugar & cholesterol', 'Sustainable metabolic freedom for life'],
    sortOrder: 6,
    pathways: [
      { id: '06-ind',    name: 'Stages (0-4)',              duration: '12 Months', description: 'Individual metabolic syndrome correction program.',   priceRs: 160000 },
      { id: '06-couple', name: 'Both in program (any stage)', duration: '12 Months', description: 'Couple Pricing.',                                    priceRs: 280000 },
    ],
  },
  {
    id: '07',
    programNumber: 'PROGRAM 07',
    title: 'The Thyroid Renaissance',
    subtitle: 'Thyroid Management →',
    category: 'THYROID OPTIMIZATION PROGRAM',
    description: 'Restore your thyroid. Reclaim your energy. Redefine your life.',
    outcomes: ['Optimal T3 conversion', 'Reduced autoimmune antibodies', 'Eliminated cold intolerance', 'Restored metabolic speed', 'Improved energy, sleep & focus', 'Sustainable weight management'],
    sortOrder: 7,
    pathways: [
      { id: '07-std', name: 'Standard Program', duration: '12 Months', description: 'Full thyroid restoration program supervised by Dr. Divya Gautam.', priceRs: 160000 },
    ],
  },
  {
    id: '08',
    programNumber: 'PROGRAM 08',
    title: 'The Kitchen Cure',
    subtitle: 'Culinary Intelligence →',
    category: 'CULINARY INTELLIGENCE PROGRAM',
    description: 'Your home is your first clinic. We transform it.',
    outcomes: ['A kitchen built for healing', 'Sustainable healthy cooking', 'No more restrictive diets', 'Condition-specific nutrition'],
    sortOrder: 8,
    pathways: [
      // priceRs: 0 → UI will show "Contact Us" instead of Add to Cart
      { id: '08-consult', name: 'Personalised Program', duration: 'Custom', description: 'Price by consultation. Contact us to know more.', priceRs: 0 },
    ],
  },
];

async function main() {
  console.log('🌱  Seeding services & pathways…');

  for (const svc of services) {
    const { pathways, ...serviceData } = svc;

    // Upsert service
    await prisma.service.upsert({
      where: { id: serviceData.id },
      update: { ...serviceData, outcomes: serviceData.outcomes },
      create: { ...serviceData, outcomes: serviceData.outcomes },
    });

    // Upsert each pathway
    for (const pw of pathways) {
      await prisma.servicePathway.upsert({
        where: { id: pw.id },
        update: { ...pw, serviceId: serviceData.id },
        create: { ...pw, serviceId: serviceData.id },
      });
    }

    console.log(`  ✅  ${serviceData.programNumber} — ${serviceData.title} (${pathways.length} pathways)`);
  }

  console.log('\n✅  Done! Services seeded successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
