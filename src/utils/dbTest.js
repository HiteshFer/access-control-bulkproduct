const prisma = require('../config/prisma');

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Try simple query
    // const users = await prisma.user.findMany();
    // console.log(`📊 Found ${users.length} users in database`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error(error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = testConnection;