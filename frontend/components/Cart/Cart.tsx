"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import styles from "./Cart.module.css";

function formatBRL(value: number) {
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function Cart() {
  const { items, updateQuantity, removeItem, total, loading } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      await updateQuantity(id, quantity);
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
    } catch (error) {
      console.error("Erro ao remover item:", error);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.emptyCart}>
          <p>Seu carrinho está vazio</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h2 className={styles.cartTitle}>Carrinho de Compras</h2>

      {loading && <p>Carregando...</p>}

      <div className={styles.itemsList}>
        {items.map((item) => (
          <div key={item.id} className={styles.cartItem}>
            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{item.name}</h3>
              <p className={styles.itemPrice}>{formatBRL(item.price)}</p>
            </div>

            <div className={styles.quantityControls}>
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                className={styles.quantityBtn}
                disabled={loading}
              >
                −
              </button>
              <span className={styles.quantity}>{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                className={styles.quantityBtn}
                disabled={loading}
              >
                +
              </button>
            </div>

            <div className={styles.itemTotal}>{formatBRL(item.price * item.quantity)}</div>

            <button
              onClick={() => handleRemoveItem(item.id)}
              className={styles.removeBtn}
              aria-label="Remover do carrinho"
              disabled={loading}
            >
              Excluir
            </button>
          </div>
        ))}
      </div>

      <div className={styles.cartFooter}>
        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>Total:</span>
          <span className={styles.totalValue}>{formatBRL(total)}</span>
        </div>

        <button onClick={handleCheckout} className={styles.checkoutBtn} disabled={loading}>
          Pagar
        </button>
      </div>
    </div>
  );
}
