import { z } from 'zod';

// Schema for creating a new customer
export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(5, 'Phone number is required'),
    company: z.string().min(1, 'Company is required'),
    status: z.enum(['active', 'inactive', 'prospect', 'lead', 'archive']).default('prospect'),
    lastContactDate: z.string().datetime().or(z.date()), // Accepts ISO string or Date object
    notes: z.string().optional(),
  }),
});

// Schema for updating (all fields optional)
export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    company: z.string().min(1).optional(),
    status: z.enum(['active', 'inactive', 'prospect', 'lead', 'archive']).optional(),
    lastContactDate: z.string().datetime().or(z.date()).optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Customer ID'),
  }),
});

// Schema for querying/filtering the customer list
export const customerQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    status: z.string().optional(), // Can be comma-separated like "active,lead"
    company: z.string().optional(),
  }),
});