import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigátorio"),
  email: z.email("E-mail inválido"),
  address: z.string().min(5, "Endereço inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
