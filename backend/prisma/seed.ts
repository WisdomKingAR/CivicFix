// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Demo Citizen
  const citizenPassword = await bcrypt.hash('HackDemo@2025', 10);
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@civicfix.com' },
    update: {},
    create: {
      email: 'citizen@civicfix.com',
      name: 'Ramesh Kumar',
      password: citizenPassword,
      role: Role.CITIZEN,
      phone: '+919876543210',
    },
  });
  console.log('✅ Seeded citizen user:', citizen.email);

  // 2. Demo Authority Officer
  const authorityPassword = await bcrypt.hash('HackAuth@2025', 10);
  const authority = await prisma.user.upsert({
    where: { email: 'authority@civicfix.com' },
    update: {},
    create: {
      email: 'authority@civicfix.com',
      name: 'Sunita Sharma',
      password: authorityPassword,
      role: Role.AUTHORITY,
      jurisdiction: 'Ward 12 - Mumbai',
      phone: '+919876543211',
    },
  });
  console.log('✅ Seeded authority user:', authority.email);

  // 3. Demo Admin
  const adminPassword = await bcrypt.hash('HackAdmin@2025', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@civicfix.com' },
    update: {},
    create: {
      email: 'admin@civicfix.com',
      name: 'District Manager',
      password: adminPassword,
      role: Role.ADMIN,
      phone: '+919876543212',
    },
  });
  console.log('✅ Seeded admin user:', admin.email);

  // 4. Sensitive Locations (Schools & Hospitals for proximity scoring)
  await prisma.sensitiveLocation.createMany({
    data: [
      { name: 'Mumbai General Hospital', type: 'HOSPITAL', lat: 18.9388, lng: 72.8258 },
      { name: 'St. Xavier High School', type: 'SCHOOL', lat: 18.9322, lng: 72.8264 },
      { name: 'Andheri Metro Hospital', type: 'HOSPITAL', lat: 19.1197, lng: 72.8464 },
      { name: 'Holy Family School', type: 'SCHOOL', lat: 19.1142, lng: 72.8521 },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Seeded sensitive landmark locations');

  console.log('✨ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
