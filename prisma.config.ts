
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prefer Next.js local env for Prisma commands, then fall back to .env.
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
