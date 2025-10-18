"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { loginSchema, LoginInput } from "@/lib/validators/login";
import { apiFetch } from "@/lib/http";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setFeedback(null);

    try {
      await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setFeedback({ message: "Login realizado com sucesso.", type: "success" });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      setFeedback({ message: error.message || "Erro ao fazer login.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Login</h1>

      <Feedback message={feedback?.message} type={feedback?.type} />

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <TextField
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          label="Senha"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />

        <SubmitButton loading={loading}>Entrar</SubmitButton>
      </form>

      <div className={styles.links}>
        Não tem uma conta?{" "}
        <Link href="/register" className={styles.link}>
          Registre-se
        </Link>
        <br />
        <Link href="/recover-password" className={styles.link}>
          Esqueceu sua senha?
        </Link>
      </div>
    </div>
  );
}
