import { z } from "zod";

export const recoverPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

export type RecoverPasswordDto = z.infer<typeof recoverPasswordSchema>;
