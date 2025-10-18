"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validators/reset-password";
import { apiFetch } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (token) {
      setValue("token", token);
    }
  }, [token, setValue]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    setFeedback(null);

    try {
      await apiFetch("/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setIsRedirecting(true);
      router.push("/login");
    } catch (error: any) {
      setFeedback({
        message: error.message || "Token inválido ou expirado.",
        type: "error",
      });
      setLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="loading-container">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Redefinir Senha</h1>

      <Feedback message={feedback?.message} type={feedback?.type} />

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input type="hidden" {...register("token")} />

        <TextField
          label="Nova Senha"
          type="password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <SubmitButton loading={loading}>Redefinir senha</SubmitButton>
      </form>

      <div className={styles.links}>
        <Link href="/login" className={styles.link}>
          Voltar para login
        </Link>
      </div>
    </div>
  );
}
