import { FastifyRequest } from "fastify";
import { PrismaClient } from "../generated/prisma";
import { hash } from "bcryptjs";

export class UserService {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: { name: string; email: string; address: string; password: string }) {
    const hashedPass = await hash(data.password, 8);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPass,
      },
    });
  }
  async findAll() {
    return this.prisma.user.findMany({
      where: {
        isDeleted: false,
      },
    });
  }
  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async update(id: string, data: Partial<{ name: string; email: string; address: string }>) {
    return this.prisma.user.update({ where: { id }, data });
  }
  async delete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
