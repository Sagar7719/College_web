import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cache } from 'react';
import { sanitizeForFirestore } from '@/lib/firestore-utils';
import {
  HomepageConfigData,
  AboutPageConfigData,
  AdmissionsConfigData,
  ContactPageConfigData,
} from '@/types/enterprise-cms';

// ── Default Rich Enterprise Fallbacks ──

export const defaultHomepageData: HomepageConfigData = {
  id: 'homepage',
  hero: {
    badgeText: "EST. 1972 • NAAC 'A' GRADE",
    headline: 'Empowering Minds, Building Futures',
    subtitle: 'A premier higher education institution dedicated to academic rigor, pioneering research, and holistic student growth.',
    cta1Label: 'Explore Programmes',
    cta1Href: '/courses',
    cta2Label: 'About Our College',
    cta2Href: '/about',
  },
  gatewayCards: [
    { title: 'Academic Degrees', subtitle: 'UG, PG & Doctoral Programmes across Science, Commerce & Arts', ctaLabel: 'Explore', href: '/courses', iconKey: 'GraduationCap', colorVariant: 'Terracotta' },
    { title: 'Admissions 2026', subtitle: 'Online Application Portal, Prospectus & Fee Structure', ctaLabel: 'Apply Now', href: '/admissions', iconKey: 'Megaphone', colorVariant: 'Emerald' },
    { title: 'Departments', subtitle: 'Faculties of Science, Humanities, Commerce & Research Wings', ctaLabel: 'View All', href: '/departments', iconKey: 'Building2', colorVariant: 'Sapphire' },
    { title: 'Academic Bulletins', subtitle: 'Official Circulars, Exam Timetables & University Updates', ctaLabel: 'Circulars', href: '/notices', iconKey: 'FileText', colorVariant: 'Gold' },
  ],
  stats: [
    { label: 'Years of Excellence', valueType: 'auto', suffix: '+' },
    { label: 'Academic Programmes', valueType: 'auto', suffix: '+' },
    { label: 'Departments', valueType: 'auto', suffix: '' },
    { label: 'Faculty Members', valueType: 'auto', suffix: '+' },
  ],
  featurePillars: [
    { title: 'Academic Excellence', subtitle: 'Rigorous curriculum aligned with industry standards', iconKey: 'GraduationCap', colorClass: 'iconTerracotta' },
    { title: 'Experienced Faculty', subtitle: 'Distinguished educators and active researchers', iconKey: 'Users', colorClass: 'iconEmerald' },
    { title: 'Modern Infrastructure', subtitle: 'Tech labs, digital classrooms, and central archive', iconKey: 'Microscope', colorClass: 'iconSapphire' },
    { title: 'Student Success', subtitle: 'Dedicated placement cell and career guidance', iconKey: 'Rocket', colorClass: 'iconGold' },
  ],
  whyChooseUs: [
    { title: 'Academic Excellence', description: 'Comprehensive undergraduate, postgraduate, and diploma courses across diverse faculties.', iconKey: 'BookOpen', colorClass: 'whyTerracotta' },
    { title: 'Expert Faculty', description: 'Accomplished mentors fostering scientific inquiry, critical thinking, and innovation.', iconKey: 'Award', colorClass: 'whyEmerald' },
    { title: 'Modern Laboratories', description: 'State-of-the-art facilities for computer science, physical sciences, and practical research.', iconKey: 'FlaskConical', colorClass: 'whySapphire' },
    { title: 'Placement Support', description: 'Proactive career guidance cell driving campus hiring drives with leading recruiters.', iconKey: 'Briefcase', colorClass: 'whyPurple' },
    { title: 'Holistic Development', description: 'Active NSS, NCC, sports, cultural societies, and community development initiatives.', iconKey: 'Sparkles', colorClass: 'whyGold' },
    { title: 'Vibrant Campus Life', description: 'Engaging student clubs, seminars, annual youth festivals, and academic symposiums.', iconKey: 'Landmark', colorClass: 'whyCrimson' },
  ],
  quickLinks: [
    { label: 'Academic Programmes', href: '/courses', iconKey: 'BookOpen', colorClass: 'qlTerracotta' },
    { label: 'Notices & Circulars', href: '/notices', iconKey: 'Pin', colorClass: 'qlEmerald' },
    { label: 'Downloads Center', href: '/downloads', iconKey: 'FolderDown', colorClass: 'qlSapphire' },
    { label: 'Admissions 2026', href: '/admissions', iconKey: 'GraduationCap', colorClass: 'qlGold' },
    { label: 'Faculty Directory', href: '/faculty', iconKey: 'Users', colorClass: 'qlPurple' },
    { label: 'Events & Seminars', href: '/events', iconKey: 'Calendar', colorClass: 'qlCrimson' },
    { label: 'Campus Gallery', href: '/gallery', iconKey: 'Camera', colorClass: 'qlTeal' },
    { label: 'Contact & Helpline', href: '/contact', iconKey: 'Mail', colorClass: 'qlIndigo' },
  ],
  accreditations: [
    { title: 'Affiliated Institution', subtitle: 'University Recognition', iconKey: 'Landmark' },
    { title: 'UGC Recognized', subtitle: 'Section 2(f) & 12(B)', iconKey: 'CheckCircle2' },
    { title: 'NAAC Accredited', subtitle: 'Quality Benchmark', iconKey: 'Award' },
    { title: 'Established', subtitle: 'Legacy of Learning', iconKey: 'Scroll' },
  ],
  aboutCtaLabel: 'Read More About Us',
  contactSectionTitle: 'Contact Admissions & Helpdesk',
  contactSectionSubtitle: 'Reach out to our administrative team for admission guidance and official inquiries.',
  mapCardTitle: 'Campus Address & Directions',
  mapCardDesc: 'Interactive campus map, building locations, and visiting hours guidance.',
  admissionCtaBadge: 'Admissions 2026–27 Now Open',
  admissionCtaTitle: 'Start Your Academic Journey With Us',
  admissionCtaDesc: 'Applications for the 2026–27 academic session are now open. Secure your admission into our accredited programmes.',
  updatedAt: new Date().toISOString(),
};

