import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Department,
  Course,
  Faculty,
  Notice,
  Announcement,
  NewsItem,
  EventItem,
  GalleryAlbum,
  DocumentItem,
} from '@/types';

// Helper for safe query execution with empty array fallback
async function fetchDocs<T>(colName: string, queryConstraints: QueryConstraint[] = []): Promise<T[]> {
  try {
    const q = query(collection(db, colName), ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as T));
  } catch (err) {
    console.warn(`Firestore ${colName} query warning:`, err);
    return [];
  }
}

// 1. Departments Service
export const departmentsService = {
  getAll: () => fetchDocs<Department>('departments', [orderBy('order', 'asc')]),
  getPublished: () => fetchDocs<Department>('departments', [where('status', '==', 'published'), orderBy('order', 'asc')]),
  save: async (dept: Partial<Department> & { name: string; code: string }): Promise<string> => {
    const id = dept.id || doc(collection(db, 'departments')).id;
    const now = new Date().toISOString();
    const payload: Department = {
      id,
      name: dept.name,
      code: dept.code,
      slug: dept.slug || dept.name.toLowerCase().replace(/\s+/g, '-'),
      description: dept.description || '',
      hodName: dept.hodName || '',
      hodEmail: dept.hodEmail || '',
      hodPhotoUrl: dept.hodPhotoUrl || '',
      vision: dept.vision || '',
      mission: dept.mission || '',
      order: dept.order ?? 0,
      status: dept.status || 'published',
      createdAt: dept.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'departments', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'departments', id)),
};

// 2. Courses Service
export const coursesService = {
  getAll: () => fetchDocs<Course>('courses', [orderBy('title', 'asc')]),
  getByDepartment: (deptId: string) => fetchDocs<Course>('courses', [where('departmentId', '==', deptId)]),
  save: async (course: Partial<Course> & { title: string; code: string; departmentId: string }): Promise<string> => {
    const id = course.id || doc(collection(db, 'courses')).id;
    const now = new Date().toISOString();
    const payload: Course = {
      id,
      title: course.title,
      code: course.code,
      departmentId: course.departmentId,
      departmentName: course.departmentName || '',
      slug: course.slug || course.title.toLowerCase().replace(/\s+/g, '-'),
      degreeType: course.degreeType || 'UG',
      durationYears: course.durationYears || 3,
      eligibility: course.eligibility || '',
      description: course.description || '',
      syllabusOverview: course.syllabusOverview || '',
      feePerSemester: course.feePerSemester || 0,
      status: course.status || 'published',
      createdAt: course.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'courses', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'courses', id)),
};

// 3. Faculty Service
export const facultyService = {
  getAll: () => fetchDocs<Faculty>('faculty', [orderBy('order', 'asc')]),
  getByDepartment: (deptId: string) => fetchDocs<Faculty>('faculty', [where('departmentId', '==', deptId), orderBy('order', 'asc')]),
  save: async (fac: Partial<Faculty> & { name: string; designation: string; departmentId: string }): Promise<string> => {
    const id = fac.id || doc(collection(db, 'faculty')).id;
    const now = new Date().toISOString();
    const payload: Faculty = {
      id,
      name: fac.name,
      designation: fac.designation,
      departmentId: fac.departmentId,
      departmentName: fac.departmentName || '',
      qualification: fac.qualification || '',
      email: fac.email || '',
      phone: fac.phone || '',
      photoUrl: fac.photoUrl || '',
      bio: fac.bio || '',
      joiningYear: fac.joiningYear || new Date().getFullYear(),
      order: fac.order ?? 0,
      status: fac.status || 'published',
      createdAt: fac.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'faculty', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'faculty', id)),
};

// 4. Notices Service
export const noticesService = {
  getAll: () => fetchDocs<Notice>('notices', [orderBy('publishDate', 'desc')]),
  getPublished: (maxResults = 10) => fetchDocs<Notice>('notices', [where('status', '==', 'published'), orderBy('publishDate', 'desc'), limit(maxResults)]),
  save: async (notice: Partial<Notice> & { title: string; category: Notice['category'] }): Promise<string> => {
    const id = notice.id || doc(collection(db, 'notices')).id;
    const now = new Date().toISOString();
    const payload: Notice = {
      id,
      title: notice.title,
      slug: notice.slug || notice.title.toLowerCase().replace(/\s+/g, '-'),
      category: notice.category,
      content: notice.content || '',
      attachmentUrl: notice.attachmentUrl || '',
      attachmentName: notice.attachmentName || '',
      isUrgent: notice.isUrgent ?? false,
      publishDate: notice.publishDate || now,
      expiryDate: notice.expiryDate || '',
      status: notice.status || 'published',
      createdAt: notice.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'notices', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'notices', id)),
};

