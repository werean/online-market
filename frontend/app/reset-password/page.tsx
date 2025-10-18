"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validators/reset-password";
import { apiFetch } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.css";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

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
    if (!email) {
      router.push("/recover-password");
    } else {
      setValue("email", email);
    }
  }, [email, setValue, router]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    setFeedback(null);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setFeedback({
        message: "Senha redefinida com sucesso!",
        type: "success",
      });

      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      const errorData = await error.json?.();
      setFeedback({
        message: errorData?.message || "Erro ao redefinir senha.",
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
      <p className={styles.subtitle}>
        Digite sua nova senha para <strong>{email}</strong>
      </p>

      <Feedback message={feedback?.message} type={feedback?.type} />

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input type="hidden" {...register("email")} />

        <TextField
          label="Nova Senha"
          type="password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <TextField
          label="Confirmar Nova Senha"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
