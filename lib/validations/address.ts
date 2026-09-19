import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  address: addressSchema,
  ageConsent: z.boolean().refine((val) => val === true, {
    message: "You must confirm you are 18 years or older",
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and safety disclaimer",
  }),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