export const defaultAboutData: AboutPageConfigData = {
  id: 'about',
  hero: {
    badgeText: 'Established Institution of Academic Excellence',
    title: 'About Jaysingpur College',
    subtitle: 'Established in 1972, our institution stands as a beacon of academic distinction, research innovation, and holistic student empowerment.',
  },
  heroStats: [
    { label: 'NAAC Accredited', sublabel: 'UGC 2(f) & 12(B) Recognized', iconKey: 'Award' },
    { label: '50,000+ Alumni', sublabel: 'Global Professional Network', iconKey: 'GraduationCap' },
    { label: '50+ Years of Legacy', sublabel: 'Established 1972', iconKey: 'Landmark' },
  ],
  legacyOverview: {
    title: 'Institutional Legacy & Heritage',
    description: 'Jaysingpur College is a premier higher education institution dedicated to empowering students through multi-disciplinary academic programmes in Science, Technology, Commerce, and Humanities.',
    highlights: [
      'Affiliated to State Public University with UGC Accreditation.',
      'State-of-the-art computing laboratories and digital library archives.',
      'Proactive Industry Internship & Campus Placement Division.',
    ],
  },
  visionMission: {
    vision: 'To be a center of academic distinction, nurturing scientific inquiry, technological innovation, research excellence, and ethical leadership in every discipline.',
    mission: 'Providing accessible, high-quality higher education tailored to modern societal demands, fostering critical thinking, character building, and career preparedness.',
  },
  principalDesk: {
    name: 'Dr. Sagar Ulagadde',
    designation: 'Principal & Administrative Officer',
    photoUrl: '',
    message: 'Welcome to our esteemed institution. We are committed to fostering academic rigor, ethical values, and research innovation to empower our students for a globally connected world.',
  },
  pillarsTitle: 'Pillars of Academic Distinction',
  pillars: [
    { title: 'NEP Aligned Syllabus', description: 'Choice-based credit systems and outcome-based curriculum designed for modern careers.', iconKey: 'BookOpen' },
    { title: 'Research & Innovation', description: 'Dedicated research labs, funded faculty projects, and national symposium publications.', iconKey: 'Microscope' },
    { title: 'Inclusive & Safe Campus', description: 'Zero-tolerance anti-ragging policy, women empowerment cell, and student counseling.', iconKey: 'ShieldCheck' },
    { title: 'Global Alumni Network', description: 'Active mentorship and campus recruitment by leading industrial and technology recruiters.', iconKey: 'Users' },
  ],
  ctaBannerTitle: 'Become Part of Our Academic Heritage',
  ctaBannerDesc: 'Applications for the 2026–27 academic session are now open across all departments.',
  updatedAt: new Date().toISOString(),
};

