import fastify from "fastify";
import { userRoutes } from "./src/users/user.routes";

const app = fastify();

app
  .listen({
    port: 8080,
  })
  .then(() => {
    console.log("http://localhost:8080");
  });

app.register(userRoutes, { prefix: "/user" });
