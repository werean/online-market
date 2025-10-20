import { z } from "zod";

export const CreateSellerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.email("E-mail inválido"),
  address: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type CreateSellerDto = z.infer<typeof CreateSellerSchema>;
