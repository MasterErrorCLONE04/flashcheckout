
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log(`Total productos en DB: ${count}`);
  
  const activeProducts = await prisma.product.findMany({
    where: { active: true },
    include: { store: true },
    take: 5
  });

  console.log('Productos activos encontrados:');
  activeProducts.forEach(p => {
    console.log(`- ID: ${p.id}, Tienda: ${p.store.name}, Name: ${p.name}, Image: ${p.imageUrl}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
