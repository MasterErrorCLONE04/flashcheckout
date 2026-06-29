const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.whatsAppSession.findMany({
    orderBy: { lastInteraction: 'desc' }
  });
  console.log(`Total sessions in DB: ${sessions.length}`);
  
  sessions.forEach(s => {
    console.log(`\n--- Session ID: ${s.id} | Phone: ${s.phoneNumber} | Name: ${s.customerName} ---`);
    console.log('Messages:');
    if (Array.isArray(s.messages)) {
      s.messages.forEach((m, idx) => {
        console.log(`  [${idx}] Sender: ${m.sender} | Text: ${m.text} | Time: ${m.time}`);
      });
    } else {
      console.log('  No messages array.');
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
