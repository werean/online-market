import { CreateProductDto, createProductSchema } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductRepository } from "./product.repository";
import * as fs from "fs";
import z from "zod";
import csvParser from "csv-parser";
import { ZodError } from "zod";

export class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  private logInfo(message: string): void {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}] [CSV Upload] ${message}`);
  }

  private logError(message: string): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [CSV Upload] ${message}`);
  }
  private safeParseImages(images: string): string[] {
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  }

  async createProduct(data: CreateProductDto, userId: string) {
    const product = await this.productRepository.createProduct({
      name: data.name,
      description: data.description,
      price: data.price,
      images: JSON.stringify(data.images),
      stock: data.stock,
      sellerId: userId,
    });

    return {
      ...product,
      images: this.safeParseImages(product.images),
      lowStock: product.stock <= 10,
    };
  }

  async updateProduct(id: string, data: UpdateProductDto, userId: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    if (product.sellerId !== userId) {
      throw new Error("Você não tem permissão para editar este produto.");
    }

    const updatedProduct = await this.productRepository.updateProduct(id, {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.images && { images: JSON.stringify(data.images) }),
      ...(data.stock !== undefined && { stock: data.stock }),
    });

    return {
      ...updatedProduct,
      images: JSON.parse(updatedProduct.images),
      lowStock: updatedProduct.stock <= 10,
    };
  }

  async deleteProduct(id: string, userId: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    if (product.sellerId !== userId) {
      throw new Error("Você não tem permissão para deletar este produto.");
    }

    await this.productRepository.deleteProduct(id);

    return {
      message: "Produto deletado com sucesso",
    };
  }

  async getSellerProducts(userId: string, page = 1, limit = 10) {
    const products = await this.productRepository.findAllBySeller(userId, page, limit);
    const total = await this.productRepository.countBySeller(userId);

    const mappedProducts = products.map((product) => {
      let images: string[] = [];

      try {
        images = this.safeParseImages(product.images);
      } catch {
        images = [];
      }

      return {
        ...product,
        images,
        lowStock: product.stock <= 10,
      };
    });

    return {
      products: mappedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    return {
      ...product,
      images: this.safeParseImages(product.images),
      lowStock: product.stock <= 10,
    };
  }

  async getAllProductsPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: {
      name?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ) {
    const { products, total } = await this.productRepository.findAllPaginated(page, limit, filters);

    const totalPages = Math.ceil(total / limit);

    return {
      products: products.map((product) => ({
        ...product,
        images: this.safeParseImages(product.images),
        lowStock: product.stock <= 10,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async bulkInsertFromCSV(
    filePath: string,
    userId: string
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
    lowStockProducts: string[];
  }> {
    const startTime = performance.now();
    const fileName = filePath.split("/").pop() || filePath;

    this.logInfo(`Iniciando processamento do arquivo: ${fileName}`);
    this.logInfo(`Vendedor ID: ${userId}`);

    const errors: string[] = [];
    const lowStockProducts: string[] = [];
    let success = 0;
    let failed = 0;
    let lineNumber = 0;
    let batch: any[] = [];
    const BATCH_SIZE = 10; // Processa 10 linhas por vez

    try {
      // Criar um stream assíncrono iterável
      const stream = fs.createReadStream(filePath).pipe(csvParser());

      // Processar linha por linha sem acumular tudo na memória
      for await (const row of stream) {
        lineNumber++;
        batch.push({ row, lineNumber });

        // Quando o lote atingir o tamanho definido, processar em paralelo
        if (batch.length >= BATCH_SIZE) {
          const results = await this.processBatch(batch, userId);
          success += results.success;
          failed += results.failed;
          errors.push(...results.errors);
          lowStockProducts.push(...results.lowStockProducts);

          this.logInfo(
            `Progresso: ${lineNumber} linhas processadas (${success} sucesso, ${failed} falhas)`
          );

          // Limpar o lote
          batch = [];
        }
      }

      // Processar o lote final (se houver linhas restantes)
      if (batch.length > 0) {
        const results = await this.processBatch(batch, userId);
        success += results.success;
        failed += results.failed;
        errors.push(...results.errors);
        lowStockProducts.push(...results.lowStockProducts);
      }

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      this.logInfo(`Processamento concluído: ${success} produtos criados, ${failed} falharam`);
      this.logInfo(`Total de linhas processadas: ${lineNumber}`);
      this.logInfo(`Tempo total de execução: ${duration}ms`);

      return {
        success,
        failed,
        errors,
        lowStockProducts,
      };
    } catch (err: any) {
      this.logError(`Erro ao processar arquivo`);
      throw new Error(`Erro interno ao processar o arquivo CSV`);
    } finally {
      // Limpeza do arquivo temporário
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logInfo(`Arquivo temporário removido`);
        }
      } catch (cleanupErr: any) {
        this.logError(`Aviso: Não foi possível remover arquivo temporário`);
      }
    }
  }

  private async processBatch(
    batch: Array<{ row: any; lineNumber: number }>,
    userId: string
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
    lowStockProducts: string[];
  }> {
    const CONCURRENCY_LIMIT = 5;
    const results: Array<{
      success: boolean;
      productName?: string;
      lowStock?: boolean;
      error?: string;
    }> = [];

    // Processar com concorrência controlada
    for (let i = 0; i < batch.length; i += CONCURRENCY_LIMIT) {
      const chunk = batch.slice(i, i + CONCURRENCY_LIMIT);
      const promises = chunk.map(({ row, lineNumber }) => this.processRow(row, lineNumber, userId));

      const chunkResults = await Promise.allSettled(promises);

      chunkResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: `Linha ${chunk[index].lineNumber}: ${result.reason}`,
          });
        }
      });
    }

    // Agregar resultados
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const lowStockProducts: string[] = [];

    results.forEach((result) => {
      if (result.success) {
        success++;
        if (result.lowStock && result.productName) {
          lowStockProducts.push(result.productName);
        }
      } else {
        failed++;
        if (result.error) {
          errors.push(result.error);
        }
      }
    });

    return { success, failed, errors, lowStockProducts };
  }

  private async processRow(
    row: any,
    lineNumber: number,
    userId: string
  ): Promise<{
    success: boolean;
    productName?: string;
    lowStock?: boolean;
    error?: string;
  }> {
    try {
      // Validação numérica segura ANTES da validação Zod
      const price = Number(row.price);
      if (isNaN(price)) {
        throw new Error("Preço inválido - deve ser um número válido");
      }

      const stock = Number(row.stock);
      if (isNaN(stock)) {
        throw new Error("Estoque inválido - deve ser um número válido");
      }

      // Validar e preparar dados
      const images = row.images ? row.images.split(";").map((img: string) => img.trim()) : [];

      const productData = {
        name: row.name,
        description: row.description || undefined,
        price: price,
        images,
        stock: stock,
      };

      // Validar com Zod
      const validatedData = createProductSchema.parse(productData);

      // Criar produto
      const product = await this.createProduct(validatedData, userId);

      return {
        success: true,
        productName: product.name,
        lowStock: product.lowStock,
      };
    } catch (err: any) {
      // Tratamento diferenciado para erros de validação do Zod
      if (err instanceof ZodError) {
        const fieldErrors = err.issues
          .map((issue: any) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        return {
          success: false,
          error: `Linha ${lineNumber}: Erro de validação - ${fieldErrors}`,
        };
      }

      // Outros tipos de erro
      return {
        success: false,
        error: `Linha ${lineNumber}: ${err.message}`,
      };
    }
  }
}
