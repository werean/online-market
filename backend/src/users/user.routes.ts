import { FastifyInstance } from "fastify";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PrismaClient } from "../generated/prisma";

export async function userRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const userService = new UserService(prisma);
  const userController = new UserController(userService);

  fastify.post("/register", userController.create);
  fastify.put("/update/:id", userController.update);
  fastify.get("/", userController.getAll);
  fastify.get("/:id", userController.getOne);
}
