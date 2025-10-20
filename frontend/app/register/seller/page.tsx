"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { registerSchema, RegisterInput } from "@/lib/validators/register";
import { apiFetch } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "../page.module.css";

export default function RegisterSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setFeedback(null);

    try {
      await apiFetch("/seller/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setIsRedirecting(true);
      router.push("/login");
    } catch (error: any) {
      setFeedback({ message: error.message || "Erro ao fazer cadastro.", type: "error" });
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
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cadastrar como Vendedor</h1>

        {feedback && <Feedback message={feedback.message} type={feedback.type} />}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <TextField label="Nome" {...register("name")} error={errors.name?.message} />

          <TextField
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          <TextField label="Endereço" {...register("address")} error={errors.address?.message} />

          <TextField
            label="Senha"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />

          <SubmitButton loading={loading}>Cadastrar como Vendedor</SubmitButton>
        </form>

        <p className={styles.link}>
          Já tem uma conta?{" "}
          <Link href="/login" className={styles.linkText}>
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
