import { betterAuth } from "better-auth";
import { prisma } from "../../config/prisma";

export const auth = betterAuth({
  database: prisma,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  secret: process.env.JWT_SECRET || "secret",
});
