"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.message}>Página de pagamento em desenvolvimento...</p>
        <button onClick={() => router.back()} className={styles.button}>
          Voltar
        </button>
      </div>
    </main>
  );
}
