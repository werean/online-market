import { PrismaClient } from "../../generated/prisma";

export class SellerRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByEmail(email: string) {
    return this.prisma.seller.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
  }

  async findWithPassword(email: string) {
    return this.prisma.seller.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.seller.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.seller.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
  }

  async createSeller(data: { name: string; email: string; address: string; password: string }) {
    return this.prisma.seller.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
  }

  async updateSeller(id: string, data: Partial<{ name: string; email: string; address: string }>) {
    return this.prisma.seller.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
  }

  async deleteSeller(id: string) {
    return this.prisma.seller.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
  }

  async updatePassword(email: string, hashedPassword: string) {
    return this.prisma.seller.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }
}
