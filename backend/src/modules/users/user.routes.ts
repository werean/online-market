import { FastifyInstance } from "fastify";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { prisma } from "../../config/prisma";
import { verifyJWT } from "../auth/auth.middleware";

export async function userRoutes(fastify: FastifyInstance) {
  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  // Public routes
  fastify.post("/register", userController.create);

  // Protected routes - require authentication
  fastify.addHook("onRequest", async (request, reply) => {
    // Skip authentication for register endpoint
    if (request.url === "/user/register" && request.method === "POST") {
      return;
    }
    await verifyJWT(request, reply);
  });

  fastify.put("/update/:id", userController.update);
  fastify.get("/", userController.getAll);
  fastify.get("/:id", userController.getOne);
  fastify.delete("/:id", userController.delete);
}
