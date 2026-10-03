import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migrate/push) uses this url. 
    // We use DIRECT_URL (non-pooled) because migrations need a direct connection.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
