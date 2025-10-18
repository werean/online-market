"use client";

import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.css";

export default function DashboardPage() {
  const { user, loading } = useProtectedRoute();

  if (loading) return <Spinner />;
  if (!user) return null;

  return (
    <main>
      <h1 className={styles.title}>Bem-vindo, {user.name}</h1>
      <p className={styles.subtitle}>Esta é sua área autenticada.</p>
    </main>
  );
}
