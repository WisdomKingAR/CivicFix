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

  // 4. Sensitive Locations (Schools & Hospitals for proximity scoring across Mumbai)
  await prisma.sensitiveLocation.createMany({
    data: [
      // South Mumbai
      { name: 'KEM Hospital (King Edward Memorial)', type: 'HOSPITAL', lat: 18.9388, lng: 72.8258 },
      { name: 'Nair Hospital (BYL Nair)', type: 'HOSPITAL', lat: 18.9629, lng: 72.8193 },
      { name: 'St. George Hospital', type: 'HOSPITAL', lat: 18.9338, lng: 72.8392 },
      { name: "St. Xavier's High School Fort", type: 'SCHOOL', lat: 18.9322, lng: 72.8264 },
      { name: 'Cathedral and John Connon School', type: 'SCHOOL', lat: 18.9356, lng: 72.8338 },

      // Central / Matunga / Dadar
      { name: 'Hinduja Hospital Mahim', type: 'HOSPITAL', lat: 19.033, lng: 72.8397 },
      { name: 'Sion Hospital (Lokmanya Tilak Municipal)', type: 'HOSPITAL', lat: 19.0397, lng: 72.86 },
      { name: 'Don Bosco High School Matunga', type: 'SCHOOL', lat: 19.0216, lng: 72.8427 },
      { name: 'Balmohan Vidyamandir Dadar', type: 'SCHOOL', lat: 19.0182, lng: 72.8417 },

      // Bandra / Kurla / BKC
      { name: 'Lilavati Hospital Bandra', type: 'HOSPITAL', lat: 19.0543, lng: 72.8266 },
      { name: 'Holy Family Hospital Bandra', type: 'HOSPITAL', lat: 19.0606, lng: 72.8363 },
      { name: 'Dhirubhai Ambani International School BKC', type: 'SCHOOL', lat: 19.0633, lng: 72.8681 },

      // Andheri / Jogeshwari
      { name: 'Kokilaben Dhirubhai Ambani Hospital', type: 'HOSPITAL', lat: 19.1337, lng: 72.8272 },
      { name: 'Seven Hills Hospital Andheri', type: 'HOSPITAL', lat: 19.1197, lng: 72.8464 },
      { name: 'Holy Family School Andheri', type: 'SCHOOL', lat: 19.1142, lng: 72.8521 },

      // Borivali / Kandivali
      { name: 'Bhagwati Hospital Borivali', type: 'HOSPITAL', lat: 19.2247, lng: 72.8561 },
      { name: 'Ryan International School Kandivali', type: 'SCHOOL', lat: 19.2086, lng: 72.8357 },

      // Mulund / Thane / Powai
      { name: 'Fortis Hospital Mulund', type: 'HOSPITAL', lat: 19.1723, lng: 72.9561 },
      { name: 'Hiranandani Hospital Powai', type: 'HOSPITAL', lat: 19.1197, lng: 72.9093 },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Seeded 20 sensitive Mumbai landmark locations');

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
