import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { SiteSettings } from '@/types';

const COLLECTION_NAME = 'siteSettings';
const SETTINGS_DOC_ID = 'general';

import { FooterColumn } from '@/types';

export const defaultFooterColumns: FooterColumn[] = [
  {
    id: 'col_quick_links',
    title: 'Quick Links',
    order: 0,
    visible: true,
    links: [
      { id: 'link_sys_about', label: 'About Us', type: 'system', path: '/about', pageId: 'sys_page_about', systemKey: 'about', isSystemPage: true, order: 0, visible: true },
      { id: 'link_sys_academics', label: 'Academics & Departments', type: 'system', path: '/departments', pageId: 'sys_page_academics', systemKey: 'academics', isSystemPage: true, order: 1, visible: true },
      { id: 'link_sys_admissions', label: 'Admissions Process', type: 'system', path: '/admissions', pageId: 'sys_page_admissions', systemKey: 'admissions', isSystemPage: true, order: 2, visible: true },
      { id: 'link_sys_notices', label: 'Latest Notices', type: 'system', path: '/notices', pageId: 'sys_page_notices', systemKey: 'notices', isSystemPage: true, order: 3, visible: true },
      { id: 'link_sys_contact', label: 'Contact Campus', type: 'system', path: '/contact', pageId: 'sys_page_contact', systemKey: 'contact', isSystemPage: true, order: 4, visible: true },
    ],
  },
  {
    id: 'col_resources',
    title: 'Resources',
    order: 1,
    visible: true,
    links: [
      { id: 'link_sys_courses', label: 'Courses Offered', type: 'system', path: '/courses', systemKey: 'courses', isSystemPage: true, order: 0, visible: true },
      { id: 'link_sys_faculty', label: 'Faculty Directory', type: 'system', path: '/faculty', systemKey: 'faculty', isSystemPage: true, order: 1, visible: true },
      { id: 'link_sys_downloads', label: 'Document Downloads', type: 'system', path: '/downloads', systemKey: 'downloads', isSystemPage: true, order: 2, visible: true },
      { id: 'link_sys_gallery', label: 'Photo Gallery', type: 'system', path: '/gallery', systemKey: 'gallery', isSystemPage: true, order: 3, visible: true },
      { id: 'link_sys_news', label: 'News & Updates', type: 'system', path: '/news', systemKey: 'news', isSystemPage: true, order: 4, visible: true },
    ],
  },
];

