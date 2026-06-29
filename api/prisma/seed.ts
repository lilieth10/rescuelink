import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  EmergencyStatus,
  OrganizationType,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import { Pool } from 'pg';
import {
  VENEZUELA_COUNTRY,
  VENEZUELA_EARTHQUAKE_2026,
  VENEZUELA_REGIONS,
} from './data/venezuela-regions';

const BCRYPT_ROUNDS = 12;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run the seed.');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

async function seedVenezuela(prisma: PrismaClient): Promise<void> {
  const country = await prisma.country.upsert({
    where: { code: VENEZUELA_COUNTRY.code },
    update: { name: VENEZUELA_COUNTRY.name },
    create: VENEZUELA_COUNTRY,
  });

  for (const region of VENEZUELA_REGIONS) {
    await prisma.region.upsert({
      where: {
        countryId_code: { countryId: country.id, code: region.code },
      },
      update: { name: region.name },
      create: {
        code: region.code,
        name: region.name,
        countryId: country.id,
      },
    });
  }

  await prisma.emergency.upsert({
    where: { id: 'ven-earthquake-2026' },
    update: {
      name: VENEZUELA_EARTHQUAKE_2026.name,
      status: EmergencyStatus.ACTIVE,
    },
    create: {
      id: 'ven-earthquake-2026',
      name: VENEZUELA_EARTHQUAKE_2026.name,
      countryId: country.id,
      type: VENEZUELA_EARTHQUAKE_2026.type,
      startDate: VENEZUELA_EARTHQUAKE_2026.startDate,
      status: EmergencyStatus.ACTIVE,
    },
  });

  const organization = await prisma.organization.upsert({
    where: { id: 'org-cruz-roja-ven' },
    update: { name: 'Cruz Roja Venezolana', verified: true },
    create: {
      id: 'org-cruz-roja-ven',
      name: 'Cruz Roja Venezolana',
      type: OrganizationType.RED_CROSS,
      verified: true,
      countryId: country.id,
    },
  });

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL ?? 'admin@rescuelink.org';
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? 'RescueLink2026!';

  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: 'Admin',
      lastName: 'RescueLink',
      role: UserRole.ADMIN,
      organizationId: organization.id,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'RescueLink',
      role: UserRole.ADMIN,
      organizationId: organization.id,
    },
  });

  console.log(`✔ País: ${country.name} (${country.code})`);
  console.log(`✔ Regiones: ${VENEZUELA_REGIONS.length} estados`);
  console.log(`✔ Emergencia activa: ${VENEZUELA_EARTHQUAKE_2026.name}`);
  console.log(`✔ Organización: ${organization.name}`);
  console.log(`✔ Admin: ${adminEmail}`);
}

async function main(): Promise<void> {
  const prisma = createPrismaClient();

  try {
    await seedVenezuela(prisma);
    console.log('\nSeed completado. Venezuela lista como primera emergencia.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Seed falló:', error);
  process.exit(1);
});
