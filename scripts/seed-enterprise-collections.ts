import * as fs from 'fs';
import * as path from 'path';

// Bootstrap environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'college-cms-8f700';

async function masterEnterpriseSeed() {
  console.log('================================================================');
  console.log('🚀 MASTER ENTERPRISE DATABASE SEEDING & SYNC 🚀');
  console.log(`Target Firestore Project: ${projectId}`);
  console.log('================================================================\n');

  // Authenticate Admin User Session via REST API
  let idToken = '';
  const authEmail = `master_admin_${Date.now()}@college.internal`;
  const authPassword = `MasterSecret@${Date.now()}`;

  console.log(`🔑 Authenticating Admin Session: ${authEmail}`);

  try {
    const signUpRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword, returnSecureToken: true }),
    });
    const signUpData: any = await signUpRes.json();
    if (signUpData.idToken) {
      idToken = signUpData.idToken;
      console.log('✅ Admin Auth Session established successfully!\n');
    } else {
      console.error('❌ Failed to establish auth session:', signUpData);
      return;
    }
  } catch (err: any) {
    console.error('❌ Auth REST error:', err.message);
    return;
  }

  // Import schemas
  const {
    defaultHomepageData,
    defaultAboutData,
    defaultAdmissionsData,
    defaultContactData,
  } = await import('../src/services/enterprise-cms.service');

  function toFirestoreValue(val: any): any {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: val.toString() };
      return { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map((item) => toFirestoreValue(item)) } };
    }
    if (typeof val === 'object') {
      const fields: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        if (v !== undefined) {
          fields[k] = toFirestoreValue(v);
        }
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  async function writeDocument(colName: string, docId: string, dataObj: Record<string, any>) {
    const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${colName}/${docId}`;
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(dataObj)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }

    const res = await fetch(docUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields }),
    });

    const resData: any = await res.json();
    if (resData.name) {
      console.log(`  ✅ [${colName}/${docId}] synced to Firestore.`);
    } else {
      console.error(`  ❌ Failed [${colName}/${docId}]:`, resData);
    }
  }

  // 1. Seed siteSettings Decoupled Page Configs
  console.log('📦 1. Seeding Page Configurations (siteSettings/*)...');
  await writeDocument('siteSettings', 'homepage', defaultHomepageData);
  await writeDocument('siteSettings', 'about', defaultAboutData);
  await writeDocument('siteSettings', 'admissions', defaultAdmissionsData);
  await writeDocument('siteSettings', 'contact', defaultContactData);

  // 2. Seed Departments Collection
  console.log('\n🏛️ 2. Seeding Academic Departments (departments/*)...');
  const departmentsData = [
    {
      id: 'dept-cs',
      code: 'CS',
      name: 'Computer Science & Information Tech',
      slug: 'computer-science',
      description: 'Leading artificial intelligence, software engineering, cloud computing, and data science education equipped with advanced computing laboratories.',
      hodName: 'Dr. Sagar Ulagadde',
      hodEmail: 'sagarulagadde1008@gmail.com',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dept-comm',
      code: 'COMM',
      name: 'Commerce & Management Studies',
      slug: 'commerce-management',
      description: 'Empowering future business leaders in financial analytics, digital marketing, corporate governance, and entrepreneurial innovation.',
      hodName: 'Dr. A. R. Patil',
      hodEmail: 'commerce@college.edu',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dept-sci',
      code: 'SCI',
      name: 'Physical & Chemical Sciences',
      slug: 'physical-sciences',
      description: 'Fostering scientific inquiry, material research, chemical analysis, and quantum optics in state-of-the-art research laboratories.',
      hodName: 'Dr. V. M. Deshmukh',
      hodEmail: 'sciences@college.edu',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dept-arts',
      code: 'ARTS',
      name: 'Arts, Humanities & Social Sciences',
      slug: 'arts-humanities',
      description: 'Cultivating critical thinking, literature appreciation, historical research, and public administration competencies.',
      hodName: 'Prof. S. B. Kulkarni',
      hodEmail: 'arts@college.edu',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  for (const dept of departmentsData) {
    await writeDocument('departments', dept.id, dept);
  }

  // 3. Seed Courses Collection
  console.log('\n🎓 3. Seeding Courses & Programs (courses/*)...');
  const coursesData = [
    {
      id: 'course-bca',
      code: 'BCA-301',
      title: 'Bachelor of Computer Applications (BCA)',
      slug: 'bca',
      degreeType: 'Undergraduate',
      durationYears: 3,
      departmentId: 'dept-cs',
      departmentName: 'Computer Science & Information Tech',
      eligibility: '10+2 Pass with Mathematics / IT (Min 45%)',
      description: 'Comprehensive 3-year degree focusing on web development, software engineering, databases, and AI.',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'course-bsc-cs',
      code: 'BSC-CS',
      title: 'B.Sc. in Computer Science',
      slug: 'bsc-computer-science',
      degreeType: 'Undergraduate',
      durationYears: 3,
      departmentId: 'dept-cs',
      departmentName: 'Computer Science & Information Tech',
      eligibility: '10+2 Science Stream with Physics & Math',
      description: 'In-depth scientific curriculum covering computer architecture, algorithms, cloud systems, and data structures.',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'course-bcom',
      code: 'BCOM-101',
      title: 'Bachelor of Commerce (B.Com)',
      slug: 'bcom',
      degreeType: 'Undergraduate',
      durationYears: 3,
      departmentId: 'dept-comm',
      departmentName: 'Commerce & Management Studies',
      eligibility: '10+2 Commerce / Arts / Science Stream',
      description: 'Core degree in business management, accounting, corporate law, banking, and taxation.',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'course-msc-cs',
      code: 'MSC-CS',
      title: 'M.Sc. in Computer Science',
      slug: 'msc-computer-science',
      degreeType: 'Postgraduate',
      durationYears: 2,
      departmentId: 'dept-cs',
      departmentName: 'Computer Science & Information Tech',
      eligibility: 'B.Sc Computer Science / BCA Graduate (Min 50%)',
      description: 'Advanced postgraduate research degree specializing in machine learning, distributed computing, and cybersecurity.',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  for (const course of coursesData) {
    await writeDocument('courses', course.id, course);
  }

  // 4. Seed Notices Collection
  console.log('\n📌 4. Seeding Notices & Circulars (notices/*)...');
  const noticesData = [
    {
      id: 'notice-adm-2026',
      title: 'Admissions 2026–27 Open for UG & PG Degree Programmes',
      category: 'Admissions',
      content: 'Online applications are now open for BCA, B.Sc, B.Com, B.A, and M.Sc courses. Last date for form submission is August 31, 2026.',
      publishDate: new Date().toISOString(),
      isUrgent: true,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'notice-exam-tt',
      title: 'Semester End Examination Timetable & Hall Ticket Distribution',
      category: 'Examinations',
      content: 'Official timetable for Summer 2026 Semester Examinations is published. Hall tickets can be collected from student window.',
      publishDate: new Date().toISOString(),
      isUrgent: false,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'notice-scholarship',
      title: 'State Merit Scholarship & Fee Concession Forms Application',
      category: 'General',
      content: 'Eligible candidates are advised to fill online Mahadbt scholarship renewal forms before September 15, 2026.',
      publishDate: new Date().toISOString(),
      isUrgent: false,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  for (const notice of noticesData) {
    await writeDocument('notices', notice.id, notice);
  }

  // 5. Seed Events Collection
  console.log('\n📅 5. Seeding Campus Events (events/*)...');
  const eventsData = [
    {
      id: 'evt-science-symposium',
      title: 'National Conference on AI & Quantum Computing 2026',
      eventDate: '2026-09-18T09:30:00.000Z',
      venue: 'Central Auditorium & Tech Lab',
      description: 'Annual national symposium bringing together academic researchers, computer scientists, and industry leaders.',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt-placement-drive',
      title: 'Annual Campus Recruitment & Placement Drive 2026',
      eventDate: '2026-10-05T09:00:00.000Z',
      venue: 'Campus Seminar Complex',
      description: 'Top IT, financial, and corporate recruiters participating in multi-company campus placement interviews for graduating students.',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  for (const evt of eventsData) {
    await writeDocument('events', evt.id, evt);
  }

  // 6. Seed Downloads Collection
  console.log('\n📥 6. Seeding Official Downloads (downloads/*)...');
  const downloadsData = [
    {
      id: 'dl-prospectus-2026',
      title: 'Official Academic Prospectus 2026–2027',
      category: 'Prospectus',
      fileUrl: 'https://college.edu/docs/prospectus-2026.pdf',
      fileSizeFormatted: '4.2 MB',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dl-bca-syllabus',
      title: 'BCA Choice Based Credit System (CBCS) Syllabus',
      category: 'Syllabus',
      fileUrl: 'https://college.edu/docs/bca-syllabus-2026.pdf',
      fileSizeFormatted: '1.8 MB',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dl-admission-form',
      title: 'Offline Admission Application Form (Printable)',
      category: 'Forms',
      fileUrl: 'https://college.edu/docs/admission-form-2026.pdf',
      fileSizeFormatted: '650 KB',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  for (const dl of downloadsData) {
    await writeDocument('downloads', dl.id, dl);
  }

  console.log('\n================================================================');
  console.log('🎉 MASTER ENTERPRISE DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉');
  console.log('================================================================');
}

masterEnterpriseSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
