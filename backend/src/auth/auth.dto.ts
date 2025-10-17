import { z } from "zod";

export const userLoginSchema = z.object({
  email: z.email("Insira um e-mail válido."),
  password: z.string().min(6, "Insira uma senha válida."),
});

export type UserLoginDto = z.infer<typeof userLoginSchema>;
