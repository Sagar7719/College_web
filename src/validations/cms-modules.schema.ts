import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Department code must be at least 2 characters').max(20),
  hodName: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const courseSchema = z.object({
  title: z.string().min(2, 'Course title required').max(120),
  code: z.string().min(2, 'Course code required').max(20),
  departmentId: z.string().min(1, 'Department selection is required'),
  degreeType: z.enum(['Undergraduate', 'Postgraduate', 'Diploma', 'Doctoral']),
  durationYears: z.number().min(0.5, 'Duration required'),
  intakeSeats: z.number().int().optional(),
  eligibility: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const facultySchema = z.object({
  name: z.string().min(2, 'Faculty name required').max(100),
  designation: z.string().min(2, 'Designation required').max(100),
  departmentId: z.string().min(1, 'Department selection is required'),
  qualification: z.string().min(2, 'Qualification required'),
  experienceYears: z.number().int().min(0).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  profileImageUrl: z.string().optional(),
  biography: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const noticeSchema = z.object({
  title: z.string().min(2, 'Notice title required').max(150),
  category: z.string().min(2, 'Category required'),
  publishDate: z.string().min(1, 'Publish date required'),
  isUrgent: z.boolean().optional(),
  content: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentName: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const announcementSchema = z.object({
  title: z.string().min(2, 'Announcement title required').max(150),
  content: z.string().min(2, 'Content required'),
  priority: z.enum(['normal', 'urgent']),
  targetUrl: z.string().optional(),
  publishDate: z.string().min(1, 'Publish date required'),
  status: z.enum(['draft', 'published', 'archived']),
});

export const newsSchema = z.object({
  title: z.string().min(2, 'News title required').max(150),
  slug: z.string().min(2, 'Slug required'),
  publishDate: z.string().min(1, 'Publish date required'),
  summary: z.string().min(5, 'Summary required'),
  content: z.string().min(10, 'Content required'),
  coverImageUrl: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const eventSchema = z.object({
  title: z.string().min(2, 'Event title required').max(150),
  eventDate: z.string().min(1, 'Event date required'),
  eventTime: z.string().optional(),
  venue: z.string().min(2, 'Venue location required'),
  category: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  registrationUrl: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});
