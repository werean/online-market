import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    user?: {
      id: string;
      email: string;
      isSeller: boolean;
    };
  }

  interface FastifyReply {
    clearCookie(
      name: string,
      options?: {
        path?: string;
      }
    ): FastifyReply;
  }
}

export {};
