import { z } from "zod";

export const recoverPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").toLowerCase().trim(),
});

export type RecoverPasswordDto = z.infer<typeof recoverPasswordSchema>;
