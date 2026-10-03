import { PrismaClient } from "./generated/prisma";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@firecrackers.in";
  const password = "Admin@2026";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
    },
    create: {
      name: "Admin",
      email,
      phone: "9344336860", // Providing a dummy phone as it's optional but good to have unique
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user created/updated successfully: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
