"use client";
import styles from "./ProductCard.module.css";
import { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const created = new Date(product.createdAt).toLocaleDateString("pt-BR");
  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        {/* usa primeira imagem válida (se houver) */}
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className={styles.img} />
        ) : (
          <div className={styles.placeholder}>Sem imagem</div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.desc}>{product.description}</p>
        <div className={styles.meta}>
          <span>Publicado em {created}</span>
          <strong>R$ {product.price}</strong>
        </div>
      </div>
    </article>
  );
}
