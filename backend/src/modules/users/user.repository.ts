import { PrismaClient } from "../../generated/prisma";

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
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
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
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
    return this.prisma.user.findMany({
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

  async createUser(data: { name: string; email: string; address: string; password: string }) {
    return this.prisma.user.create({
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

  async updateUser(id: string, data: Partial<{ name: string; email: string; address: string }>) {
    return this.prisma.user.update({
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

  async deleteUser(id: string) {
    return this.prisma.user.update({
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
    return this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }
}
