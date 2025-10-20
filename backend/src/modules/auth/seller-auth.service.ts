import { PrismaClient } from "../../generated/prisma";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { SellerRepository } from "../sellers/seller.repository";

export class SellerAuthService {
  private prisma: PrismaClient;
  private sellerRepository: SellerRepository;

  constructor(prisma: PrismaClient, sellerRepository: SellerRepository) {
    this.prisma = prisma;
    this.sellerRepository = sellerRepository;
  }

  async login(email: string, password: string) {
    const seller = await this.sellerRepository.findWithPassword(email);
    if (!seller) {
      throw new Error("Vendedor não encontrado.");
    }
    if (seller.isDeleted) {
      throw new Error("Vendedor inativo");
    }
    const isPasswordValid = await compare(password, seller.password);
    if (!isPasswordValid) {
      throw new Error("Senha inválida.");
    }
    const token = jwt.sign(
      {
        userId: seller.id,
        email: seller.email,
        isSeller: true,
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
        id: seller.id,
        name: seller.name,
        email: seller.email,
        isSeller: true,
      },
    };
  }

  /**
   * Generates a 6-digit recovery code and creates a password reset token.
   * Implements cooldown (30s) and TTL (15min).
   */
  async generateRecoveryToken(
    email: string
  ): Promise<{ nextAllowedAt: Date | null; code?: string }> {
    const seller = await this.sellerRepository.findByEmail(email);
    if (!seller) {
      // Don't reveal if email exists for security
      return { nextAllowedAt: null };
    }

    // Check for existing active token
    const existingToken = await this.prisma.passwordResetToken.findUnique({
      where: { email },
    });

    const now = new Date();

    // Check cooldown period (30 seconds)
    if (existingToken?.resendAvailableAt && existingToken.resendAvailableAt > now) {
      throw new Error("Aguarde antes de solicitar um novo código.");
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code with SHA-256
    const tokenHash = createHash("sha256").update(code).digest("hex");

    // Set expiration (15 minutes)
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    // Set next allowed resend time (30 seconds)
    const resendAvailableAt = new Date(now.getTime() + 30 * 1000);

    // Upsert token (delete old and create new or create if doesn't exist)
    if (existingToken) {
      await this.prisma.passwordResetToken.delete({
        where: { email },
      });
    }

    await this.prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt,
        resendAvailableAt,
        status: "active",
      },
    });

    // Return code in development, hide in production
    if (process.env.NODE_ENV !== "production") {
      return { nextAllowedAt: resendAvailableAt, code };
    }

    return { nextAllowedAt: resendAvailableAt };
  }

  async verifyRecoveryToken(email: string, code: string): Promise<boolean> {
    const tokenHash = createHash("sha256").update(code).digest("hex");

    const token = await this.prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!token) {
      throw new Error("Token não encontrado.");
    }

    if (token.status !== "active") {
      throw new Error("Token já foi utilizado.");
    }

    if (new Date() > token.expiresAt) {
      throw new Error("Token expirado.");
    }

    if (token.tokenHash !== tokenHash) {
      // Increment attempts
      await this.prisma.passwordResetToken.update({
        where: { email },
        data: { attempts: token.attempts + 1 },
      });

      // Mark as invalid after 3 attempts
      if (token.attempts + 1 >= 3) {
        await this.prisma.passwordResetToken.update({
          where: { email },
          data: { status: "invalid" },
        });
        throw new Error("Token inválido após múltiplas tentativas.");
      }

      throw new Error("Token inválido.");
    }

    // Mark token as verified
    await this.prisma.passwordResetToken.update({
      where: { email },
      data: { verified: true },
    });

    return true;
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!token) {
      throw new Error("Token não encontrado.");
    }

    if (!token.verified) {
      throw new Error("Token não foi verificado.");
    }

    if (token.status !== "active") {
      throw new Error("Token já foi utilizado.");
    }

    if (new Date() > token.expiresAt) {
      throw new Error("Token expirado.");
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await this.sellerRepository.updatePassword(email, hashedPassword);

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { email },
      data: { status: "used" },
    });
  }
}
