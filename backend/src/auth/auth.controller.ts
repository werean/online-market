import { FastifyRequest, FastifyReply } from "fastify";
import { UserLoginDto, userLoginSchema } from "./auth.dto";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  login = async (request: FastifyRequest<{ Body: UserLoginDto }>, reply: FastifyReply) => {
    try {
      const { email, password } = userLoginSchema.parse(request.body);

      const login = await this.authService.login(email, password);

      // Configurar o cookie com o token JWT
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
      // Remover o cookie de autenticação
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
}
