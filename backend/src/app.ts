import fastify from "fastify";
import cookie from "@fastify/cookie";
import { userRoutes } from "./modules/users/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { productRoutes } from "./modules/products/product.routes";

export function buildApp() {
  const app = fastify();

  app.register(cookie, {
    secret: process.env.COOKIE_SECRET || "my-secret",
  });

  app.register(authRoutes);
  app.register(userRoutes, { prefix: "/user" });
  app.register(productRoutes, { prefix: "/products" });

  return app;
}
