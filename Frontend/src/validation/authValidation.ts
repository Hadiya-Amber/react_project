import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address (e.g., john@example.com)'),
  password: z.string()
    .min(1, 'Please enter your password')
    .min(6, 'Password should be at least 6 characters long')
})

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    return age >= 18
  }, 'You must be at least 18 years old')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
