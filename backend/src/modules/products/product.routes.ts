import { FastifyInstance } from "fastify";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { ProductRepository } from "./product.repository";
import { prisma } from "../../config/prisma";
import { verifySellerAccess, verifyJWT } from "../auth/auth.middleware";

export async function productRoutes(fastify: FastifyInstance) {
  const productRepository = new ProductRepository(prisma);
  const productService = new ProductService(productRepository);
  const productController = new ProductController(productService);

  fastify.get("/", productController.getAll);
  fastify.get("/:id", productController.getById);

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
    handler: productController.getProduct,
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
