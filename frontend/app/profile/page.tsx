"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { apiFetch } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        address: user.address || "",
      });
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await apiFetch(`/users/update/${user?.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      setFeedback({ message: "Perfil atualizado com sucesso!", type: "success" });
      await refreshUser();
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro ao atualizar perfil.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await apiFetch(`/users/${user?.id}`, {
        method: "DELETE",
      });

      setFeedback({ message: "Perfil deletado com sucesso!", type: "success" });
      
      // Fazer logout e redirecionar
      setTimeout(async () => {
        await apiFetch("/auth/logout", { method: "POST" });
        await refreshUser();
        router.push("/");
      }, 1500);
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro ao deletar perfil.",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Meu Perfil</h1>

        {feedback && <Feedback message={feedback.message} type={feedback.type} />}

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Nome"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <TextField
            label="E-mail"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <TextField
            label="Endereço"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <SubmitButton loading={isSubmitting}>
            Salvar alterações
          </SubmitButton>
        </form>

        <div className={styles.deleteSection}>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className={styles.deleteBtn}
              disabled={isSubmitting}
            >
              Deletar Perfil
            </button>
          ) : (
            <div className={styles.confirmDelete}>
              <p className={styles.confirmText}>
                Tem certeza que deseja deletar seu perfil? Esta ação não pode ser desfeita.
              </p>
              <div className={styles.confirmButtons}>
                <button
                  type="button"
                  onClick={handleDelete}
                  className={styles.confirmBtn}
                  disabled={isSubmitting}
                >
                  Sim, deletar
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
