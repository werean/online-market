"use client";
import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCart } from "@/lib/contexts/CartContext";
import { listAllProducts, listMyProducts, type Product } from "@/lib/products";
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

// Cache global para produtos
const productsCache = new Map<
  number,
  { products: Product[]; totalPages: number; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Componente de imagem otimizada com lazy loading
function OptimizedImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset quando a src muda
    setLoaded(false);
    setError(false);

    // Criar uma nova imagem para preload
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (error) {
    return <span className={styles.noImage}>Sem imagem</span>;
  }

  if (!loaded) {
    return (
      <div className={styles.imagePlaceholder}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}

export default function HomePage() {
  const { user, loading: loadingSession } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Obter página da URL
  const page = parseInt(searchParams.get("page") || "1", 10);
  const refresh = searchParams.get("refresh");

  // Limpar cache quando refresh está presente
  useEffect(() => {
    if (refresh) {
      productsCache.clear();
      // Remover o parâmetro refresh da URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("refresh");
      window.history.replaceState({}, "", newUrl.pathname + newUrl.search);
    }
  }, [refresh]);

  // Listener para limpar cache quando login/logout ocorrer
  useEffect(() => {
    const handleClearCache = () => {
      productsCache.clear();
      setItems([]);
      setLoading(true);
    };

    window.addEventListener("clearProductsCache", handleClearCache);
    return () => window.removeEventListener("clearProductsCache", handleClearCache);
  }, []);

  // Função para buscar produtos com cache
  const loadProducts = useCallback(
    async (pageNum: number) => {
      // Verificar se está no cache e não expirou
      const cached = productsCache.get(pageNum);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setItems(cached.products);
        setTotalPages(cached.totalPages);
        setLoading(false);
        return;
      }

      try {
        let res;
        if (user?.isSeller) {
          res = await listMyProducts(pageNum, 10);
        } else {
          res = await listAllProducts(pageNum, 12);
        }

        const data = {
          products: res.products || [],
          totalPages: res.pagination?.totalPages || 1,
          timestamp: Date.now(),
        };

        // Salvar no cache
        productsCache.set(pageNum, data);

        setItems(data.products);
        setTotalPages(data.totalPages);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Prefetch da próxima página
  const prefetchNextPage = useCallback(async (currentPage: number, maxPages: number) => {
    const nextPage = currentPage + 1;
    if (nextPage > maxPages) return;

    // Verificar se já está no cache
    const cached = productsCache.get(nextPage);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return;

    // Buscar em background
    try {
      const res = await listAllProducts(nextPage, 12);
      productsCache.set(nextPage, {
        products: res.products || [],
        totalPages: res.pagination?.totalPages || 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Erro ao fazer prefetch:", error);
    }
  }, []);

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

  const changePage = (newPage: number) => {
    startTransition(() => {
      router.push(`/?page=${newPage}`, { scroll: false });
    });
  };

  useEffect(() => {
    if (loadingSession) return;

    setLoading(true);
    loadProducts(page);
  }, [user, loadingSession, page, loadProducts]);

  // Redirecionar para página 1 se a página atual for maior que o total
  useEffect(() => {
    if (!loading && totalPages > 0 && page > totalPages) {
      router.push(`/?page=1`);
    }
  }, [loading, page, totalPages, router]);

  // Prefetch da próxima página após carregar
  useEffect(() => {
    if (!loading && totalPages > 0 && page < totalPages) {
      prefetchNextPage(page, totalPages);
    }
  }, [loading, page, totalPages, prefetchNextPage]);

  if (loadingSession) {
    return <div className={styles.center}>Carregando...</div>;
  }

  return (
    <main className={styles.main}>
      {loading && <div className={styles.center}>Carregando produtos...</div>}

      {!loading && items.length === 0 && user?.isSeller && (
        <div className={styles.empty}>
          <p>Você ainda não possui produtos cadastrados</p>
          <Link href="/product/new" className={styles.addButton}>
            Adicionar produto
          </Link>
        </div>
      )}

      {!loading && items.length === 0 && !user?.isSeller && (
        <div className={styles.empty}>Ainda não há produtos disponíveis</div>
      )}

      {!loading && items.length > 0 && (
        <>
          <section
            className={styles.grid}
            style={{
              opacity: isPending ? 0.6 : 1,
              transition: "opacity 0.2s ease-in-out",
              pointerEvents: isPending ? "none" : "auto",
            }}
          >
            {items.map((product) => (
              <article key={product.id} className={styles.productCard}>
                <Link
                  href={
                    user?.isSeller
                      ? `/product/seller?id=${product.id}`
                      : `/product/user?id=${product.id}&from=${page}`
                  }
                  className={styles.productLink}
                >
                  <h3 className={styles.productName}>{product.name}</h3>

                  <div className={styles.productImage}>
                    {product.images?.[0] ? (
                      <OptimizedImage src={product.images[0]} alt={product.name} />
                    ) : (
                      <span className={styles.noImage}>Sem imagem</span>
                    )}
                  </div>

                  <div className={styles.productPrice}>{formatBRL(product.price)}</div>
                  {user?.isSeller && (
                    <div className={styles.productStock}>Estoque: {product.stock}</div>
                  )}
                </Link>

                {!user?.isSeller && (
                  <div className={styles.productActions}>
                    <Link
                      href={`/product/user?id=${product.id}&from=${page}`}
                      className={styles.buyButton}
                    >
                      Comprar
                    </Link>
                    <button
                      className={styles.cartButton}
                      aria-label="Adicionar ao carrinho"
                      onClick={() => handleAddToCart(product)}
                    >
                      <CartIcon />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page === 1 || isPending}
                className={styles.pageButton}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => changePage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || isPending}
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
