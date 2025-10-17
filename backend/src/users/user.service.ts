import { FastifyRequest } from "fastify";
import { PrismaClient } from "../generated/prisma";
import { hash } from "bcryptjs";

export class UserService {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: { name: string; email: string; address: string; password: string }) {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 8;
    const hashedPass = await hash(data.password, saltRounds);
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
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }
    return user;
  }
  async update(id: string, data: Partial<{ name: string; email: string; address: string }>) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return this.prisma.user.update({ where: { id }, data });
  }
  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
