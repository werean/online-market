"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { listAllProducts, listMyProducts, type Product } from "@/lib/products";
import styles from "./page.module.css";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const { user, loading: loadingSession } = useAuth();
  const [items, setItems] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (loadingSession) return;

    (async () => {
      try {
        setLoading(true);
        let res;
        if (user?.isSeller) {
          res = await listMyProducts(currentPage, itemsPerPage);
        } else {
          res = await listAllProducts(currentPage, itemsPerPage);
        }
        setItems(res.products || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, loadingSession, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className={styles.main}>
      {loading ? (
        <div className={styles.placeholder}>Carregando...</div>
      ) : user?.isSeller ? (
        items && items.length > 0 ? (
          <>
            <h1 className={styles.title}>Meus produtos</h1>
            <section className={styles.grid}>
              {items.map((p) => (
                <Link key={p.id} href={`/product/seller?id=${p.id}`} className={styles.card}>
                  {p.images && p.images.length > 0 && (
                    <div className={styles.cardImage}>
                      <img src={p.images[0]} alt={p.name} />
                    </div>
                  )}
                  <div className={styles.cardContent}>
                    <div className={styles.cardTitle}>{p.name}</div>
                    <div className={styles.cardPrice}>{formatBRL(p.price)}</div>
                    <div className={styles.cardStock}>Estoque: {p.stock}</div>
                  </div>
                </Link>
              ))}
            </section>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={styles.paginationBtn}
                >
                  Anterior
                </button>
                <span className={styles.paginationInfo}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={styles.paginationBtn}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.placeholder}>Você ainda não possui produtos cadastrados</div>
            <div className={styles.cta}>
              <Link href="/product/new" className={styles.btn}>
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
              <Link key={p.id} href={`/product/user?id=${p.id}`} className={styles.card}>
                {p.images && p.images.length > 0 && (
                  <div className={styles.cardImage}>
                    <img src={p.images[0]} alt={p.name} />
                  </div>
                )}
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>{p.name}</div>
                  <div className={styles.cardPrice}>{formatBRL(p.price)}</div>
                </div>
              </Link>
            ))}
          </section>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={styles.paginationBtn}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.placeholder}>Ainda não possuímos produtos</div>
      )}
    </main>
  );
}
