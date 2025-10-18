import { z } from "zod";

export const verifyTokenSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),
  code: z
    .string()
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d{6}$/, "Código deve conter apenas números"),
});

export type VerifyTokenDto = z.infer<typeof verifyTokenSchema>;
