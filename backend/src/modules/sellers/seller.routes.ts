import { FastifyInstance } from "fastify";
import { SellerController } from "./seller.controller";
import { SellerService } from "./seller.service";
import { SellerRepository } from "./seller.repository";
import { prisma } from "../../config/prisma";

export async function sellerRoutes(fastify: FastifyInstance) {
  const sellerRepository = new SellerRepository(prisma);
  const sellerService = new SellerService(sellerRepository);
  const sellerController = new SellerController(sellerService);

  fastify.post("/register", sellerController.create);
  fastify.put("/update/:id", sellerController.update);
  fastify.get("/", sellerController.getAll);
  fastify.get("/:id", sellerController.getOne);
}