export const defaultSettings: SiteSettings = {
  id: SETTINGS_DOC_ID,
  collegeInfo: {
    name: 'Shivaji University, Kolhapur',
    shortName: 'Shivaji University',
    tagline: 'Empowering Education & Innovation',
    description: 'Welcome to our official college portal providing quality higher education and holistic student development.',
    establishedYear: '2001',
    logoUrl: '/images/college_emblem.png',
    address: 'Campus Address, University District',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    alternatePhone: '',
    email: '',
    websiteUrl: '',
    principalName: '',
    principalDesignation: 'Principal',
    principalPhotoUrl: '',
    principalMessage: '',
    vision: 'To be a center of academic distinction, nurturing scientific inquiry, technological innovation, research excellence, and ethical leadership in every discipline.',
    mission: 'Providing accessible, high-quality higher education tailored to modern societal demands, fostering critical thinking, character building, and career preparedness.',
    naacGrade: "A",
    officeHours: 'Monday – Saturday: 9:00 AM – 5:00 PM',
    officeHoursClosed: 'Closed on Sundays and Official Public Holidays',
  },
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: '',
  },
  footerConfig: {
    aboutText: 'Dedicated to excellence in education, groundbreaking research, and holistic student development.',
    copyrightText: `© ${new Date().getFullYear()} College Name. All rights reserved.`,
    usefulLinksHeader: 'Quick Links',
    contactHeader: 'Contact Campus',
    columns: defaultFooterColumns,
  },
  seoConfig: {
    defaultMetaTitle: 'Official College Portal | Higher Education & Research',
    defaultMetaDescription: 'Official website of the college with courses, faculty directory, admissions information, and academic circulars.',
    defaultOgImageUrl: '',
  },
  maintenanceMode: false,
  maintenanceMessage: 'The website is currently undergoing scheduled maintenance. Please check back soon.',
  setupCompleted: false,
  updatedAt: new Date().toISOString(),

  // ── Homepage Defaults ──
  homepage: {
    heroCta1Label: 'Explore Programmes',
    heroCta2Label: 'About Our College',
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
  },

  // ── About Page Defaults ──
  aboutPage: {
    heroBadge: 'Established Institution of Academic Excellence',
    heroSubtitle: 'our institution stands as a beacon of academic distinction, research innovation, and holistic student empowerment.',
    heroStats: [
      { label: 'NAAC Accredited', sublabel: 'UGC 2(f) & 12(B) Recognized', iconKey: 'Award' },
      { label: '50,000+ Alumni', sublabel: 'Global Professional Network', iconKey: 'GraduationCap' },
      { label: '50+ Years of Legacy', sublabel: '', iconKey: 'Landmark' },
    ],
    legacyTitle: 'Institutional Legacy & Heritage',
    highlights: [
      { text: 'Affiliated to State Public University with UGC Accreditation.' },
      { text: 'State-of-the-art computing laboratories and digital library archives.' },
      { text: 'Proactive Industry Internship & Campus Placement Division.' },
    ],
    pillarsTitle: 'Pillars of Academic Distinction',
    pillars: [
      { title: 'NEP Aligned Syllabus', description: 'Choice-based credit systems and outcome-based curriculum designed for modern careers.', iconKey: 'BookOpen' },
      { title: 'Research & Innovation', description: 'Dedicated research labs, funded faculty projects, and national symposium publications.', iconKey: 'Microscope' },
      { title: 'Inclusive & Safe Campus', description: 'Zero-tolerance anti-ragging policy, women empowerment cell, and student counseling.', iconKey: 'ShieldCheck' },
      { title: 'Global Alumni Network', description: 'Active mentorship and campus recruitment by leading industrial and technology recruiters.', iconKey: 'Users' },
    ],
    ctaBannerTitle: 'Become Part of Our Academic Heritage',
    ctaBannerDesc: 'Applications for the 2026–27 academic session are now open across all departments.',
  },

  // ── Contact Page Defaults ──
  contactPage: {
    heroBadge: 'Admissions & Helpdesk Office',
    heroTitle: 'Contact Us & Campus Location',
    heroSubtitle: 'Reach out to our administrative team, academic departments, or campus helpdesk. We are here to assist your educational journey.',
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
  },

  // ── Admissions Defaults ──
  admissions: {
    heroBadge: 'Admissions Session 2026 – 2027 Now Open',
    heroTitle: 'Admission Process & Guidelines',
    heroSubtitle: 'Step-by-step guidance, merit eligibility criteria, fee structures, and document submission portal for prospective students.',
    heroStats: [
      { label: '43+ Accredited', sublabel: 'Degree Programmes', iconKey: 'GraduationCap' },
      { label: 'NAAC Accredited', sublabel: 'UGC 2(f) & 12(B) Recognized', iconKey: 'Award' },
      { label: 'Deadline: Aug 31, 2026', sublabel: 'Application Window Active', iconKey: 'Clock' },
    ],
    applicationDeadline: 'Aug 31, 2026',
    stepsEyebrow: 'Simple 4-Step Process',
    stepsTitle: 'Your Path to Academic Excellence',
    stepsSubtitle: 'Follow these simple steps to complete your admission for the 2026–27 academic year.',
    admissionSteps: [
      { title: 'Online Registration', description: 'Register on the online portal, fill in candidate credentials, and select your preferred academic degree course.', iconKey: 'FileText' },
      { title: 'Document Verification', description: 'Upload marksheets, certificates, and ID proofs. Submitted files are verified by the admissions evaluation committee.', iconKey: 'CheckCircle2' },
      { title: 'Merit List & Counseling', description: 'Check published merit lists, attend online or on-campus counseling sessions, and confirm your seat allocation.', iconKey: 'UserCheck' },
      { title: 'Fee Payment & Roll Call', description: 'Complete course fee payment online or at bank counter, receive official admission letter, and collect your student badge.', iconKey: 'Award' },
    ],
    eligibilityTabs: [
      {
        tabKey: 'ug', tabLabel: 'Undergraduate (UG)',
        cards: [
          { tag: 'BCA (3 Years)', minMarks: 'Min 45% Marks', title: 'Bachelor of Computer Applications', description: 'Software development, database design, web technologies, and AI fundamentals.', criteria: ['10+2 with Mathematics/Statistics/Information Tech preferred.', 'Merit-based admission + CET counseling.'] },
          { tag: 'B.Sc (3 Years)', minMarks: 'Min 45% Marks', title: 'Bachelor of Science', description: 'Physics, Chemistry, Computer Science, Biotechnology, and Mathematics.', criteria: ['10+2 Science stream from recognized board.', 'Direct merit list seat allocation.'] },
          { tag: 'B.Com (3 Years)', minMarks: 'Min 40% Marks', title: 'Bachelor of Commerce', description: 'Accounting, corporate law, banking, taxation, and business management.', criteria: ['10+2 Commerce / Arts / Science stream.', 'Merit ranking by aggregate score.'] },
        ],
      },
      {
        tabKey: 'pg', tabLabel: 'Postgraduate (PG)',
        cards: [
          { tag: 'M.Sc (2 Years)', minMarks: 'Min 50% Marks', title: 'Master of Science (Computer / Chemistry)', description: 'Advanced postgraduate research, algorithmic analysis, and laboratory thesis work.', criteria: ['Bachelor degree in relevant discipline from recognized university.', 'Entrance test + merit scorecard.'] },
          { tag: 'M.Com (2 Years)', minMarks: 'Min 45% Marks', title: 'Master of Commerce', description: 'Advanced financial management, auditing, managerial economics, and research methodology.', criteria: ['B.Com or BBA degree from accredited college.', 'Merit ranking seat allotment.'] },
        ],
      },
      {
        tabKey: 'diploma', tabLabel: 'Diploma & Skill Courses',
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
    admissionSchedule: [
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
      { question: 'Is hostel accommodation and bus transportation available for outstation students?', answer: 'Yes, our institution provides dedicated boys & girls hostel facilities, sports complex, central library, and bus transportation routes across neighboring districts.' },
    ],
    helpdeskCtaTitle: 'Need Assistance With Your Application?',
    helpdeskCtaDesc: 'Our dedicated admissions guidance team is available Monday through Saturday (9:00 AM – 5:00 PM) to assist you with registration queries.',
  },
};

import { cache } from 'react';
import { sanitizeForFirestore } from '@/lib/firestore-utils';

export const siteSettingsService = {
  getSettings: cache(async (): Promise<SiteSettings> => {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/site-settings');
        const json = await res.json();
        if (json.success && json.data) return json.data;
      } catch (err) {
        console.warn('Pattern B API /api/site-settings fallback:', err);
      }
    }
    try {
      const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return defaultSettings;
      }
      const data = snap.data() as Partial<SiteSettings>;
      const existingColumns = data.footerConfig?.columns;
      const columnsToUse = existingColumns && Array.isArray(existingColumns) && existingColumns.length > 0
        ? existingColumns
        : defaultFooterColumns;

      return {
        ...defaultSettings,
        ...data,
        collegeInfo: {
          ...defaultSettings.collegeInfo,
          ...(data.collegeInfo || {}),
        },
        socialLinks: {
          ...defaultSettings.socialLinks,
          ...(data.socialLinks || {}),
        },
        footerConfig: {
          ...defaultSettings.footerConfig,
          ...(data.footerConfig || {}),
          columns: columnsToUse,
        },
        seoConfig: {
          ...defaultSettings.seoConfig,
          ...(data.seoConfig || {}),
        },
        homepage: {
          ...defaultSettings.homepage,
          ...(data.homepage || {}),
        },
        aboutPage: {
          ...defaultSettings.aboutPage,
          ...(data.aboutPage || {}),
        },
        contactPage: {
          ...defaultSettings.contactPage,
          ...(data.contactPage || {}),
        },
        admissions: {
          ...defaultSettings.admissions,
          ...(data.admissions || {}),
        },
      };
    } catch (err) {
      console.warn('Firestore siteSettings fetch warning:', err);
      return defaultSettings;
    }
  }),

  async updateSettings(partialSettings: Partial<SiteSettings>): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partialSettings),
        });
        const json = await res.json();
        if (json.success) return;
      } catch (err) {
        console.warn('Pattern B API /api/site-settings save fallback:', err);
      }
    }
    const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const updated = sanitizeForFirestore({
      ...partialSettings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(ref, updated, { merge: true });
  },

  async setMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const payload: Partial<SiteSettings> = {
      maintenanceMode: enabled,
      updatedAt: new Date().toISOString(),
    };
    if (message !== undefined) {
      payload.maintenanceMessage = message;
    }
    const updated = sanitizeForFirestore(payload);
    await setDoc(ref, updated, { merge: true });
  },

  async isSetupCompleted(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return Boolean(settings.setupCompleted);
    } catch {
      return false;
    }
  },

  async completeSetup(settingsData: Partial<SiteSettings>): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const payload = sanitizeForFirestore({
      ...settingsData,
      setupCompleted: true,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(ref, payload, { merge: true });
  },
};

