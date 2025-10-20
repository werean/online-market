import { FastifyInstance } from "fastify";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { prisma } from "../../config/prisma";

export async function userRoutes(fastify: FastifyInstance) {
  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  fastify.post("/register", userController.create);
  fastify.put("/update/:id", userController.update);
  fastify.get("/", userController.getAll);
  fastify.get("/:id", userController.getOne);
  fastify.delete("/:id", userController.delete);
}
