import { z } from "zod";

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  newPassword: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
