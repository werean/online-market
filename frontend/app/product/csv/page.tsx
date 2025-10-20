"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { CSVUploader } from "@/components/CSVUploader/CSVUploader";
import styles from "./page.module.css";

export default function CSVUploadPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user?.isSeller) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user?.isSeller) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Upload de Produtos via CSV</h1>

        <div className={styles.instructions}>
          <h2>Instruções:</h2>
          <ol>
            <li>
              O arquivo CSV deve conter as colunas: <code>name</code>, <code>description</code>,{" "}
              <code>price</code>, <code>stock</code>, <code>images</code>
            </li>
            <li>O preço deve estar em centavos (ex: 1990 = R$ 19,90)</li>
            <li>Use vírgula (,) como separador</li>
            <li>A primeira linha deve ser o cabeçalho</li>
            <li>Múltiplas imagens devem ser separadas por espaço</li>
          </ol>

          <a
            href="/exemplo-produtos.csv"
            download="exemplo-produtos.csv"
            className={styles.downloadButton}
          >
            📥 Baixar arquivo de exemplo
          </a>
        </div>

        <CSVUploader
          action="/products/upload"
          requiredColumns={["name", "price", "stock"]}
          maxSizeMB={5}
          onResult={(data) => {
            // Redirecionar após 3 segundos se houver sucesso
            if (data.success > 0) {
              setTimeout(() => {
                router.push("/");
              }, 3000);
            }
          }}
        />

        <div className={styles.actions}>
          <button onClick={() => router.push("/")} className={styles.backButton}>
            Voltar para pagina inicial
          </button>
        </div>
      </div>
    </div>
  );
}
