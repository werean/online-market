import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SellerAuthController } from "./seller-auth.controller";
import { SellerAuthService } from "./seller-auth.service";
import { UserRepository } from "../users/user.repository";
import { SellerRepository } from "../sellers/seller.repository";
import { prisma } from "../../config/prisma";
import { verifyJWT } from "./auth.middleware";

export async function authRoutes(fastify: FastifyInstance) {
  const userRepository = new UserRepository(prisma);
  const authService = new AuthService(prisma, userRepository);
  const authController = new AuthController(authService);

  const sellerRepository = new SellerRepository(prisma);
  const sellerAuthService = new SellerAuthService(prisma, sellerRepository);
  const sellerAuthController = new SellerAuthController(sellerAuthService);

  // User routes
  fastify.post("/login", authController.login);
  fastify.post("/logout", authController.logout);
  fastify.post("/recover-password", authController.recoverPassword);
  fastify.post("/verify-token", authController.verifyToken);
  fastify.post("/reset-password", authController.resetPassword);
  fastify.get("/user", { preHandler: verifyJWT }, authController.getUser);

  // Seller routes
  fastify.post("/seller/login", sellerAuthController.login);
  fastify.post("/seller/logout", sellerAuthController.logout);
  fastify.post("/seller/recover-password", sellerAuthController.recoverPassword);
  fastify.post("/seller/verify-token", sellerAuthController.verifyToken);
  fastify.post("/seller/reset-password", sellerAuthController.resetPassword);
}
