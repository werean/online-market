import { z } from "zod";

export const recoverPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export type RecoverPasswordInput = z.infer<typeof recoverPasswordSchema>;
