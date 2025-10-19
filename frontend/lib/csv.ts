/**
 * Utilitários para manipulação de arquivos CSV
 */

/**
 * Gera e baixa um arquivo CSV template com os cabeçalhos especificados
 */
export function downloadCSVTemplate(
  headers: string[],
  filename: string,
  mockData: string[][] = []
): void {
  let csvContent = headers.join(",") + "\n";

  // Adiciona dados de exemplo se fornecidos
  if (mockData.length > 0) {
    csvContent += mockData
      .map((row) =>
        row
          .map((cell) => {
            // Escapa células que contêm vírgula, aspas ou quebra de linha
            if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(",")
      )
      .join("\n");
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Lê os primeiros bytes de um arquivo CSV para obter o cabeçalho
 */
export function peekCSVHeader(file: File, maxBytes = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const slice = file.slice(0, maxBytes);

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstLine = text.split("\n")[0] || "";
      resolve(firstLine.trim());
    };

    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(slice);
  });
}

/**
 * Verifica se o cabeçalho CSV contém todas as colunas obrigatórias
 */
export function hasRequiredColumns(headerLine: string, required: string[]): boolean {
  const headers = headerLine
    .toLowerCase()
    .split(",")
    .map((h) => h.trim());
  return required.every((col) => headers.includes(col.toLowerCase()));
}
