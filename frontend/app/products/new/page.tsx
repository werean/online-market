"use client";
import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { createProduct } from "@/lib/products";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./page.module.css";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import { useState } from "react";

const schema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(120, "Nome deve ter no máximo 120 caracteres"),
  price: z
    .string()
    .min(1)
    .transform((v) => parseInt(v, 10)),
  description: z.string().min(3),
  imageUrls: z.string().min(1, "Informe ao menos 1 URL de imagem"), // separado por vírgula
  stock: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});
type Input = z.infer<typeof schema>;

export default function NewProductPage() {
  const { user, loading } = useProtectedRoute();
  const [fb, setFb] = useState<{ message?: string; type?: "error" | "success" }>({});
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);

  if (loading) return <div className={styles.center}>Carregando…</div>;
  if (!user) return null;
  if (!user.isSeller) return <div className={styles.center}>Acesso restrito a vendedores.</div>;

  function onSelectFiles(files: FileList | null) {
    if (!files) {
      setPreviewFiles([]);
      return;
    }
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviewFiles(urls);
  }

  const onSubmit = async (data: Input) => {
    setFb({});
    try {
      const images = data.imageUrls
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await createProduct({
        name: data.name,
        price: data.price,
        description: data.description,
        images,
        stock: data.stock,
      });
      setFb({ message: "Produto criado com sucesso.", type: "success" });
      reset();
      setPreviewFiles([]);
    } catch (e: any) {
      setFb({ message: e.message || "Falha ao criar produto.", type: "error" });
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Novo produto</h1>
      <Feedback {...fb} />
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <TextField label="Nome" {...register("name")} error={errors.name?.message} />
        <TextField
          label="Preço (inteiro)"
          type="number"
          inputMode="numeric"
          {...register("price")}
          error={errors.price?.message}
        />
        <TextField
          label="Descrição"
          {...register("description")}
          error={errors.description?.message}
        />
        <TextField
          label="URLs de imagem (separe por vírgula)"
          {...register("imageUrls")}
          error={errors.imageUrls?.message}
        />
        <TextField
          label="Estoque (opcional)"
          type="number"
          inputMode="numeric"
          {...register("stock")}
          error={errors.stock?.message}
        />

        {/* upload local para preview apenas */}
        <label className={styles.label}>
          <span className={styles.labelText}>Selecionar imagens (preview, não persiste)</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onSelectFiles(e.target.files)}
          />
        </label>
        {previewFiles.length > 0 && (
          <div className={styles.previewGrid}>
            {previewFiles.map((src, i) => (
              <img key={i} src={src} alt={`preview-${i}`} className={styles.preview} />
            ))}
          </div>
        )}

        <SubmitButton type="submit">Criar produto</SubmitButton>
      </form>
    </main>
  );
}
