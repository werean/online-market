import { FastifyRequest, FastifyReply } from "fastify";
import { UserLoginDto, userLoginSchema } from "./dto/auth.dto";
import { SellerAuthService } from "./seller-auth.service";
import { RecoverPasswordDto, recoverPasswordSchema } from "./dto/recover-password.dto";
import { ResetPasswordDto, resetPasswordSchema } from "./dto/reset-password.dto";
import { VerifyTokenDto, verifyTokenSchema } from "./dto/verify-token.dto";

export class SellerAuthController {
  private sellerAuthService: SellerAuthService;

  constructor(sellerAuthService: SellerAuthService) {
    this.sellerAuthService = sellerAuthService;
  }

  login = async (request: FastifyRequest<{ Body: UserLoginDto }>, reply: FastifyReply) => {
    try {
      const { email, password } = userLoginSchema.parse(request.body);

      const login = await this.sellerAuthService.login(email, password);

      return reply
        .setCookie("auth_token", login.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
        .status(200)
        .send({ message: "Login realizado com sucesso", user: login.user });
    } catch (err: any) {
      return reply.status(400).send({
        message: "Erro ao realizar login.",
        error: err.message,
      });
    }
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return reply
        .clearCookie("auth_token", {
          path: "/",
        })
        .status(200)
        .send({ message: "Logout realizado com sucesso" });
    } catch (err: any) {
      return reply.status(400).send({
        message: "Erro ao realizar logout.",
        error: err.message,
      });
    }
  };

  /**
   * POST /auth/seller/recover - Generates and sends a 6-digit recovery code
   */
  recoverPassword = async (
    request: FastifyRequest<{ Body: RecoverPasswordDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { email } = recoverPasswordSchema.parse(request.body);
      const result = await this.sellerAuthService.generateRecoveryToken(email);

      return reply.status(200).send({
        message: "Se o e-mail existir, enviaremos um código de recuperação.",
        nextAllowedAt: result.nextAllowedAt,
        ...(result.code && { code: result.code }),
      });
    } catch (err: any) {
      if (err.message.includes("Aguarde")) {
        return reply.status(429).send({
          message: err.message,
        });
      }

      return reply.status(200).send({
        message: "Se o e-mail existir, enviaremos um código de recuperação.",
      });
    }
  };

  /**
   * POST /auth/seller/verify-token - Verifies the recovery code
   */
  verifyToken = async (
    request: FastifyRequest<{ Body: VerifyTokenDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { email, code } = verifyTokenSchema.parse(request.body);
      await this.sellerAuthService.verifyRecoveryToken(email, code);

      return reply.status(200).send({
        message: "Token verificado com sucesso.",
      });
    } catch (err: any) {
      return reply.status(400).send({
        message: "Falha ao verificar o token.",
        error: err.message,
      });
    }
  };

  /**
   * POST /auth/seller/reset-password - Resets the password with a valid token
   */
  resetPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { email, newPassword } = resetPasswordSchema.parse(request.body);
      await this.sellerAuthService.resetPassword(email, newPassword);

      return reply.status(200).send({
        message: "Senha redefinida com sucesso.",
      });
    } catch (err: any) {
      return reply.status(400).send({
        message: "Falha ao redefinir a senha.",
        error: err.message,
      });
    }
  };
}
