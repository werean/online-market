import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  address: z.string().min(5, "Endereço deve ter ao menos 5 caracteres"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
