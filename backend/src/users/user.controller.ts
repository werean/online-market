import { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";

export class UserController {
  private userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }
  create = async (request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply) => {
    try {
      const newUser = await this.userService.create(request.body);
      return reply.code(201).send({ newUser });
    } catch (err: any) {
      return reply
        .code(500)
        .send({ message: "Não foi possível criar o usuário.", error: err.message });
    }
  };
  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const data = request.body;
      if (!id || !data) {
        return reply.status(400).send({ message: "Usuário não encontrado ou dados inválidos. " });
      }
      const updatedUser = await this.userService.update(id, data);
      return reply.status(201).send({ updatedUser });
    } catch (err: any) {
      return reply
        .code(400)
        .send({ message: "Não foi possível atualizar o usuário.", error: err.message });
    }
  };
  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const allUsers = await this.userService.findAll();
    return reply.status(201).send({ allUsers });
  };
  getOne = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      if (!id) {
        return reply.status(400).send({ message: "ID é obrigatório." });
      }
      const user = await this.userService.findOne(id);

      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado." });
      }

      return reply.status(200).send({ user });
    } catch (err: any) {
      return reply.status(500).send({
        message: "Erro ao buscar usuário.",
        error: err.message,
      });
    }
  };
}
