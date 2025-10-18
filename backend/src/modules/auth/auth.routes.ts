import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "../users/user.repository";
import { prisma } from "../../config/prisma";

export async function authRoutes(fastify: FastifyInstance) {
  const userRepository = new UserRepository(prisma);
  const authService = new AuthService(prisma, userRepository);
  const authController = new AuthController(authService);

  fastify.post("/login", authController.login);
  fastify.post("/logout", authController.logout);
  fastify.post("/recover-password", authController.recoverPassword);
  fastify.post("/reset-password", authController.resetPassword);
}
