import { FastifyRequest, FastifyReply } from "fastify";
import { SellerService } from "./seller.service";
import { CreateSellerSchema } from "./dto/create-seller.dto";

export class SellerController {
  private sellerService: SellerService;

  constructor(sellerService: SellerService) {
    this.sellerService = sellerService;
  }

  create = async (
    request: FastifyRequest<{
      Body: { name: string; email: string; address: string; password: string };
    }>,
    reply: FastifyReply
  ) => {
    try {
      // Validar e remover campos extras
      const validatedData = CreateSellerSchema.parse(request.body);

      const seller = await this.sellerService.create(validatedData);
      return reply.status(201).send({
        success: true,
        message: "Vendedor criado com sucesso.",
        data: seller,
      });
    } catch (err: any) {
      console.error("Erro ao criar vendedor:", err);

      // Se for erro de validação Zod
      if (err.name === "ZodError") {
        return reply.status(400).send({
          success: false,
          message: "Dados inválidos.",
          errors: err.errors,
        });
      }

      return reply.status(400).send({
        success: false,
        message: "Erro ao criar vendedor.",
        error: err.message,
      });
    }
  };

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sellers = await this.sellerService.getAll();
      return reply.status(200).send({
        success: true,
        message: "Vendedores listados com sucesso.",
        data: sellers,
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: "Erro ao listar vendedores.",
        error: err.message,
      });
    }
  };

  getOne = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const seller = await this.sellerService.getOne(request.params.id);
      return reply.status(200).send({
        success: true,
        message: "Vendedor encontrado.",
        data: seller,
      });
    } catch (err: any) {
      return reply.status(404).send({
        success: false,
        message: "Vendedor não encontrado.",
        error: err.message,
      });
    }
  };

  update = async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: Partial<{ name: string; email: string; address: string }>;
    }>,
    reply: FastifyReply
  ) => {
    try {
      const seller = await this.sellerService.update(request.params.id, request.body);
      return reply.status(200).send({
        success: true,
        message: "Vendedor atualizado com sucesso.",
        data: seller,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        message: "Erro ao atualizar vendedor.",
        error: err.message,
      });
    }
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await this.sellerService.delete(request.params.id);
      return reply.status(200).send({
        success: true,
        message: "Vendedor deletado com sucesso.",
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        message: "Erro ao deletar vendedor.",
        error: err.message,
      });
    }
  };
}
