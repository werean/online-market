"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import { useAuth } from "@/lib/contexts/AuthContext";
import styles from "./page.module.css";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
};

export default function EditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: [] as string[],
  });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  useEffect(() => {
    if (!authLoading && !user?.isSeller) {
      router.push("/login");
      return;
    }

    if (!authLoading && user?.isSeller) {
      loadProduct();
    }
  }, [authLoading, user, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ success: boolean; data: Product }>(
        `/products/${productId}`
      );

      if (response.success) {
        setProduct(response.data);
        setFormData({
          name: response.data.name,
          description: response.data.description || "",
          price: String(response.data.price / 100), // Convert from cents to reais
          stock: String(response.data.stock),
          images: response.data.images || [],
        });
      }
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro ao carregar produto.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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

      await apiFetch(`/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: priceInCents,
          stock,
          images: formData.images,
        }),
      });

      setFeedback({ message: "Produto atualizado com sucesso!", type: "success" });

      setTimeout(() => {
        // Força recarregar a página home para limpar o cache
        router.push("/?refresh=" + Date.now());
      }, 1500);
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro ao atualizar produto.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await apiFetch(`/products/${productId}`, {
        method: "DELETE",
      });

      setFeedback({ message: "Produto deletado com sucesso!", type: "success" });

      setTimeout(() => {
        // Força recarregar a página home para limpar o cache
        router.push("/?refresh=" + Date.now());
      }, 1500);
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro ao deletar produto.",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <p>Produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Editar Produto</h1>

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
            <SubmitButton loading={isSubmitting}>Salvar Alterações</SubmitButton>

            <button
              type="button"
              onClick={handleDelete}
              className={styles.deleteBtn}
              disabled={isSubmitting}
            >
              Deletar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
