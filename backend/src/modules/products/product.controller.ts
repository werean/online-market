import { FastifyRequest, FastifyReply } from "fastify";
import { ProductService } from "./product.service";
import { createProductSchema, CreateProductDto } from "./dto/create-product.dto";
import { updateProductSchema, UpdateProductDto } from "./dto/update-product.dto";

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * Criar novo produto (somente vendedor)
   */
  create = async (request: FastifyRequest<{ Body: CreateProductDto }>, reply: FastifyReply) => {
    try {
      const data = createProductSchema.parse(request.body);
      const userId = request.userId!;

      const product = await this.productService.createProduct(data, userId);

      return reply.status(201).send({
        success: true,
        message: "Produto criado com sucesso.",
        data: product,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        message: "Não foi possível criar o produto.",
        error: err.message,
      });
    }
  };

  /**
   * Atualizar produto (somente vendedor dono)
   */
  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const data = updateProductSchema.parse(request.body);
      const userId = request.userId!;

      const product = await this.productService.updateProduct(id, data, userId);

      return reply.status(200).send({
        success: true,
        message: "Produto atualizado com sucesso.",
        data: product,
      });
    } catch (err: any) {
      const status = err.message.includes("não encontrado")
        ? 404
        : err.message.includes("permissão")
        ? 403
        : 400;

      return reply.status(status).send({
        success: false,
        message: "Não foi possível atualizar o produto.",
        error: err.message,
      });
    }
  };

  /**
   * Deletar produto (somente vendedor dono)
   */
  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const userId = request.userId!;

      const result = await this.productService.deleteProduct(id, userId);

      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      const status = err.message.includes("não encontrado")
        ? 404
        : err.message.includes("permissão")
        ? 403
        : 400;

      return reply.status(status).send({
        success: false,
        message: "Não foi possível deletar o produto.",
        error: err.message,
      });
    }
  };

  /**
   * Listar produtos do vendedor autenticado
   */
  getMine = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.userId!;
      const products = await this.productService.getSellerProducts(userId);

      return reply.status(200).send({
        success: true,
        message: "Produtos listados com sucesso.",
        data: products,
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: "Erro ao listar produtos.",
        error: err.message,
      });
    }
  };

  /**
   * Listar todos os produtos (público) com paginação e filtros
   */
  getAll = async (
    request: FastifyRequest<{
      Querystring: {
        page?: string;
        limit?: string;
        name?: string;
        minPrice?: string;
        maxPrice?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    try {
      const page = parseInt(request.query.page || "1", 10);
      const limit = parseInt(request.query.limit || "10", 10);

      const filters: any = {};
      if (request.query.name) {
        filters.name = request.query.name;
      }
      if (request.query.minPrice) {
        filters.minPrice = parseInt(request.query.minPrice, 10);
      }
      if (request.query.maxPrice) {
        filters.maxPrice = parseInt(request.query.maxPrice, 10);
      }

      const result = await this.productService.getAllProductsPaginated(page, limit, filters);

      return reply.status(200).send({
        success: true,
        message: "Produtos listados com sucesso.",
        data: result.products,
        pagination: result.pagination,
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: "Erro ao listar produtos.",
        error: err.message,
      });
    }
  };

  /**
   * Upload de produtos via CSV (somente vendedor)
   */
  uploadCSV = async (
    request: FastifyRequest<{ Body: { filePath: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { filePath } = request.body;
      const userId = request.userId!;

      if (!filePath) {
        return reply.status(400).send({
          success: false,
          message: "O caminho do arquivo CSV é obrigatório.",
        });
      }

      const result = await this.productService.bulkInsertFromCSV(filePath, userId);

      return reply.status(201).send({
        success: true,
        message: `Upload concluído. ${result.success} produtos criados, ${result.failed} falharam.`,
        data: {
          success: result.success,
          failed: result.failed,
          errors: result.errors,
          lowStockProducts: result.lowStockProducts,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: "Erro ao processar o arquivo CSV.",
        error: err.message,
      });
    }
  };
}
