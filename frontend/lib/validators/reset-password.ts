import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    email: z.string().email("E-mail inválido"),
    newPassword: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
