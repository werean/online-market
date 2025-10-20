import fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { env } from "./config/env";
import { userRoutes } from "./modules/users/user.routes";
import { sellerRoutes } from "./modules/sellers/seller.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { productRoutes } from "./modules/products/product.routes";
import { cartRoutes } from "./modules/cart/cart.routes";

export function buildApp() {
  const app = fastify();

  app.register(cookie, {
    secret: env.COOKIE_SECRET,
  });

  app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/user" });
  app.register(sellerRoutes, { prefix: "/seller" });
  app.register(productRoutes, { prefix: "/products" });
  app.register(cartRoutes, { prefix: "/cart" });

  return app;
}
