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
      { name: 'Campion School Mumbai', type: 'SCHOOL', lat: 18.9381, lng: 72.8292 },

      // Central / Matunga / Dadar
      { name: 'Hinduja Hospital Mahim', type: 'HOSPITAL', lat: 19.033, lng: 72.8397 },
      { name: 'Sion Hospital (Lokmanya Tilak Municipal)', type: 'HOSPITAL', lat: 19.0397, lng: 72.86 },
      { name: 'Don Bosco High School Matunga', type: 'SCHOOL', lat: 19.0216, lng: 72.8427 },
      { name: 'Balmohan Vidyamandir Dadar', type: 'SCHOOL', lat: 19.0182, lng: 72.8417 },
      { name: 'Shardashram Vidyamandir Dadar', type: 'SCHOOL', lat: 19.0178, lng: 72.8436 },

      // Bandra / Kurla / BKC
      { name: 'Lilavati Hospital Bandra', type: 'HOSPITAL', lat: 19.0543, lng: 72.8266 },
      { name: 'Holy Family Hospital Bandra', type: 'HOSPITAL', lat: 19.0606, lng: 72.8363 },
      { name: 'Dhirubhai Ambani International School BKC', type: 'SCHOOL', lat: 19.0633, lng: 72.8681 },
      { name: 'St. Stanislaus High School Bandra', type: 'SCHOOL', lat: 19.0569, lng: 72.8394 },
      { name: 'Rizvi College of Arts Science & Commerce', type: 'SCHOOL', lat: 19.0561, lng: 72.8316 },

      // Andheri / Vile Parle / Jogeshwari
      { name: 'Kokilaben Dhirubhai Ambani Hospital', type: 'HOSPITAL', lat: 19.1337, lng: 72.8272 },
      { name: 'Seven Hills Hospital Andheri', type: 'HOSPITAL', lat: 19.1197, lng: 72.8464 },
      { name: 'Cooper Hospital (RDMT) Juhu Vile Parle', type: 'HOSPITAL', lat: 19.1010, lng: 72.8340 },
      { name: 'Holy Family School Andheri', type: 'SCHOOL', lat: 19.1142, lng: 72.8521 },
      { name: 'St. Mary SSC School Mazgaon', type: 'SCHOOL', lat: 18.9556, lng: 72.8408 },
      { name: 'Arya Vidya Mandir Juhu', type: 'SCHOOL', lat: 19.1022, lng: 72.8278 },
      { name: 'Bombay Scottish School Mahim', type: 'SCHOOL', lat: 19.0384, lng: 72.8414 },

      // Borivali / Kandivali / Goregaon
      { name: 'Bhagwati Hospital Borivali', type: 'HOSPITAL', lat: 19.2247, lng: 72.8561 },
      { name: 'Ryan International School Kandivali', type: 'SCHOOL', lat: 19.2086, lng: 72.8357 },
      { name: 'Thakur Public School Kandivali East', type: 'SCHOOL', lat: 19.2018, lng: 72.8715 },
      { name: 'Children Academy Malad East', type: 'SCHOOL', lat: 19.1836, lng: 72.8706 },

      // Mulund / Powai / Chembur
      { name: 'Fortis Hospital Mulund', type: 'HOSPITAL', lat: 19.1723, lng: 72.9561 },
      { name: 'Hiranandani Hospital Powai', type: 'HOSPITAL', lat: 19.1197, lng: 72.9093 },
      { name: 'IES New English School Bandra', type: 'SCHOOL', lat: 19.0607, lng: 72.8385 },
      { name: 'Atomic Energy Central School Anushaktinagar', type: 'SCHOOL', lat: 19.0517, lng: 72.9261 },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Seeded 35 sensitive Mumbai landmark locations (hospitals + schools)');

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
