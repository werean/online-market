import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    let token = request.cookies.auth_token;

    console.log(`[AUTH] verifyJWT - path: ${request.url}, method: ${request.method}`);
    console.log(`[AUTH] token from cookie: ${token ? "exists" : "missing"}`);

    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log(`[AUTH] token from header: exists`);
      }
    }

    if (!token) {
      console.log(`[AUTH] No token found - returning 401`);
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

    console.log(`[AUTH] Token verified - userId: ${decoded.userId}, isSeller: ${decoded.isSeller}`);

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
        console.log(`[AUTH] Seller not found - userId: ${decoded.userId}`);
        return reply.status(401).send({
          success: false,
          message: "Vendedor não encontrado.",
        });
      }

      if (seller.isDeleted) {
        console.log(`[AUTH] Seller is deleted - userId: ${decoded.userId}`);
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

      console.log(`[AUTH] Seller authenticated - id: ${seller.id}`);
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
        console.log(`[AUTH] User not found - userId: ${decoded.userId}`);
        return reply.status(401).send({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      if (user.isDeleted) {
        console.log(`[AUTH] User is deleted - userId: ${decoded.userId}`);
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

      console.log(`[AUTH] User authenticated - id: ${user.id}`);
    }
  } catch (err: any) {
    console.error(`[AUTH] verifyJWT error:`, err.message);

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
