import { z } from "zod";

export const UpdateUserSchema = z.object({
  name: z.string().min(1, "Nome precisa conter mais do que um caracter.").optional(),
  email: z.email("Insira um e-mail válido.").optional(),
  address: z.string().min(5, "insira um e-mail válido.").optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
