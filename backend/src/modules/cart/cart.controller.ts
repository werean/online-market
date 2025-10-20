import { FastifyReply, FastifyRequest } from "fastify";
import { CartService } from "./cart.service";

export class CartController {
  private cartService: CartService;

  constructor(cartService: CartService) {
    this.cartService = cartService;
  }

  async getCart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const cart = await this.cartService.getCart(userId);

      return reply.status(200).send({
        success: true,
        data: cart,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Erro ao buscar carrinho",
      });
    }
  }

  async addItem(
    request: FastifyRequest<{
      Body: { productId: string; quantity?: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { productId, quantity = 1 } = request.body;

      console.log(
        `[CART] addItem - userId: ${userId}, productId: ${productId}, quantity: ${quantity}`
      );

      if (!productId) {
        return reply.status(400).send({
          success: false,
          message: "productId é obrigatório",
        });
      }

      if (quantity <= 0) {
        return reply.status(400).send({
          success: false,
          message: "Quantidade deve ser maior que 0",
        });
      }

      const item = await this.cartService.addItem(userId, productId, quantity);

      return reply.status(200).send({
        success: true,
        message: "Item adicionado ao carrinho",
        data: item,
      });
    } catch (error: any) {
      console.error(`[CART] addItem error:`, error.message || error);
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Erro ao adicionar item ao carrinho",
        error: error.message || "Unknown error",
      });
    }
  }

  async updateQuantity(
    request: FastifyRequest<{
      Params: { productId: string };
      Body: { quantity: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { productId } = request.params;
      const { quantity } = request.body;

      console.log(
        `[CART] updateQuantity - userId: ${userId}, productId: ${productId}, quantity: ${quantity}`
      );

      if (typeof quantity !== "number") {
        return reply.status(400).send({
          success: false,
          message: "Quantidade inválida",
        });
      }

      const item = await this.cartService.updateQuantity(userId, productId, quantity);

      return reply.status(200).send({
        success: true,
        message: quantity <= 0 ? "Item removido do carrinho" : "Quantidade atualizada",
        data: item,
      });
    } catch (error: any) {
      console.error(`[CART] updateQuantity error:`, error.message || error);
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Erro ao atualizar quantidade",
        error: error.message || "Unknown error",
      });
    }
  }

  async removeItem(
    request: FastifyRequest<{
      Params: { productId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { productId } = request.params;

      console.log(`[CART] removeItem - userId: ${userId}, productId: ${productId}`);

      const result = await this.cartService.removeItem(userId, productId);

      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error(`[CART] removeItem error:`, error.message || error);
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Erro ao remover item",
        error: error.message || "Unknown error",
      });
    }
  }

  async clearCart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const result = await this.cartService.clearCart(userId);

      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Erro ao limpar carrinho",
      });
    }
  }
}
