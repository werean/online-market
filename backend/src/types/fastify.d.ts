import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    user?: {
      id: string;
      email: string;
      isSeller: boolean;
    };
    cookies: {
      [key: string]: string | undefined;
    };
  }

  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "strict" | "lax" | "none";
        path?: string;
        maxAge?: number;
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
