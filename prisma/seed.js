require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.$transaction([
    prisma.AdminUser.deleteMany(),
  ]);
  console.log('🧹 Cleared existing data');

  // Seed users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await prisma.AdminUser.createMany({
    data: [
      {
        first_name: "Admin",
        last_name: "User",
        username: "adminuser",
        user_email: "admin@example.com",
        user_password: hashedPassword, // Use bcrypt or similar to hash
        role_id: 1, // Assuming 1 is Super Admin or equivalent
        status: "1",
        is_deleted: "0",
        created_by: "1",
        updated_by: "1",
      },
    ],
    skipDuplicates: true,
  });
  console.log(`👥 Created ${users.count} users`);

}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔚 Disconnected from database');
  });