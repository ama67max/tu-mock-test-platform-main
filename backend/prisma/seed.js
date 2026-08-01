const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');

// Load environment variables from the backend root .env file.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const ADMIN_ACCOUNT = {
  email: process.env.SEED_ADMIN_EMAIL || 'admin@tu-test.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'AdminPass123!',
  fullName: process.env.SEED_ADMIN_FULL_NAME || 'Admin User',
  role: 'ADMIN',
};

const SUPER_ADMIN_ACCOUNT = {
  email: process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@tu-test.com',
  password: process.env.SEED_SUPER_ADMIN_PASSWORD || 'SuperAdminPass123!',
  fullName: process.env.SEED_SUPER_ADMIN_FULL_NAME || 'Super Admin User',
  role: 'SUPER_ADMIN',
};

const createOrUpdateUser = async ({ email, password, fullName, role }) => {
  const passwordHash = await hashPassword(password);

  return prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      fullName,
      role,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      fullName,
      role,
      profile: {
        create: {},
      },
    },
  });
};

const main = async () => {
  console.log('Starting database seed...');

  const adminUser = await createOrUpdateUser(ADMIN_ACCOUNT);
  const superAdminUser = await createOrUpdateUser(SUPER_ADMIN_ACCOUNT);

  console.log('Seed complete. Created or updated users:');
  console.log(`- ADMIN: ${adminUser.email}`);
  console.log(`- SUPER_ADMIN: ${superAdminUser.email}`);
};

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
