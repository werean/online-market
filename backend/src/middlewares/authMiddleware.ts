import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Estender o tipo FastifyRequest para incluir userId e user
declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    user?: {
      id: string;
      email: string;
      isSeller: boolean;
    };
  }
}

/**
 * Middleware para verificar se o token JWT é válido
 * Adiciona userId e user ao request se o token for válido
 */
export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Tentar obter o token do cookie ou do header Authorization
    let token = request.cookies.auth_token;

    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: "Token de autenticação não fornecido.",
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: string;
      email: string;
    };

    // Verificar se o usuário existe no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        isSeller: true,
        isDeleted: true,
      },
    });

    if (!user) {
      return reply.status(401).send({
        success: false,
        message: "Usuário não encontrado.",
      });
    }

    if (user.isDeleted) {
      return reply.status(403).send({
        success: false,
        message: "Usuário inativo.",
      });
    }

    // Adicionar informações do usuário ao request
    request.userId = user.id;
    request.user = {
      id: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };
  } catch (err: any) {
    if (err.name === "JsonWebTokenError") {
      return reply.status(401).send({
        success: false,
        message: "Token inválido.",
      });
    }

    if (err.name === "TokenExpiredError") {
      return reply.status(401).send({
        success: false,
        message: "Token expirado.",
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Erro ao verificar autenticação.",
      error: err.message,
    });
  }
}

/**
 * Middleware para verificar se o usuário autenticado é um vendedor
 * Deve ser usado após verifyJWT
 */
export async function verifySellerAccess(request: FastifyRequest, reply: FastifyReply) {
  // Primeiro, verificar se o usuário está autenticado
  await verifyJWT(request, reply);

  // Se já houve uma resposta de erro do verifyJWT, não continuar
  if (reply.sent) {
    return;
  }

  // Verificar se o usuário é vendedor
  if (!request.user?.isSeller) {
    return reply.status(403).send({
      success: false,
      message: "Acesso negado. Apenas vendedores podem realizar esta ação.",
    });
  }
}
