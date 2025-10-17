import { PrismaClient } from "../generated/prisma";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }
    if (user.isDeleted) {
      throw new Error("Usuário inativo");
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Senha inválida.");
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isSeller: user.isDeleted,
      },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "7d",
      }
    );
    return {
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
