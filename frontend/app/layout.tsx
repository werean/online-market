import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { CartProvider } from "@/lib/contexts/CartContext";
import { Navbar } from "@/components/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Online Market",
  description: "Marketplace online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className={styles.container}>{children}</div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
