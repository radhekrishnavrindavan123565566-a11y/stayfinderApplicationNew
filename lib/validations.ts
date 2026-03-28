import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["tenant", "owner"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(1, "Price must be greater than 0"),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
  }),
  amenities: z.array(z.string()).optional(),
  propertyType: z.enum(["apartment", "house", "villa", "studio", "condo", "cabin"]),
  bedrooms: z.number().min(1),
  bathrooms: z.number().min(1),
  maxGuests: z.number().min(1),
  area: z.number().min(1).optional(),
  isAvailable: z.boolean().optional(),
});

export const bookingSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  message: z.string().optional(),
});

export const reviewSchema = z.object({
  propertyId: z.string().min(1),
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
