import { z } from "zod";

// Schema para registro
export const registerSchema = z.object({
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

// Schema para login
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});