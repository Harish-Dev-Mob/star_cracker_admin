import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // Use direct (non-pooled) connection for migrations to avoid port 5432 blocks
    directUrl: process.env.DIRECT_URL,
  },
});
