// Core Academic Collections Data Models

export interface Department {
  id: string;
  name: string;
  code: string; // e.g. 'CS', 'EE', 'ME'
  slug: string;
  description?: string;
  hodName?: string;
  hodEmail?: string;
  hodPhotoUrl?: string;
  vision?: string;
  mission?: string;
  order?: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  departmentName?: string;
  slug: string;
  degreeType: 'UG' | 'PG' | 'Diploma' | 'Doctoral';
  durationYears: number;
  eligibility?: string;
  description?: string;
  syllabusOverview?: string;
  feePerSemester?: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  departmentId: string;
  departmentName?: string;
  qualification: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  joiningYear?: number;
  order?: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  slug: string;
  category: 'General' | 'Academic' | 'Admission' | 'Exam' | 'Event' | string;
  content?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isUrgent: boolean;
  publishDate: string;
  expiryDate?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl?: string;
  author?: string;
  publishDate: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  venue: string;
  eventDate: string; // ISO date
  endDate?: string;
  bannerUrl?: string;
  registrationUrl?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  altText?: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string;
  images: GalleryImage[];
  category?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'General' | 'Admissions' | 'Academic' | 'Circulars' | 'Syllabus' | 'Forms' | string;
  fileUrl: string;
  fileName: string;
  fileSizeFormatted?: string; // e.g. '2.4 MB'
  fileType?: string; // e.g. 'PDF'
  description?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  publicId: string;
  resourceType: 'image' | 'raw' | 'document';
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  fileName: string;
  originalName?: string;
  altText?: string;
  caption?: string;
  createdAt: string;
  uploadedBy?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'editor';
  createdAt: string;
}
