import { z } from 'zod';

export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string()
    .trim()
    .min(3, 'Email must be at least 3 characters')
    .max(150, 'Email must be at most 150 characters')
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .trim()
    .min(2, 'Subject must be at least 2 characters')
    .max(200, 'Subject must be at most 200 characters'),
  message: z
    .string()
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .max(2000, 'Message must be at most 2000 characters'),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
