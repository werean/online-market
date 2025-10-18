import { apiFetch } from "./http";

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  images: string[];
  stock: number;
  lowStock: boolean;
  seller?: { id: string; name: string; email: string };
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
  return apiFetch<ProductsResponse>(`/products?page=${page}&limit=${limit}`);
}

export async function listMyProducts(page = 1, limit = 12) {
  return apiFetch<ProductsResponse>(`/products/mine?page=${page}&limit=${limit}`);
}
