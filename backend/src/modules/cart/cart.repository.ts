import { PrismaClient } from "../../generated/prisma";

export class CartRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getCartItems(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async addItem(userId: string, productId: string, quantity: number = 1) {
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
            },
          },
        },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
          },
        },
      },
    });
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: {
        userId_productId: { userId, productId },
      },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
          },
        },
      },
    });
  }

  async removeItem(userId: string, productId: string) {
    return this.prisma.cartItem.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
