import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaClient } from "../generated/prisma";

export async function authRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const authService = new AuthService(prisma);
  const authController = new AuthController(authService);

  fastify.post("/login", authController.login);
  fastify.post("/logout", authController.logout);
}
