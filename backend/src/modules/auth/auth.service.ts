import { PrismaClient } from "../../generated/prisma";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, randomUUID } from "crypto";
import { UserRepository } from "../users/user.repository";

export class AuthService {
  private prisma: PrismaClient;
  private userRepository: UserRepository;

  constructor(prisma: PrismaClient, userRepository: UserRepository) {
    this.prisma = prisma;
    this.userRepository = userRepository;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findWithPassword(email);
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

  async recoverPassword(unformatedEmail: string): Promise<void> {
    const email = unformatedEmail.trim().toLocaleLowerCase();
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("E-mail inválido");
    }
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    console.log(token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new Error("Token inválido ou expirado.");
    }

    if (resetToken.used) {
      throw new Error("Token inválido ou expirado.");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error("Token inválido ou expirado.");
    }

    const hashedPassword = await hash(newPassword, 10);

    await this.userRepository.updatePassword(resetToken.email, hashedPassword);

    await this.prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });
  }

  async getUserById(userId: string) {
    return await this.userRepository.findById(userId);
  }
}
