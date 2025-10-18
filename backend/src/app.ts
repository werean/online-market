import fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { env } from "./config/env";
import { userRoutes } from "./modules/users/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { productRoutes } from "./modules/products/product.routes";

export function buildApp() {
  const app = fastify();

  app.register(cookie, {
    secret: env.COOKIE_SECRET,
  });

  app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/user" });
  app.register(productRoutes, { prefix: "/products" });

  return app;
}
