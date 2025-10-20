"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recoverPasswordSchema, RecoverPasswordInput } from "@/lib/validators/recover-password";
import { apiFetch, ApiError } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import Timer from "@/components/Timer/Timer";
import styles from "./page.module.css";

export default function RecoverPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );
  const [nextAllowedAt, setNextAllowedAt] = useState<Date | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RecoverPasswordInput>({
    resolver: zodResolver(recoverPasswordSchema),
  });

  const onSubmit = async (data: RecoverPasswordInput) => {
    setLoading(true);
    setFeedback(null);

    try {
      const result = await apiFetch<{ message: string; nextAllowedAt?: string; code?: string }>(
        "/auth/recover-password",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (result.nextAllowedAt) {
        setNextAllowedAt(new Date(result.nextAllowedAt));
      }

      setFeedback({
        message: result.code
          ? "Código enviado! Verifique o console do navegador (F12)."
          : "Se o e-mail existir, enviaremos um código.",
        type: "success",
      });

      // Redirect to verification page immediately on success
      setTimeout(() => {
        router.push(`/verify-token?email=${encodeURIComponent(data.email)}`);
      }, 1500);
    } catch (error: any) {
      setLoading(false);

      if (error instanceof ApiError && error.status === 429) {
        setFeedback({
          message: error.message || "Aguarde antes de solicitar um novo código.",
          type: "error",
        });
      } else {
        // Even on error, show success message for security (don't reveal if email exists)
        setFeedback({
          message: "Se o e-mail existir, enviaremos um código.",
          type: "success",
        });

        // Still redirect to verification page
        setTimeout(() => {
          router.push(`/verify-token?email=${encodeURIComponent(data.email)}`);
        }, 1500);
      }
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Recuperar Senha</h1>
      <p className={styles.subtitle}>Digite seu e-mail para receber um código de verificação</p>

      <Feedback message={feedback?.message} type={feedback?.type} />

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <TextField
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <SubmitButton loading={loading} disabled={!!nextAllowedAt}>
          Enviar código
        </SubmitButton>
      </form>

      <Timer targetDate={nextAllowedAt} onComplete={() => setNextAllowedAt(null)} />

      <div className={styles.links}>
        <Link href="/login" className={styles.link}>
          Voltar para login
        </Link>
      </div>
    </div>
  );
}
