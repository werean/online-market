"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { apiFetch } from "@/lib/http";
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

export function Navbar() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      refreshUser();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      router.push("/login?redirect=cart");
    } else {
      router.push("/cart");
    }
  };

  return (
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
                <button onClick={handleCartClick} className={styles.cartBtn} aria-label="Carrinho">
                  <CartIcon />
                </button>
              )}
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Sair
              </button>
            </>
          ) : (
            <>
              <button onClick={handleCartClick} className={styles.cartBtn} aria-label="Carrinho">
                <CartIcon />
              </button>
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
  );
}
