import { apiFetch } from "./http";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // inteiro
  images: string[]; // array de URLs
  stock?: number;
  createdAt: string; // usar como "Data de publicação"
  seller?: { id: string; name: string; email: string };
  lowStock?: boolean;
};

export type ProductsResponse = {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
};

export async function listAllProducts(page = 1, limit = 12) {
  const response = await apiFetch<{
    success: boolean;
    message: string;
    data: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>(`/products?page=${page}&limit=${limit}`);

  return {
    products: response.data || [],
    pagination: response.pagination,
  };
}

// 2) Produtos do vendedor logado - usando a rota real do backend: GET /products/mine
export async function listMyProducts(page = 1, limit = 12) {
  const response = await apiFetch<{ success: boolean; message: string; data: Product[] }>(
    `/products/mine?page=${page}&limit=${limit}`
  );
  return {
    products: response.data || [],
    pagination: undefined,
  };
}

// 3) Criar produto
export type CreateProductInput = {
  name: string;
  price: number; // inteiro
  description: string;
  images: string[]; // URLs
  stock?: number;
};
export async function createProduct(data: CreateProductInput) {
  return apiFetch<Product>(`/products`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 4) Atualizar produto
export type UpdateProductInput = Partial<CreateProductInput>;
export async function updateProduct(id: string, data: UpdateProductInput) {
  return apiFetch<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// 5) Deletar produto
export async function deleteProduct(id: string) {
  return apiFetch<{ message: string }>(`/products/${id}`, { method: "DELETE" });
}

// 6) Upload CSV (com progresso) - usando a rota real do backend: POST /products/upload
export function uploadProductsCSV(file: File, onProgress?: (pct: number) => void) {
  return new Promise<{
    success: number;
    failed: number;
    errors: string[];
    lowStockProducts: string[];
  }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const base = process.env.NEXT_PUBLIC_API_URL!;
    // Rota real do backend: /products/upload
    xhr.open("POST", `${base}/products/upload`, true);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (!onProgress || !e.lengthComputable) return;
      onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Falha no upload (${xhr.status})`));
        }
      } catch {
        reject(new Error("Resposta inválida do servidor"));
      }
    };

    xhr.onerror = () => reject(new Error("Erro de rede no upload"));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
