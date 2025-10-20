"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/http";
import { Feedback } from "@/components/Feedback";
import OTPInput from "@/components/OTPInput/OTPInput";
import Timer from "@/components/Timer/Timer";
import { Spinner } from "@/components/Spinner/Spinner";
import { SubmitButton } from "@/components/form/SubmitButton";
import styles from "./page.module.css";

function VerifyTokenContent() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );
  const [nextAllowedAt, setNextAllowedAt] = useState<Date | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/recover-password");
    }
  }, [email, router]);

  const handleVerifyCode = async () => {
    if (!email || code.length !== 6) return;

    setLoading(true);
    setFeedback(null);

    try {
      const result = await apiFetch<{ verified: boolean; message: string }>("/auth/verify-token", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      if (result.verified) {
        setFeedback({
          message: "Código verificado com sucesso!",
          type: "success",
        });

        // Redirect to reset password page
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setFeedback({
          message: "Código inválido. Tente novamente.",
          type: "error",
        });
      }
    } catch (error: any) {
      if (error instanceof ApiError) {
        setFeedback({
          message: error.message || "Código inválido. Tente novamente.",
          type: "error",
        });
      } else {
        setFeedback({
          message: "Erro ao verificar código. Tente novamente.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || nextAllowedAt) return;

    setLoading(true);
    setFeedback(null);
    setCode(""); // Limpa o código

    try {
      const result = await apiFetch<{ message: string; nextAllowedAt?: string; code?: string }>(
        "/auth/recover-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );

      if (result.nextAllowedAt) {
        setNextAllowedAt(new Date(result.nextAllowedAt));
      }

      // Log code to browser console in development
      if (result.code) {
      }

      setFeedback({
        message: result.code
          ? "Novo código enviado! Verifique o console do navegador (F12)."
          : "Novo código enviado!",
        type: "success",
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        setFeedback({
          message: error.message || "Erro ao reenviar código.",
          type: "error",
        });
      } else {
        setFeedback({
          message: "Erro ao reenviar código.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div>
      <h1 className={styles.title}>Verificar Código</h1>
      <p className={styles.subtitle}>
        Digite o código de 6 dígitos enviado para <strong>{email}</strong>
      </p>

      <Feedback message={feedback?.message} type={feedback?.type} />

      <div className={styles.otpContainer}>
        <OTPInput value={code} onChange={setCode} disabled={loading} />
      </div>

      <SubmitButton onClick={handleVerifyCode} loading={loading} disabled={code.length !== 6}>
        Verificar código
      </SubmitButton>

      <div className={styles.resendContainer}>
        {nextAllowedAt ? (
          <Timer targetDate={nextAllowedAt} onComplete={() => setNextAllowedAt(null)} />
        ) : (
          <button onClick={handleResend} className={styles.resendButton} disabled={loading}>
            Reenviar código
          </button>
        )}
      </div>

      <div className={styles.links}>
        <Link href="/recover-password" className={styles.link}>
          Voltar
        </Link>
      </div>
    </div>
  );
}

export default function VerifyTokenPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <VerifyTokenContent />
    </Suspense>
  );
}
