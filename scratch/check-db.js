
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        products: {
          where: { active: true }
        }
      }
    });

    console.log('--- DIAGNÓSTICO DE TIENDAS Y PRODUCTOS ---');
    if (stores.length === 0) console.log('No hay tiendas en la base de datos.');
    
    stores.forEach(s => {
      console.log(`Tienda: ${s.name} (ID: ${s.id})`);
      console.log(`  Activa: ${s.active}`);
      console.log(`  Productos Activos: ${s.products.length}`);
      s.products.forEach(p => {
        console.log(`    - ${p.name} (Precio: ${p.price}, ImageUrl: ${p.imageUrl || 'NULL'})`);
      });
    });
  } catch (e) {
    console.error('Error en diagnóstico:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
