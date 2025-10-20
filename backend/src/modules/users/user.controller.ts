import { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserDto, CreateUserSchema } from "./dto/create-user.dto";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";

export class UserController {
  private userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }
  create = async (request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply) => {
    try {
      // Validate and parse the request body to remove any extra fields
      const validatedData = CreateUserSchema.parse(request.body);
      const newUser = await this.userService.create(validatedData);
      return reply.code(201).send({
        success: true,
        message: "Usuário criado com sucesso.",
        data: newUser,
      });
    } catch (err: any) {
      console.error("Erro ao criar usuário:", err);

      // Se for erro de validação Zod, retornar mensagens específicas
      if (err.name === "ZodError") {
        const firstError = err.errors[0];
        return reply.code(400).send({
          success: false,
          message: firstError?.message || "Dados inválidos.",
          errors: err.errors,
        });
      }

      return reply.code(400).send({
        success: false,
        message: "Não foi possível criar o usuário.",
        error: err.message,
      });
    }
  };
  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const data = request.body;

      console.log(`[USER] update - userId: ${id}, data:`, data);

      if (!id || !data) {
        return reply.status(400).send({ message: "Usuário não encontrado ou dados inválidos. " });
      }

      // Verificar se o usuário está tentando atualizar sua própria conta
      if (request.user?.id !== id) {
        console.log(
          `[USER] Unauthorized update attempt - requestUser: ${request.user?.id}, targetId: ${id}`
        );
        return reply
          .status(403)
          .send({ message: "Você não tem permissão para atualizar este perfil." });
      }

      const updatedUser = await this.userService.update(id, data);
      return reply.status(200).send({ success: true, updatedUser });
    } catch (err: any) {
      console.error(`[USER] update error:`, err.message || err);
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

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      if (!id) {
        return reply.status(400).send({ message: "ID é obrigatório." });
      }

      await this.userService.delete(id);

      return reply.status(200).send({
        success: true,
        message: "Perfil deletado com sucesso.",
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: "Erro ao deletar perfil.",
        error: err.message,
      });
    }
  };
}
