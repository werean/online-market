import fastify from "fastify";
import cookie from "@fastify/cookie";
import { userRoutes } from "./src/users/user.routes";
import { authRoutes } from "./src/auth/auth.routes";
import { productRoutes } from "./src/products/product.routes";

const app = fastify();

// Registrar o plugin de cookies
app.register(cookie, {
  secret: process.env.COOKIE_SECRET || "my-secret", // Opcional: para assinar cookies
});

// Registrar as rotas ANTES de iniciar o servidor
app.register(authRoutes);
app.register(userRoutes, { prefix: "/user" });
app.register(productRoutes, { prefix: "/products" });

const PORT = Number(process.env.PORT) || 8080;

app
  .listen({
    port: PORT,
  })
  .then(() => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
