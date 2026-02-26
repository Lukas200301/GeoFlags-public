import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.count();
  console.log('Total users in DB after restore:', users);
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
