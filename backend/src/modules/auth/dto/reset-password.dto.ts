import { z } from "zod";

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
