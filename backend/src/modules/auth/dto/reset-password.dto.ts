import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),
  newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
