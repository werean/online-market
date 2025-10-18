import { buildApp } from "./app";

const app = buildApp();

const PORT = Number(process.env.PORT) || 8080;

app
  .listen({
    port: PORT,
  })
  .then(() => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
