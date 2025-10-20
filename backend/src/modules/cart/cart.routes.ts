import { FastifyInstance } from "fastify";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartRepository } from "./cart.repository";
import { prisma } from "../../config/prisma";
import { verifyJWT } from "../auth/auth.middleware";

const cartRepository = new CartRepository(prisma);
const cartService = new CartService(cartRepository);
const cartController = new CartController(cartService);

export async function cartRoutes(fastify: FastifyInstance) {
  // Todas as rotas do carrinho requerem autenticação
  fastify.addHook("onRequest", verifyJWT);

  // GET /cart - Buscar carrinho do usuário
  fastify.get("/", async (request, reply) => {
    return cartController.getCart(request, reply);
  });

  // POST /cart/add - Adicionar item ao carrinho
  fastify.post<{
    Body: { productId: string; quantity?: number };
  }>(
    "/add",
    async (request, reply) => {
      return cartController.addItem(request, reply);
    }
  );

  // PUT /cart/:productId - Atualizar quantidade de um item
  fastify.put<{
    Params: { productId: string };
    Body: { quantity: number };
  }>(
    "/:productId",
    async (request, reply) => {
      return cartController.updateQuantity(request, reply);
    }
  );

  // DELETE /cart/:productId - Remover item do carrinho
  fastify.delete<{
    Params: { productId: string };
  }>(
    "/:productId",
    async (request, reply) => {
      return cartController.removeItem(request, reply);
    }
  );

  // DELETE /cart - Limpar carrinho
  fastify.delete("/", async (request, reply) => {
    return cartController.clearCart(request, reply);
  });
}
