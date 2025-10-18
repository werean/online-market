"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { recoverPasswordSchema, RecoverPasswordInput } from "@/lib/validators/recover-password";
import { apiFetch } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import styles from "./page.module.css";

export default function RecoverPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPasswordInput>({
    resolver: zodResolver(recoverPasswordSchema),
  });

  const onSubmit = async (data: RecoverPasswordInput) => {
    setLoading(true);
    setFeedback(null);

    try {
      await apiFetch("/recover-password", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setFeedback({
        message: "Se o e-mail existir, enviaremos instruções de recuperação.",
        type: "success",
      });
    } catch (error: any) {
      setFeedback({
        message: "Se o e-mail existir, enviaremos instruções de recuperação.",
        type: "success",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Recuperar Senha</h1>

      <Feedback message={feedback?.message} type={feedback?.type} />

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <TextField
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <SubmitButton loading={loading}>Enviar instruções</SubmitButton>
      </form>

      <div className={styles.links}>
        <Link href="/login" className={styles.link}>
          Voltar para login
        </Link>
      </div>
    </div>
  );
}
