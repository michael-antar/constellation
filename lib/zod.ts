import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const createPageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  content: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.uuid("Invalid category ID"),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name cannot be empty."),
  // This regex validates a 3 or 6-digit hex color code (e.g., #FFF or #AABBCC)
  color_hex: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, {
    message: "Must be a valid hex color code (e.g., #A4B3C1).",
  }),
});
