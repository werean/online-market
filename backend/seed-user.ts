import { PrismaClient } from "./src/generated/prisma";
import { hash } from "bcryptjs";

async function main() {
  const prisma = new PrismaClient();

  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: "lucas@teste.com" },
    });

    if (existingUser) {
      console.log("✅ Usuário já existe:", existingUser.email);
      return;
    }

    // Criar novo usuário
    const hashedPassword = await hash("teste123", 8);
    const user = await prisma.user.create({
      data: {
        name: "Lucas Teste",
        email: "lucas@teste.com",
        address: "Rua Teste, 123",
        password: hashedPassword,
        isSeller: false,
        isDeleted: false,
      },
    });

    console.log("✅ Usuário criado com sucesso:", user.email);
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
