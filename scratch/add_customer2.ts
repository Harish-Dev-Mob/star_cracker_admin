import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const p = new PrismaClient();
  const customerHash = await bcrypt.hash("Customer@123", 12);
  await p.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "9123456789",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });
  console.log("Created Customer 2");
  await p.$disconnect();
}

main();
