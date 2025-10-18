import { z } from "zod";

export const updateProductSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.").optional(),
  description: z.string().optional(),
  price: z.number().int().positive("O preço deve ser maior que zero.").optional(),
  images: z
    .array(z.string().url("URL de imagem inválida."))
    .min(1, "Pelo menos uma imagem é obrigatória.")
    .optional(),
  stock: z.number().int().min(0, "O estoque não pode ser negativo.").optional(),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
