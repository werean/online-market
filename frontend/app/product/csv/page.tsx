"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { CSVUploader } from "@/components/CSVUploader/CSVUploader";
import styles from "./page.module.css";

export default function CSVUploadPage() {
  const router = useRouter();
  const { user, loading, clearCache } = useAuth();

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
              <strong>Formato do arquivo:</strong> A primeira linha deve conter os cabeçalhos
            </li>
            <li>
              <strong>Colunas obrigatórias:</strong> <code>name</code>, <code>price</code>,{" "}
              <code>stock</code>, <code>images</code>
            </li>
            <li>
              <strong>Coluna opcional:</strong> <code>description</code>
            </li>
            <li>
              <strong>Preço:</strong> Deve estar em centavos (ex: 1990 = R$ 19,90)
            </li>
            <li>
              <strong>Separador de colunas:</strong> Use vírgula (,)
            </li>
            <li>
              <strong>Imagens:</strong> Separe múltiplas URLs por <strong>espaço</strong>
            </li>
            <li>
              <strong>Exemplo de linha:</strong>
              <br />
              <code style={{ fontSize: "0.85em" }}>
                Notebook Dell,Notebook 16GB RAM,449990,30,https://exemplo.com/img1.jpg
                https://exemplo.com/img2.jpg
              </code>
            </li>
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
              clearCache(); // Limpar cache antes de redirecionar
              setTimeout(() => {
                router.push("/?refresh=" + Date.now()); // Forçar reload com refresh param
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
