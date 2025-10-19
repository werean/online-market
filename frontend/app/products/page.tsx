"use client";
import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { listMyProducts, Product } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function ProductsPage() {
  const { user, loading } = useProtectedRoute();
  const [items, setItems] = useState<Product[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && user && user.isSeller) {
      setBusy(true);
      listMyProducts()
        .then((res) => setItems(res.products || []))
        .finally(() => setBusy(false));
    }
  }, [loading, user]);

  if (loading) return <div className={styles.center}>Carregando…</div>;
  if (!user) return null;

  if (!user.isSeller) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Acesso restrito a vendedores</h1>
        <p className={styles.muted}>Sua conta não é de vendedor.</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Meus Produtos</h1>
        <div className={styles.actions}>
          <Link href="/products/new" className={styles.linkButton}>
            Adicionar produto
          </Link>
          <Link href="/products/csv" className={styles.linkButton}>
            Adicionar múltiplos produtos
          </Link>
        </div>
      </header>

      {busy && <div className={styles.center}>Carregando…</div>}

      {!busy && items.length === 0 && (
        <div className={styles.empty}>
          <p>Você ainda não possui produtos cadastrados.</p>
        </div>
      )}

      {!busy && items.length > 0 && (
        <div className={styles.grid}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