export const defaultAdmissionsData: AdmissionsConfigData = {
  id: 'admissions',
  hero: {
    badgeText: 'Admissions Session 2026 – 2027 Now Open',
    title: 'Admission Process & Guidelines',
    subtitle: 'Step-by-step guidance, merit eligibility criteria, fee structures, and document submission portal for prospective students.',
  },
  heroStats: [
    { label: '43+ Accredited', sublabel: 'Degree Programmes', iconKey: 'GraduationCap' },
    { label: 'NAAC Accredited', sublabel: 'UGC 2(f) & 12(B) Recognized', iconKey: 'Award' },
    { label: 'Deadline: Aug 31, 2026', sublabel: 'Application Window Active', iconKey: 'Clock' },
  ],
  applicationDeadline: 'Aug 31, 2026',
  stepsEyebrow: 'Simple 4-Step Process',
  stepsTitle: 'Your Path to Academic Excellence',
  stepsSubtitle: 'Follow these simple steps to complete your admission for the 2026–27 academic year.',
  steps: [
    { title: 'Online Registration', description: 'Register on the online portal, fill in candidate credentials, and select your preferred academic degree course.', iconKey: 'FileText' },
    { title: 'Document Verification', description: 'Upload marksheets, certificates, and ID proofs. Submitted files are verified by the admissions evaluation committee.', iconKey: 'CheckCircle2' },
    { title: 'Merit List & Counseling', description: 'Check published merit lists, attend online or on-campus counseling sessions, and confirm your seat allocation.', iconKey: 'UserCheck' },
    { title: 'Fee Payment & Roll Call', description: 'Complete course fee payment online or at bank counter, receive official admission letter, and collect your student badge.', iconKey: 'Award' },
  ],
  eligibilityTabs: [
    {
      tabKey: 'ug',
      tabLabel: 'Undergraduate (UG)',
      cards: [
        { tag: 'BCA (3 Years)', minMarks: 'Min 45% Marks', title: 'Bachelor of Computer Applications', description: 'Software development, database design, web technologies, and AI fundamentals.', criteria: ['10+2 with Mathematics/Statistics/Information Tech preferred.', 'Merit-based admission + CET counseling.'] },
        { tag: 'B.Sc (3 Years)', minMarks: 'Min 45% Marks', title: 'Bachelor of Science', description: 'Physics, Chemistry, Computer Science, Biotechnology, and Mathematics.', criteria: ['10+2 Science stream from recognized board.', 'Direct merit list seat allocation.'] },
        { tag: 'B.Com (3 Years)', minMarks: 'Min 40% Marks', title: 'Bachelor of Commerce', description: 'Accounting, corporate law, banking, taxation, and business management.', criteria: ['10+2 Commerce / Arts / Science stream.', 'Merit ranking by aggregate score.'] },
      ],
    },
    {
      tabKey: 'pg',
      tabLabel: 'Postgraduate (PG)',
      cards: [
        { tag: 'M.Sc (2 Years)', minMarks: 'Min 50% Marks', title: 'Master of Science (Computer / Chemistry)', description: 'Advanced postgraduate research, algorithmic analysis, and laboratory thesis work.', criteria: ['Bachelor degree in relevant discipline from recognized university.', 'Entrance test + merit scorecard.'] },
        { tag: 'M.Com (2 Years)', minMarks: 'Min 45% Marks', title: 'Master of Commerce', description: 'Advanced financial management, auditing, managerial economics, and research methodology.', criteria: ['B.Com or BBA degree from accredited college.', 'Merit ranking seat allotment.'] },
      ],
    },
    {
      tabKey: 'diploma',
      tabLabel: 'Diploma & Skill Courses',
      cards: [
        { tag: 'Diploma (1 Year)', minMarks: 'Pass 10+2', title: 'Diploma in Web Development & Cloud', description: 'Hands-on practical training in full-stack web engineering, AWS, and UI design.', criteria: ['Open to all 10+2 / HSC graduates.', 'Direct admission + certification.'] },
      ],
    },
  ],
  requiredDocuments: [
    '10th (SSC) & 12th (HSC) Marksheets & Passing Certificates',
    'School / College Leaving Certificate (LC) & Transfer Certificate (TC)',
    'Caste Certificate & Non-Creamy Layer (where applicable)',
    'Nationalized Bank Passbook Copy & Aadhaar Card ID Proof',
    'Recent Passport Size Color Photographs (3 Copies)',
    'Migration Certificate (For candidates outside Maharashtra Board)',
  ],
  schedule: [
    { title: 'Online Application Window Opens', subtitle: 'Registration & Form Submission', date: 'May 15, 2026', status: 'active' },
    { title: 'Document Verification Window', subtitle: 'Admissions Scrutiny Committee', date: 'June 01 – July 31', status: 'progress' },
    { title: 'First Merit List Publication', subtitle: 'Portal & Bulletin Board Release', date: 'August 05, 2026', status: '' },
    { title: 'Seat Allocation & Fee Payment', subtitle: 'Round 1 Enrollment', date: 'August 06 – 12', status: '' },
    { title: 'Commencement of Academic Classes', subtitle: 'Session 2026–27 Begins', date: 'September 01, 2026', status: 'final' },
  ],
  faqs: [
    { question: 'How do I submit my online application form for 2026-27?', answer: 'Click on the "Apply Online Now" button on this page to register on our admission portal. Fill in your personal and academic details, upload required marksheets, and submit the online application fee.' },
    { question: 'What are the minimum eligibility criteria for Undergraduate (BCA/B.Sc/B.Com/B.A) courses?', answer: 'Candidates must have passed 10+2 (Higher Secondary Certificate) or equivalent examination from a recognized board with minimum 45% aggregate marks (40% for reserved category candidates).' },
    { question: 'Can I apply for more than one degree programme?', answer: 'Yes, prospective students can select up to 3 preferred degree specializations in a single application registration form.' },
    { question: 'When will the merit list be published?', answer: 'The first merit list for the 2026–27 session will be published on August 05, 2026 on our official portal and campus bulletin board.' },
    { question: 'Is hostel accommodation and bus transportation available for outstation students?', answer: 'Yes, Jaysingpur College provides dedicated boys & girls hostel facilities, sports complex, central library, and bus transportation routes across neighboring districts.' },
  ],
  helpdeskCtaTitle: 'Need Assistance With Your Application?',
  helpdeskCtaDesc: 'Our dedicated admissions guidance team is available Monday through Saturday (9:00 AM – 5:00 PM) to assist you with registration queries.',
  updatedAt: new Date().toISOString(),
};

