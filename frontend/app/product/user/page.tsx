"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import { apiFetch } from "@/lib/http";
import { Feedback } from "@/components/Feedback";
import styles from "./page.module.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

function formatBRL(value: number) {
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Componente de imagem otimizada
function OptimizedProductImage({ src, alt }: { src: string; alt: string }) {
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
    return <div className={styles.noImage}>Imagem indisponível</div>;
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

export default function ProductDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState(0);

  // Pegar o ID e a página de origem da URL
  const productId = searchParams.get("id");
  const fromPage = searchParams.get("from") || "1";

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ success: boolean; data: Product; product?: Product }>(
        `/products/${productId}`
      );
      // O backend pode retornar em `data` ou em `product`
      const productData = response.data || (response as any).product;
      setProduct(productData);
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro ao carregar produto.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!product) return;

    if (product.stock === 0) {
      setFeedback({
        message: "Produto sem estoque disponível.",
        type: "error",
      });
      return;
    }

    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
      });

      setFeedback({
        message: "Produto adicionado ao carrinho!",
        type: "success",
      });

      // Redirecionar para o carrinho após 1 segundo
      setTimeout(() => {
        router.push("/cart");
      }, 1000);
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro ao adicionar ao carrinho.",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <p>Produto não encontrado.</p>
        <button onClick={() => router.push(`/?page=${fromPage}`)} className={styles.backButton}>
          Voltar para a página inicial
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.push(`/?page=${fromPage}`)} className={styles.backButton}>
        ← Voltar
      </button>

      {feedback && <Feedback message={feedback.message} type={feedback.type} />}

      <div className={styles.productDetail}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            {product.images?.[selectedImage] ? (
              <OptimizedProductImage src={product.images[selectedImage]} alt={product.name} />
            ) : (
              <div className={styles.noImage}>Sem imagem</div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ""}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <OptimizedProductImage src={image} alt={`${product.name} - ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.productName}>{product.name}</h1>

          <div className={styles.priceSection}>
            <span className={styles.price}>{formatBRL(product.price)}</span>
          </div>

          <div className={styles.stockSection}>
            {product.stock > 0 ? (
              <span className={styles.inStock}>
                ✓ Em estoque ({product.stock} {product.stock === 1 ? "unidade" : "unidades"})
              </span>
            ) : (
              <span className={styles.outOfStock}>✗ Sem estoque</span>
            )}
          </div>

          <div className={styles.description}>
            <h2>Descrição</h2>
            <p>{product.description}</p>
          </div>

          <button onClick={handleBuy} className={styles.buyButton} disabled={product.stock === 0}>
            {product.stock === 0 ? "Sem estoque" : "Comprar agora"}
          </button>
        </div>
      </div>
    </div>
  );
}
