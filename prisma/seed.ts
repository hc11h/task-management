import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash(process.env.DEFAULT_PASSWORD!, 10);

  console.log('Seeding database...');

  // 1. Create Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: password,
      role: UserRole.ADMIN,
    },
  });

  // 2. Create Manager
  await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      password: password,
      role: UserRole.MANAGER,
    },
  });

  // 3. Create Employee
  await prisma.user.upsert({
    where: { username: 'employee' },
    update: {},
    create: {
      username: 'employee',
      password: password,
      role: UserRole.EMPLOYEE,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
