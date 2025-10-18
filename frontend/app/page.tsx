"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { listAllProducts, listMyProducts, type Product } from "@/lib/products";
import styles from "./page.module.css";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function HomePage() {
  const { user, loading: loadingSession } = useAuth();
  const [items, setItems] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingSession) return;

    (async () => {
      try {
        let res;
        if (user?.isSeller) {
          res = await listMyProducts(1, 12);
        } else {
          res = await listAllProducts(1, 12);
        }
        setItems(res.products || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, loadingSession]);

  return (
    <main>
      {loading ? (
        <div className={styles.placeholder}>Carregando...</div>
      ) : user?.isSeller ? (
        items && items.length > 0 ? (
          <>
            <h1 className={styles.title}>Meus produtos</h1>
            <section className={styles.grid}>
              {items.map((p) => (
                <article key={p.id} className={styles.card}>
                  <div className={styles.cardTitle}>{p.name}</div>
                  <div className={styles.cardPrice}>{formatBRL(p.price)}</div>
                </article>
              ))}
            </section>
          </>
        ) : (
          <>
            <div className={styles.placeholder}>Você ainda não possui produtos cadastrados</div>
            <div className={styles.cta}>
              <Link href="/products/new" className={styles.btn}>
                Adicionar produto
              </Link>
            </div>
          </>
        )
      ) : items && items.length > 0 ? (
        <>
          <h1 className={styles.title}>Produtos</h1>
          <section className={styles.grid}>
            {items.map((p) => (
              <article key={p.id} className={styles.card}>
                <div className={styles.cardTitle}>{p.name}</div>
                <div className={styles.cardPrice}>{formatBRL(p.price)}</div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <div className={styles.placeholder}>Ainda não possuímos produtos</div>
      )}
    </main>
  );
}
