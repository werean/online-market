import { FastifyInstance } from "fastify";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { PrismaClient } from "../generated/prisma";
import { verifySellerAccess, verifyJWT } from "../middlewares/authMiddleware";

export async function productRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const productService = new ProductService(prisma);
  const productController = new ProductController(productService);

  // Rotas públicas (sem autenticação)
  fastify.get("/", productController.getAll);

  // Rotas protegidas - apenas vendedores autenticados
  fastify.post("/", {
    preHandler: [verifySellerAccess],
    handler: productController.create,
  });

  fastify.post("/upload", {
    preHandler: [verifySellerAccess],
    handler: productController.uploadCSV,
  });

  fastify.get("/mine", {
    preHandler: [verifySellerAccess],
    handler: productController.getMine,
  });

  fastify.put("/:id", {
    preHandler: [verifySellerAccess],
    handler: productController.update,
  });

  fastify.delete("/:id", {
    preHandler: [verifySellerAccess],
    handler: productController.delete,
  });
}
