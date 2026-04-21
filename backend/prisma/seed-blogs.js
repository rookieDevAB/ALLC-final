/* global process */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demoPosts = [
  // ── Health Articles ───────────────────────────────────────────────────────
  {
    title: 'Understanding Diabetes: Prevention & Lifestyle Management',
    shortDescription:
      'A comprehensive guide to understanding Type 2 Diabetes, its risk factors, and evidence-based strategies for prevention and daily management.',
    content: `<h2>What is Type 2 Diabetes?</h2>
<p>Type 2 diabetes is a chronic condition affecting how your body processes blood sugar (glucose). Unlike Type 1, it can often be prevented or delayed with healthy lifestyle choices.</p>
<h2>Key Risk Factors</h2>
<ul>
  <li>Excess body weight, especially around the abdomen</li>
  <li>Physical inactivity — less than 150 minutes of moderate exercise per week</li>
  <li>Family history and genetics</li>
  <li>Age over 45, though it increasingly affects younger adults</li>
  <li>High blood pressure and abnormal cholesterol levels</li>
</ul>
<h2>Prevention Strategies</h2>
<p>Research shows that losing just 5–7% of body weight and exercising 30 minutes a day, five days a week, reduces diabetes risk by up to 58%.</p>
<h3>Dietary Recommendations</h3>
<ul>
  <li>Choose whole grains over refined carbohydrates</li>
  <li>Include plenty of non-starchy vegetables</li>
  <li>Limit sugary beverages and ultra-processed foods</li>
  <li>Opt for healthy fats like those found in nuts, seeds, and olive oil</li>
</ul>
<h2>Monitoring Your Health</h2>
<p>Regular HbA1c tests, fasting blood glucose checks, and annual eye and foot exams are essential for anyone diagnosed with or at risk of diabetes.</p>`,
    category: 'Health Article',
    author: 'Dr. Divya Gautam',
    coverImage: 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=800&auto=format&fit=crop',
    tags: ['diabetes', 'prevention', 'lifestyle', 'nutrition'],
    published: true,
    date: new Date('2024-12-05'),
  },
  {
    title: 'Heart Health: 10 Evidence-Based Tips to Protect Your Cardiovascular System',
    shortDescription:
      'Heart disease remains the leading cause of death worldwide. Discover ten actionable, science-backed habits that dramatically reduce your cardiovascular risk.',
    content: `<h2>Why Heart Health Matters</h2>
<p>Cardiovascular disease accounts for nearly 17.9 million deaths globally each year. The good news: up to 80% of premature heart disease and stroke is preventable through healthy lifestyle choices.</p>
<h2>10 Evidence-Based Tips</h2>
<ol>
  <li><strong>Quit smoking</strong> — Risk of heart disease halves within a year of quitting.</li>
  <li><strong>Control blood pressure</strong> — Aim for below 120/80 mmHg.</li>
  <li><strong>Manage cholesterol</strong> — Keep LDL low with diet and, if needed, medication.</li>
  <li><strong>Exercise regularly</strong> — At least 150 minutes of moderate aerobic activity weekly.</li>
  <li><strong>Eat a heart-healthy diet</strong> — Mediterranean style, rich in fruits, vegetables, whole grains, and fish.</li>
  <li><strong>Maintain a healthy weight</strong> — Even modest weight loss improves cardiac markers.</li>
  <li><strong>Limit alcohol</strong> — No more than one drink per day for women, two for men.</li>
  <li><strong>Manage stress</strong> — Chronic stress elevates cortisol and blood pressure.</li>
  <li><strong>Get quality sleep</strong> — 7–9 hours per night reduces inflammation markers.</li>
  <li><strong>Monitor blood sugar</strong> — Diabetes doubles the risk of cardiovascular disease.</li>
</ol>
<h2>When to See a Doctor</h2>
<p>Contact your physician immediately if you experience chest pain, shortness of breath, pain radiating to the arm or jaw, or sudden dizziness.</p>`,
    category: 'Health Article',
    author: 'Dr. Divya Gautam',
    coverImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop',
    tags: ['heart health', 'cardiology', 'prevention', 'exercise'],
    published: true,
    date: new Date('2024-11-18'),
  },

  // ── Tips ──────────────────────────────────────────────────────────────────
  {
    title: '5 Simple Morning Habits That Boost Your Immunity',
    shortDescription:
      'Starting your day right can significantly strengthen your immune defenses. These five easy morning habits are backed by science and take less than 30 minutes total.',
    content: `<h2>Why Mornings Matter for Immunity</h2>
<p>Your immune system is deeply tied to your circadian rhythm. Consistent morning routines help regulate cortisol, improve gut health, and prime your body's natural defenses.</p>
<h2>Habit 1: Hydrate Before Coffee</h2>
<p>Drink 400–500 ml of water first thing in the morning. Overnight dehydration impairs lymphatic drainage and reduces white blood cell efficiency.</p>
<h2>Habit 2: Get 10 Minutes of Sunlight</h2>
<p>Early morning sunlight triggers Vitamin D synthesis and helps regulate melatonin, which in turn supports immune cell production.</p>
<h2>Habit 3: Eat a High-Protein Breakfast</h2>
<p>Amino acids from protein are the building blocks of antibodies. Eggs, Greek yogurt, or lentils are excellent choices.</p>
<h2>Habit 4: Light Movement or Stretching</h2>
<p>A brisk 10-minute walk or gentle yoga activates lymphatic circulation, which carries immune cells throughout the body.</p>
<h2>Habit 5: Add Ginger or Turmeric to Your Morning Drink</h2>
<p>Both contain potent anti-inflammatory compounds — gingerol and curcumin — shown in studies to enhance natural killer cell activity.</p>`,
    category: 'Tip',
    author: 'Dr. Divya Gautam',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
    tags: ['immunity', 'morning routine', 'wellness', 'tips'],
    published: true,
    date: new Date('2025-01-10'),
  },
  {
    title: 'Managing Screen Time: Protecting Your Eyes in the Digital Age',
    shortDescription:
      'Most adults spend 10+ hours daily on screens. Learn practical, ophthalmologist-approved techniques to protect your vision and reduce digital eye strain.',
    content: `<h2>The Digital Eye Strain Epidemic</h2>
<p>Digital Eye Strain (DES), also called Computer Vision Syndrome, affects over 60% of regular screen users. Symptoms include dry eyes, blurred vision, headaches, and neck pain.</p>
<h2>The 20-20-20 Rule</h2>
<p>Every <strong>20 minutes</strong>, look at something <strong>20 feet away</strong> for at least <strong>20 seconds</strong>. This simple habit relaxes the ciliary muscles in your eyes and dramatically reduces fatigue.</p>
<h2>Optimize Your Workspace</h2>
<ul>
  <li>Position your screen 50–70 cm from your eyes</li>
  <li>The top of the monitor should be at or just below eye level</li>
  <li>Reduce glare with matte screen protectors or anti-reflective glasses</li>
  <li>Match screen brightness to ambient light</li>
</ul>
<h2>Blink Consciously</h2>
<p>We blink 66% less often when staring at screens. Set a reminder to blink fully every few minutes, and use preservative-free artificial tears if needed.</p>
<h2>Blue Light Considerations</h2>
<p>Enable "Night Mode" on your devices after sunset. While evidence on blue light glasses is mixed, reducing screen use 1–2 hours before bed significantly improves sleep quality.</p>`,
    category: 'Tip',
    author: 'Dr. Divya Gautam',
    coverImage: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=800&auto=format&fit=crop',
    tags: ['eye health', 'screen time', 'digital wellness', 'tips'],
    published: true,
    date: new Date('2025-02-14'),
  },

  // ── Events ────────────────────────────────────────────────────────────────
  {
    title: 'Free Health Screening Camp — April 2025',
    shortDescription:
      'Join us for a free community health screening camp this April covering blood pressure, blood sugar, BMI, and vision checks. Open to all ages.',
    content: `<h2>About the Event</h2>
<p>ALLC Clinic is proud to organize its quarterly <strong>Free Health Screening Camp</strong> for the community. This event is completely free of charge and open to individuals of all ages.</p>
<h2>What's Included</h2>
<ul>
  <li>Blood pressure measurement</li>
  <li>Random blood glucose test</li>
  <li>BMI and obesity risk assessment</li>
  <li>Basic vision screening</li>
  <li>One-on-one consultation with Dr. Divya Gautam</li>
  <li>Personalized health advice and referrals if needed</li>
</ul>
<h2>Event Details</h2>
<p><strong>Date:</strong> Saturday, 26th April 2025</p>
<p><strong>Time:</strong> 9:00 AM – 1:00 PM</p>
<p><strong>Venue:</strong> ALLC Clinic, Ground Floor, Community Hall</p>
<h2>How to Register</h2>
<p>Walk-ins are welcome, but pre-registration is encouraged to avoid waiting. Contact our reception at reception@asianllc.com or call during clinic hours.</p>
<blockquote>No appointment needed. Bring a valid ID. Fasting is not required for this screening.</blockquote>`,
    category: 'Event',
    author: 'Dr. Divya Gautam',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop',
    tags: ['health camp', 'free screening', 'community', 'event'],
    published: true,
    date: new Date('2025-04-10'),
  },
  {
    title: 'World Health Day Celebration at ALLC Clinic — April 7th',
    shortDescription:
      'Celebrate World Health Day with us! Activities include health talks, live demos of healthy cooking, yoga sessions, and giveaways for attendees.',
    content: `<h2>Celebrating World Health Day</h2>
<p>Every year on <strong>April 7th</strong>, the world unites to celebrate the founding of the World Health Organization and to draw attention to global health priorities. This year's theme is <em>"My health, my right"</em>.</p>
<h2>Schedule of Events</h2>
<ul>
  <li><strong>8:00 AM</strong> — Morning yoga session (open ground)</li>
  <li><strong>9:30 AM</strong> — Talk: "Preventive Health in the Modern Age" by Dr. Divya Gautam</li>
  <li><strong>11:00 AM</strong> — Live healthy cooking demonstration</li>
  <li><strong>12:30 PM</strong> — Nutrition Q&A panel</li>
  <li><strong>2:00 PM</strong> — Children's health awareness games & activities</li>
  <li><strong>4:00 PM</strong> — Prize draw and giveaways</li>
</ul>
<h2>Who Can Attend?</h2>
<p>This event is open to the entire community — patients, families, students, and anyone interested in improving their health. Entry is free.</p>
<h2>Location</h2>
<p>ALLC Clinic Main Campus, Community Activity Area. Parking is available on-site.</p>`,
    category: 'Event',
    author: 'Dr. Divya Gautam',
    coverImage: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=800&auto=format&fit=crop',
    tags: ['world health day', 'event', 'community', 'wellness'],
    published: true,
    date: new Date('2025-04-01'),
  },

  // ── Seminars ──────────────────────────────────────────────────────────────
  {
    title: 'Seminar: Women\'s Hormonal Health – From Puberty to Menopause',
    shortDescription:
      'An in-depth seminar exploring hormonal changes at every stage of a woman\'s life, from adolescence through menopause, with expert guidance from Dr. Divya Gautam.',
    content: `<h2>Overview</h2>
<p>This educational seminar is designed for women of all ages who want to better understand how hormones affect their physical and mental well-being throughout life.</p>
<h2>Topics Covered</h2>
<h3>Module 1: Hormonal Foundations</h3>
<ul>
  <li>The role of estrogen, progesterone, and testosterone in women</li>
  <li>The menstrual cycle explained — what's normal, what's not</li>
  <li>Managing PMS and PMDD naturally and medically</li>
</ul>
<h3>Module 2: Reproductive Years</h3>
<ul>
  <li>PCOS — Polycystic Ovary Syndrome: diagnosis and management</li>
  <li>Thyroid disorders in women of reproductive age</li>
  <li>Hormonal contraception: benefits and considerations</li>
</ul>
<h3>Module 3: Perimenopause & Menopause</h3>
<ul>
  <li>Recognizing the early signs of perimenopause</li>
  <li>Hot flashes, mood swings, and sleep disruption — clinical approaches</li>
  <li>Hormone Replacement Therapy (HRT): risks, benefits, and alternatives</li>
</ul>
<h2>Registration</h2>
<p>Seats are limited to 40 participants. Pre-registration is mandatory. Please email seminars@asianllc.com to reserve your spot.</p>
<p><strong>Date:</strong> Saturday, 17th May 2025 | 10:00 AM – 1:00 PM</p>`,
    category: 'Seminar',
    author: 'Dr. Divya Gautam',
    coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop',
    tags: ['womens health', 'hormones', 'menopause', 'PCOS', 'seminar'],
    published: true,
    date: new Date('2025-03-20'),
  },
  {
    title: 'Pediatric Nutrition Seminar: Raising Healthy Eaters',
    shortDescription:
      'A practical seminar for parents covering balanced nutrition for children aged 2–16, addressing picky eating, healthy weight, and building lifelong food habits.',
    content: `<h2>About This Seminar</h2>
<p>Good nutrition in childhood sets the foundation for a lifetime of health. This seminar equips parents and caregivers with evidence-based tools to nurture healthy eating habits in children.</p>
<h2>What You Will Learn</h2>
<h3>Nutrition Basics for Growing Children</h3>
<ul>
  <li>Age-appropriate calorie and macronutrient needs</li>
  <li>The importance of iron, calcium, zinc, and Vitamin D in child development</li>
  <li>Reading food labels — what to look for and what to avoid</li>
</ul>
<h3>Tackling Picky Eating</h3>
<ul>
  <li>Why children become picky eaters (developmental vs. sensory reasons)</li>
  <li>Strategies to expand your child's palate without power struggles</li>
  <li>Involving children in meal planning and preparation</li>
</ul>
<h3>Healthy Weight in Childhood</h3>
<ul>
  <li>Understanding BMI-for-age charts</li>
  <li>Addressing childhood obesity without creating disordered eating</li>
  <li>Screen time, sleep, and physical activity — the full picture</li>
</ul>
<h2>Who Should Attend</h2>
<p>Parents, grandparents, school teachers, and anyone involved in feeding or educating children. The seminar is interactive with live Q&A.</p>
<p><strong>Date:</strong> Sunday, 1st June 2025 | 11:00 AM – 1:30 PM | Free Entry</p>`,
    category: 'Seminar',
    author: 'Dr. Divya Gautam',
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop',
    tags: ['pediatric nutrition', 'children', 'parenting', 'seminar', 'healthy eating'],
    published: true,
    date: new Date('2025-05-05'),
  },
];

async function main() {
  console.log('🌱 Seeding demo blog posts...');

  let created = 0;
  let skipped = 0;

  for (const post of demoPosts) {
    const existing = await prisma.blogPost.findFirst({
      where: { title: post.title },
    });

    if (existing) {
      console.log(`  ⏭  Skipped (already exists): "${post.title}"`);
      skipped++;
      continue;
    }

    await prisma.blogPost.create({ data: post });
    console.log(`  ✅ Created: "${post.title}" [${post.category}]`);
    created++;
  }

  console.log(`\n🎉 Done! Created ${created} posts, skipped ${skipped} existing.`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
