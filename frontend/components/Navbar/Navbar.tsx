"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCart } from "@/lib/contexts/CartContext";
import { apiFetch } from "@/lib/http";
import { Cart } from "@/components/Cart/Cart";
import styles from "./Navbar.module.css";

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function Navbar() {
  const { user, loading, refreshUser } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const [showCart, setShowCart] = useState(false);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      refreshUser();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      // Salvar a intenção de ir para o carrinho
      router.push("/login?redirect=/cart");
    } else if (user.isSeller) {
      // Vendedores não têm carrinho
      return;
    } else {
      setShowCart(!showCart);
    }
  };

  return (
    <>
      <header className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          Online Market
        </Link>

        {!loading && (
          <nav className={styles.nav}>
            {user ? (
              <>
                <span className={styles.greeting}>Olá, {user.name}</span>
                {user.isSeller ? (
                  <>
                    <Link href="/products/new" className={styles.link}>
                      Adicionar produto
                    </Link>
                    <Link href="/products/csv" className={styles.link}>
                      Adicionar múltiplos produtos
                    </Link>
                  </>
                ) : (
                  <div className={styles.cartWrapper}>
                    <Link href="/profile" className={styles.profileBtn} aria-label="Perfil">
                      <ProfileIcon />
                    </Link>
                    <button
                      onClick={handleCartClick}
                      className={styles.cartBtn}
                      aria-label="Carrinho"
                    >
                      <CartIcon />
                      {items.length > 0 && <span className={styles.cartBadge}>{items.length}</span>}
                    </button>
                  </div>
                )}
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <div className={styles.cartWrapper}>
                  <button
                    onClick={handleCartClick}
                    className={styles.cartBtn}
                    aria-label="Carrinho"
                  >
                    <CartIcon />
                    {items.length > 0 && <span className={styles.cartBadge}>{items.length}</span>}
                  </button>
                </div>
                <Link href="/login" className={styles.link}>
                  Entrar
                </Link>
                <Link href="/register" className={styles.link}>
                  Criar conta
                </Link>
                <Link href="/register/seller" className={styles.link}>
                  Cadastrar como vendedor
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      {showCart && user && !user.isSeller && (
        <div className={styles.cartDropdown}>
          <Cart />
        </div>
      )}

      {/* Mostrar carrinho para usuários não logados também */}
      {showCart && !user && (
        <div className={styles.cartDropdown}>
          <Cart />
        </div>
      )}
    </>
  );
}