export const defaultContactData: ContactPageConfigData = {
  id: 'contact',
  hero: {
    badgeText: 'Admissions & Helpdesk Office',
    title: 'Contact Us & Campus Location',
    subtitle: 'Reach out to our administrative team, academic departments, or campus helpdesk. We are here to assist your educational journey.',
  },
  info: {
    officeHours: 'Monday – Saturday: 9:00 AM – 5:00 PM',
    officeHoursClosed: 'Closed on Sundays and Official Public Holidays',
    campusAddress: 'Campus Address, University District, Pune, MH',
    helplinePhone: '+91 8669301878',
    officialEmail: 'sagarulagadde1008@gmail.com',
  },
  helpdesks: [
    { label: 'Admissions & Counseling:', email: 'admissions@college.edu' },
    { label: 'Examinations & Results:', email: 'exams@college.edu' },
    { label: 'Placement & Career Cell:', email: 'placement@college.edu' },
  ],
  emergencyCards: [
    { title: 'Anti-Ragging Helpline', description: '24/7 National Anti-Ragging Cell helpline for zero-tolerance campus safety.', contactInfo: 'Toll-Free: 1800-180-5522', iconKey: 'ShieldCheck' },
    { title: 'Women Empowerment Cell', description: 'Dedicated grievance redressal cell for female students and staff.', contactInfo: 'Desk Email: women@college.edu', iconKey: 'HeartHandshake' },
    { title: 'Student Grievance Officer', description: 'Direct assistance for academic evaluation & administrative queries.', contactInfo: 'Desk: Admin Block Room 104', iconKey: 'HelpCircle' },
  ],
  updatedAt: new Date().toISOString(),
};

