"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { loginSchema, LoginInput } from "@/lib/validators/login";
import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/contexts/AuthContext";
import { TextField } from "@/components/form/TextField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Feedback } from "@/components/Feedback";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { refreshUser, clearCache } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );

  useEffect(() => {
    if (redirect === "cart") {
      setFeedback({
        message: "Para utilizar o carrinho você precisa possuir uma conta.",
        type: "error",
      });
    }
  }, [redirect]);

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
      // Tentar login como usuário comum primeiro
      let loginSuccess = false;
      let lastError = null;

      try {
        await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify(data),
        });
        loginSuccess = true;
      } catch (error: any) {
        lastError = error;

        // Se falhar, tentar como vendedor
        try {
          await apiFetch("/auth/seller/login", {
            method: "POST",
            body: JSON.stringify(data),
          });
          loginSuccess = true;
        } catch (sellerError: any) {
          lastError = sellerError;
        }
      }

      if (!loginSuccess) {
        throw lastError;
      }

      setIsRedirecting(true);
      clearCache(); // Limpar cache antes de atualizar
      await refreshUser();

      if (redirect === "cart") {
        router.push("/cart");
      } else {
        router.push("/");
      }

      // Forçar reload para limpar qualquer cache do Next.js
      setTimeout(() => {
        window.location.href = redirect === "cart" ? "/cart" : "/";
      }, 100);
    } catch (error: any) {
      setFeedback({ message: error.message || "Erro ao fazer login.", type: "error" });
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
        <h1 className={styles.title}>Login</h1>

        {feedback && <Feedback message={feedback.message} type={feedback.type} />}

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
    </div>
  );
}
