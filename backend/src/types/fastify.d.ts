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
    setCookie(
      name: string,
      value: string,
      options?: {
        domain?: string;
        path?: string;
        maxAge?: number;
        expires?: Date;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: boolean | "lax" | "strict" | "none";
        signed?: boolean;
      }
    ): FastifyReply;

    clearCookie(
      name: string,
      options?: {
        path?: string;
      }
    ): FastifyReply;
  }
}

export {};