// ── Enterprise Services for siteSettings/* Documents ──

export const homepageConfigService = {
  get: cache(async (): Promise<HomepageConfigData> => {
    try {
      const snap = await getDoc(doc(db, 'siteSettings', 'homepage'));
      if (!snap.exists()) return defaultHomepageData;
      return { ...defaultHomepageData, ...snap.data() };
    } catch {
      return defaultHomepageData;
    }
  }),
  save: async (data: Partial<HomepageConfigData>): Promise<void> => {
    const ref = doc(db, 'siteSettings', 'homepage');
    const updated = sanitizeForFirestore({ ...data, updatedAt: new Date().toISOString() });
    await setDoc(ref, updated, { merge: true });
  },
};

export const aboutPageConfigService = {
  get: cache(async (): Promise<AboutPageConfigData> => {
    try {
      const snap = await getDoc(doc(db, 'siteSettings', 'about'));
      if (!snap.exists()) return defaultAboutData;
      return { ...defaultAboutData, ...snap.data() };
    } catch {
      return defaultAboutData;
    }
  }),
  save: async (data: Partial<AboutPageConfigData>): Promise<void> => {
    const ref = doc(db, 'siteSettings', 'about');
    const updated = sanitizeForFirestore({ ...data, updatedAt: new Date().toISOString() });
    await setDoc(ref, updated, { merge: true });
  },
};

export const admissionsConfigService = {
  get: cache(async (): Promise<AdmissionsConfigData> => {
    try {
      const snap = await getDoc(doc(db, 'siteSettings', 'admissions'));
      if (!snap.exists()) return defaultAdmissionsData;
      return { ...defaultAdmissionsData, ...snap.data() };
    } catch {
      return defaultAdmissionsData;
    }
  }),
  save: async (data: Partial<AdmissionsConfigData>): Promise<void> => {
    const ref = doc(db, 'siteSettings', 'admissions');
    const updated = sanitizeForFirestore({ ...data, updatedAt: new Date().toISOString() });
    await setDoc(ref, updated, { merge: true });
  },
};

export const contactPageConfigService = {
  get: cache(async (): Promise<ContactPageConfigData> => {
    try {
      const snap = await getDoc(doc(db, 'siteSettings', 'contact'));
      if (!snap.exists()) return defaultContactData;
      return { ...defaultContactData, ...snap.data() };
    } catch {
      return defaultContactData;
    }
  }),
  save: async (data: Partial<ContactPageConfigData>): Promise<void> => {
    const ref = doc(db, 'siteSettings', 'contact');
    const updated = sanitizeForFirestore({ ...data, updatedAt: new Date().toISOString() });
    await setDoc(ref, updated, { merge: true });
  },
};
