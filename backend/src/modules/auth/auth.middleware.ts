import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";

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
      isSeller: boolean;
    };

    // Se for seller, buscar na tabela Seller
    if (decoded.isSeller) {
      const seller = await prisma.seller.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          isDeleted: true,
        },
      });

      if (!seller) {
        return reply.status(401).send({
          success: false,
          message: "Vendedor não encontrado.",
        });
      }

      if (seller.isDeleted) {
        return reply.status(403).send({
          success: false,
          message: "Vendedor inativo.",
        });
      }

      request.userId = seller.id;
      request.user = {
        id: seller.id,
        email: seller.email,
        isSeller: true,
      };
    } else {
      // Se for user, buscar na tabela User
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
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
        isSeller: false,
      };
    }
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