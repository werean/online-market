import { buildApp } from "./app";
import { env } from "./config/env";

async function main() {
  const app = buildApp();
  const PORT = env.PORT;

  try {
    await app.ready();
    await app.listen({ port: PORT });
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    console.log("Encerrando servidor.");
    await app.close();
    process.exit(0);
  });
}

main();
