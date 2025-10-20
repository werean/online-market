"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCart } from "@/lib/contexts/CartContext";
import { listAllProducts, type Product } from "@/lib/products";
import styles from "./page.module.css";

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function formatBRL(value: number) {
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function HomePage() {
  const { user, loading: loadingSession } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
      });
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
    }
  };

  useEffect(() => {
    if (loadingSession) return;

    // Se for vendedor, redireciona para /products
    if (user?.isSeller) {
      router.push("/products");
      return;
    }

    loadProducts();
  }, [user, loadingSession, page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await listAllProducts(page, 12);
      setItems(res.products || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loadingSession || user?.isSeller) {
    return <div className={styles.center}>Carregando...</div>;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Produtos Disponíveis</h1>

      {loading && <div className={styles.center}>Carregando produtos...</div>}

      {!loading && items.length === 0 && (
        <div className={styles.empty}>Ainda não há produtos disponíveis</div>
      )}

      {!loading && items.length > 0 && (
        <>
          <section className={styles.grid}>
            {items.map((product) => (
              <article key={product.id} className={styles.productCard}>
                <h3 className={styles.productName}>{product.name}</h3>

                <div className={styles.productImage}>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <span className={styles.noImage}>Sem imagem</span>
                  )}
                </div>

                <div className={styles.productPrice}>{formatBRL(product.price)}</div>

                <div className={styles.productActions}>
                  <button
                    className={styles.buyButton}
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    Comprar
                  </button>
                  <button 
                    className={styles.cartButton} 
                    aria-label="Adicionar ao carrinho"
                    onClick={() => handleAddToCart(product)}
                  >
                    <CartIcon />
                  </button>
                </div>
              </article>
            ))}
          </section>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={styles.pageButton}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={styles.pageButton}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
