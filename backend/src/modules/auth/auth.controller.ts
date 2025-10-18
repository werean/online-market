import { FastifyRequest, FastifyReply } from "fastify";
import { UserLoginDto, userLoginSchema } from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { RecoverPasswordDto, recoverPasswordSchema } from "./dto/recover-password.dto";
import { ResetPasswordDto, resetPasswordSchema } from "./dto/reset-password.dto";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  login = async (request: FastifyRequest<{ Body: UserLoginDto }>, reply: FastifyReply) => {
    try {
      const { email, password } = userLoginSchema.parse(request.body);

      const login = await this.authService.login(email, password);

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

  recoverPassword = async (
    request: FastifyRequest<{ Body: RecoverPasswordDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { email } = recoverPasswordSchema.parse(request.body);
      await this.authService.recoverPassword(email);

      return reply.status(200).send({
        message: "Se o e-mail existir, enviaremos instruções de recuperação.",
      });
    } catch (err: any) {
      return reply.status(200).send({
        message: "Se o e-mail existir, enviaremos instruções de recuperação.",
      });
    }
  };

  resetPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(request.body);
      await this.authService.resetPassword(token, newPassword);

      return reply.status(200).send({
        message: "Senha redefinida com sucesso.",
      });
    } catch (err: any) {
      return reply.status(400).send({
        message: "Token inválido ou expirado.",
      });
    }
  };

  getUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.status(401).send({
          message: "Não autenticado.",
        });
      }

      const user = await this.authService.getUserById(request.userId);

      if (!user) {
        return reply.status(404).send({
          message: "Usuário não encontrado.",
        });
      }

      return reply.status(200).send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err: any) {
      return reply.status(400).send({
        message: "Erro ao buscar usuário.",
        error: err.message,
      });
    }
  };
}