// 5. Announcements Ticker Service
export const announcementsService = {
  getActive: () => fetchDocs<Announcement>('announcements', [where('active', '==', true)]),
  save: async (anc: Partial<Announcement> & { text: string }): Promise<string> => {
    const id = anc.id || doc(collection(db, 'announcements')).id;
    const payload: Announcement = {
      id,
      text: anc.text,
      linkUrl: anc.linkUrl || '',
      active: anc.active ?? true,
      createdAt: anc.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'announcements', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'announcements', id)),
};

// 6. News Service
export const newsService = {
  getAll: () => fetchDocs<NewsItem>('news', [orderBy('publishDate', 'desc')]),
  getPublished: () => fetchDocs<NewsItem>('news', [where('status', '==', 'published'), orderBy('publishDate', 'desc')]),
  save: async (item: Partial<NewsItem> & { title: string }): Promise<string> => {
    const id = item.id || doc(collection(db, 'news')).id;
    const now = new Date().toISOString();
    const payload: NewsItem = {
      id,
      title: item.title,
      slug: item.slug || item.title.toLowerCase().replace(/\s+/g, '-'),
      summary: item.summary || '',
      content: item.content || '',
      coverImageUrl: item.coverImageUrl || '',
      publishDate: item.publishDate || now,
      status: item.status || 'published',
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'news', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'news', id)),
};

// 7. Events Service
export const eventsService = {
  getAll: () => fetchDocs<EventItem>('events', [orderBy('eventDate', 'asc')]),
  getUpcoming: () => fetchDocs<EventItem>('events', [where('status', '==', 'published'), orderBy('eventDate', 'asc')]),
  save: async (item: Partial<EventItem> & { title: string; venue: string; eventDate: string }): Promise<string> => {
    const id = item.id || doc(collection(db, 'events')).id;
    const now = new Date().toISOString();
    const payload: EventItem = {
      id,
      title: item.title,
      slug: item.slug || item.title.toLowerCase().replace(/\s+/g, '-'),
      description: item.description || '',
      venue: item.venue,
      eventDate: item.eventDate,
      endDate: item.endDate || '',
      bannerUrl: item.bannerUrl || '',
      registrationUrl: item.registrationUrl || '',
      status: item.status || 'published',
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'events', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'events', id)),
};

// 8. Gallery Service
export const galleryService = {
  getAll: () => fetchDocs<GalleryAlbum>('gallery', [orderBy('createdAt', 'desc')]),
  getPublished: () => fetchDocs<GalleryAlbum>('gallery', [where('status', '==', 'published'), orderBy('createdAt', 'desc')]),
  save: async (album: Partial<GalleryAlbum> & { title: string }): Promise<string> => {
    const id = album.id || doc(collection(db, 'gallery')).id;
    const now = new Date().toISOString();
    const payload: GalleryAlbum = {
      id,
      title: album.title,
      slug: album.slug || album.title.toLowerCase().replace(/\s+/g, '-'),
      coverImageUrl: album.coverImageUrl || '',
      images: album.images || [],
      category: album.category || 'General',
      status: album.status || 'published',
      createdAt: album.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'gallery', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'gallery', id)),
};

// 9. Downloads Service
export const downloadsService = {
  getAll: () => fetchDocs<DocumentItem>('downloads', [orderBy('createdAt', 'desc')]),
  getPublished: () => fetchDocs<DocumentItem>('downloads', [where('status', '==', 'published'), orderBy('createdAt', 'desc')]),
  save: async (docItem: Partial<DocumentItem> & { title: string; fileUrl: string; fileName: string }): Promise<string> => {
    const id = docItem.id || doc(collection(db, 'downloads')).id;
    const now = new Date().toISOString();
    const payload: DocumentItem = {
      id,
      title: docItem.title,
      category: docItem.category || 'General',
      fileUrl: docItem.fileUrl,
      fileName: docItem.fileName,
      fileSizeFormatted: docItem.fileSizeFormatted || '1.0 MB',
      fileType: docItem.fileType || 'PDF',
      description: docItem.description || '',
      status: docItem.status || 'published',
      createdAt: docItem.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'downloads', id), payload, { merge: true });
    return id;
  },
  delete: (id: string) => deleteDoc(doc(db, 'downloads', id)),
};
