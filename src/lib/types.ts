import { z } from 'zod';

export const trainingGoals = [
  "Perder Peso",
  "Ganar Músculo",
  "Mejorar Resistencia",
  "Fitness General",
  "Mejorar Fuerza",
] as const;

export const genders = [
  "Masculino",
   "Femenino", 
   "Otro"
  ] as const;


export const SignupSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Dirección de correo electrónico inválida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string(),
  age: z.coerce.number().int().positive({ message: "La edad debe ser un número positivo." }).min(10, { message: "Debes tener al menos 10 años." }).max(120, { message: "La edad parece incorrecta." }),
  height: z.coerce.number().positive({ message: "La altura debe ser un número positivo." }).min(50, {message: "La altura debe ser al menos 50 cm."}).max(300, {message: "La altura parece incorrecta."}),
  weight: z.coerce.number().positive({ message: "El peso debe ser un número positivo." }).min(20, {message: "El peso debe ser al menos 20 kg."}).max(300, {message: "El peso parece incorrecto."}),
  trainingGoal: z.string().min(1, { message: "Por favor, selecciona un objetivo de entrenamiento." }),
  gender: z.enum(genders, { required_error: "Por favor, selecciona un género." }).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});
export type SignupFormData = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export const UserProfileSchema = z.object({
  displayName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").nullable().optional(),
  weight: z.coerce.number().positive("El peso debe ser un número positivo.").optional(),
  height: z.coerce.number().positive("La altura debe ser un número positivo.").min(50).max(300).optional(), 
  age: z.coerce.number().int().positive("La edad debe ser un número positivo.").min(10).max(120).optional(),
  trainingGoal: z.string().optional(),
  gender: z.enum(genders, { required_error: "Por favor, selecciona un género." }).optional(),
});
export type UserProfileFormData = z.infer<typeof UserProfileSchema>;
