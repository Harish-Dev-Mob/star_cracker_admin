import { PrismaClient } from '../generated/prisma';

async function main() {
  const p = new PrismaClient();
  const r = await p.siteConfig.findMany();
  console.log(JSON.stringify(r, null, 2));
  await p.$disconnect();
}

main();
