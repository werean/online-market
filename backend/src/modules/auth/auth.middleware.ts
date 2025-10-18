import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";

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

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: string;
      email: string;
    };

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

export async function verifySellerAccess(request: FastifyRequest, reply: FastifyReply) {
  await verifyJWT(request, reply);

  if (reply.sent) {
    return;
  }

  if (!request.user?.isSeller) {
    return reply.status(403).send({
      success: false,
      message: "Acesso negado. Apenas vendedores podem realizar esta ação.",
    });
  }
}
