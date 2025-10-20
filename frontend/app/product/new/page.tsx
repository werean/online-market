"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import { useAuth } from "@/lib/contexts/AuthContext";
import styles from "./page.module.css";

export default function NewProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: [] as string[],
  });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  if (!authLoading && !user?.isSeller) {
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      setFeedback({ message: "Insira uma URL válida", type: "error" });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl("");
    setFeedback(null);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const priceInCents = Math.round(parseFloat(formData.price) * 100);
      const stock = parseInt(formData.stock);

      if (isNaN(priceInCents) || priceInCents <= 0) {
        setFeedback({ message: "Preço inválido", type: "error" });
        setIsSubmitting(false);
        return;
      }

      if (isNaN(stock) || stock < 0) {
        setFeedback({ message: "Estoque inválido", type: "error" });
        setIsSubmitting(false);
        return;
      }

      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: priceInCents,
          stock,
          images: formData.images,
        }),
      });

      setFeedback({ message: "Produto criado com sucesso!", type: "success" });

      setTimeout(() => {
        // Força recarregar a página home para limpar o cache
        router.push("/?refresh=" + Date.now());
      }, 1500);
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro ao criar produto.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Novo Produto</h1>

        {feedback && <Feedback message={feedback.message} type={feedback.type} />}

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Nome do Produto"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
            />
          </div>

          <TextField
            label="Preço (R$)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <TextField
            label="Estoque"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          <div className={styles.formGroup}>
            <label className={styles.label}>Imagens do Produto</label>

            {formData.images.length > 0 && (
              <div className={styles.imageList}>
                {formData.images.map((img, index) => (
                  <div key={index} className={styles.imageItem}>
                    <img src={img} alt={`Imagem ${index + 1}`} className={styles.imageThumbnail} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className={styles.removeImageBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.addImageGroup}>
              <input
                type="text"
                placeholder="URL da imagem"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className={styles.imageInput}
              />
              <button type="button" onClick={handleAddImage} className={styles.addImageBtn}>
                Adicionar Imagem
              </button>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <SubmitButton loading={isSubmitting}>Criar Produto</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
