import { PrismaClient } from "../../generated/prisma";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
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
        isSeller: user.isSeller,
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
        isSeller: user.isSeller,
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
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
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
        attempts: 0,
        verified: false,
      },
    });

    // In production, send email here
    console.log(`[PASSWORD RECOVERY] Code for ${email}: ${code}`);
    console.log(`[PASSWORD RECOVERY] Valid until: ${expiresAt.toISOString()}`);

    // Return code only in development mode
    return {
      nextAllowedAt: resendAvailableAt,
      ...(process.env.NODE_ENV === "development" && { code }),
    };
  }

  /**
   * Verifies the recovery code.
   * Max 3 attempts, invalidates on success.
   */
  async verifyRecoveryToken(email: string, code: string): Promise<{ verified: boolean }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!resetToken) {
      throw new Error("Token não encontrado.");
    }

    if (resetToken.status !== "active") {
      throw new Error("Token inválido ou já utilizado.");
    }

    if (resetToken.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.update({
        where: { email },
        data: { status: "expired" },
      });
      throw new Error("Token expirado.");
    }

    if (resetToken.attempts >= 3) {
      await this.prisma.passwordResetToken.update({
        where: { email },
        data: { status: "blocked" },
      });
      throw new Error("Número máximo de tentativas excedido.");
    }

    // Hash the provided code and compare
    const codeHash = createHash("sha256").update(code).digest("hex");

    if (codeHash !== resetToken.tokenHash) {
      await this.prisma.passwordResetToken.update({
        where: { email },
        data: { attempts: resetToken.attempts + 1 },
      });
      throw new Error("Código inválido.");
    }

    // Mark as verified (but keep active for the reset password step)
    await this.prisma.passwordResetToken.update({
      where: { email },
      data: { verified: true },
    });

    return { verified: true };
  }

  /**
   * Resets the password using a verified token.
   * Token must be recently verified and not expired.
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!resetToken) {
      throw new Error("Token não encontrado.");
    }

    if (!resetToken.verified) {
      throw new Error("Token não foi verificado.");
    }

    if (resetToken.status !== "active") {
      throw new Error("Token inválido ou já utilizado.");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error("Token expirado.");
    }

    // Hash the new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "8", 10);
    const hashedPassword = await hash(newPassword, saltRounds);

    // Update user password
    await this.userRepository.updatePassword(email, hashedPassword);

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { email },
      data: { status: "used" },
    });
  }

  async getUserById(userId: string) {
    return await this.userRepository.findById(userId);
  }
}
