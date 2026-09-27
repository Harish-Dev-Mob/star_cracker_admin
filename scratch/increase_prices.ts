import { PrismaClient } from '../generated/prisma';

async function main() {
  const p = new PrismaClient();
  const products = await p.product.findMany();
  
  let count = 0;
  for (const prod of products) {
    await p.product.update({
      where: { id: prod.id },
      data: {
        price: Math.round(prod.price * 1.05),
        discountPrice: prod.discountPrice ? Math.round(prod.discountPrice * 1.05) : null,
      }
    });
    count++;
  }
  console.log(`Successfully increased prices by 5% for ${count} products.`);
  await p.$disconnect();
}

main();
