"use client";
import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { CSVUploader } from "@/components/CSVUploader/CSVUploader";
import { downloadCSVTemplate } from "@/lib/csv";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function UploadCSVPage() {
  const { user, loading } = useProtectedRoute();
  const router = useRouter();

  if (loading) return <div className={styles.center}>Carregando…</div>;
  if (!user) return null;

  if (!user.isSeller) {
    router.replace("/");
    return null;
  }

  const handleDownloadTemplate = () => {
    const headers = ["name", "description", "price", "stock", "images"];
    const mockData = [
      [
        "Smartphone Galaxy S23",
        "Smartphone Samsung Galaxy S23 128GB 5G com câmera tripla de 50MP",
        "299990",
        "50",
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c;https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      ],
      [
        "Notebook Dell Inspiron",
        "Notebook Dell Inspiron 15 Intel Core i7 16GB RAM 512GB SSD",
        "449990",
        "30",
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed;https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
      ],
      [
        "Fone de Ouvido JBL",
        "Fone de Ouvido JBL Bluetooth com Cancelamento de Ruído",
        "39990",
        "100",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e;https://images.unsplash.com/photo-1484704849700-f032a568e944",
      ],
      [
        "Smart TV LG 55 polegadas",
        "Smart TV LG 55 polegadas 4K UHD com ThinQ AI e WebOS",
        "279990",
        "25",
        "https://images.unsplash.com/photo-1593784991095-a205069470b6;https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
      ],
      [
        "Cadeira Gamer DXRacer",
        "Cadeira Gamer DXRacer com Suporte Lombar e Ajuste de Altura",
        "149990",
        "40",
        "https://images.unsplash.com/photo-1598550476439-6847785fcea6;https://images.unsplash.com/photo-1580480055273-228ff5388ef8",
      ],
      [
        "Mouse Logitech MX Master 3",
        "Mouse Sem Fio Logitech MX Master 3 com Sensor Darkfield 4000 DPI",
        "54990",
        "80",
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46;https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7",
      ],
      [
        "Teclado Mecânico Keychron K8",
        "Teclado Mecânico Keychron K8 Wireless RGB Hot-Swappable",
        "69990",
        "60",
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3;https://images.unsplash.com/photo-1618384887929-16ec33fab9ef",
      ],
      [
        "Webcam Logitech C920",
        "Webcam Logitech C920 Full HD 1080p com Microfone Estéreo",
        "49990",
        "70",
        "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04;https://images.unsplash.com/photo-1614624532983-4ce03382d63d",
      ],
      [
        "SSD Kingston 1TB",
        "SSD Kingston NVMe M.2 1TB com Velocidade de Leitura 3500MB/s",
        "59990",
        "90",
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b;https://images.unsplash.com/photo-1531492746076-161ca9bcad58",
      ],
      [
        "Monitor LG UltraWide 29 polegadas",
        "Monitor LG UltraWide 29 polegadas Full HD IPS HDR10",
        "129990",
        "35",
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf;https://images.unsplash.com/photo-1585792180666-f7347c490ee2",
      ],
      [
        "Caixa de Som JBL Flip 6",
        "Caixa de Som Portátil JBL Flip 6 Bluetooth à Prova d Água",
        "79990",
        "55",
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1;https://images.unsplash.com/photo-1545454675-3531b543be5d",
      ],
      [
        "Tablet Samsung Galaxy Tab S8",
        "Tablet Samsung Galaxy Tab S8 11 polegadas 128GB Wi-Fi com S Pen",
        "349990",
        "45",
        "https://images.unsplash.com/photo-1561154464-82e9adf32764;https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
      ],
      [
        "Smartwatch Apple Watch Series 8",
        "Apple Watch Series 8 GPS 45mm Caixa de Alumínio com Pulseira Esportiva",
        "429990",
        "20",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d;https://images.unsplash.com/photo-1579586337278-3befd40fd17a",
      ],
      [
        "Impressora HP DeskJet",
        "Impressora Multifuncional HP DeskJet 2774 Jato de Tinta Colorida Wi-Fi",
        "39990",
        "65",
        "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6;https://images.unsplash.com/photo-1612817159949-195b6eb9e31a",
      ],
      [
        "Roteador TP-Link Archer AX50",
        "Roteador Wi-Fi 6 TP-Link Archer AX50 Dual Band Gigabit",
        "44990",
        "75",
        "https://images.unsplash.com/photo-1606904825846-647eb07f5be2;https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
      ],
    ];

    downloadCSVTemplate(headers, "template-produtos.csv", mockData);
  };

  const handleResult = (data: any) => {
    console.log("Upload concluído:", data);
    // Opcional: redirecionar após alguns segundos
    // setTimeout(() => router.push('/products'), 3000);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Adicionar múltiplos produtos</h1>

      <p className={styles.description}>
        Envie um arquivo CSV com seus produtos. Cada coluna deve conter um campo específico:
      </p>

      <ul className={styles.columnsList}>
        <li>
          <code>Coluna A (name)</code> - Nome do produto - máximo 120 caracteres (obrigatório)
        </li>
        <li>
          <code>Coluna B (description)</code> - Descrição do produto (obrigatório)
        </li>
        <li>
          <code>Coluna C (price)</code> - Preço em centavos, valor inteiro (obrigatório)
        </li>
        <li>
          <code>Coluna D (stock)</code> - Quantidade em estoque (obrigatório)
        </li>
        <li>
          <code>Coluna E (images)</code> - URLs das imagens separadas por ponto-e-vírgula (opcional)
        </li>
      </ul>

      <div className={styles.note}>
        <strong>⚠️ Importante:</strong> Cada item deve estar em sua própria coluna. Não use aspas
        duplas (") nos nomes dos produtos.
      </div>

      <button onClick={handleDownloadTemplate} className={styles.downloadButton}>
        📥 Baixar modelo CSV
      </button>

      <CSVUploader
        action="/products/upload"
        fieldName="file"
        accept=".csv"
        maxSizeMB={10}
        requiredColumns={["name", "description", "price", "stock"]}
        onResult={handleResult}
      />
    </main>
  );
}
