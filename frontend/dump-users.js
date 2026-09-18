const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    include: {
      memberships: true,
      payments: true,
      freeTrial: true
    }
  });

  const output = users.map(user => {
    const hasSuccessfulPayment = user.payments.some(p => p.status === 'COMPLETED' && p.amount > 0);
    const hasAnyMembership = user.memberships.length > 0;
    
    let memberType = (hasSuccessfulPayment || hasAnyMembership) ? 'PAID MEMBER' : 'FREE TRIAL';

    return {
      name: `${user.firstName} ${user.lastName}`,
      memberType,
      hasSuccessfulPayment,
      hasAnyMembership,
      membershipStatus: user.membershipStatus,
      paymentsCount: user.payments.length,
      membershipsCount: user.memberships.length
    };
  });

  console.log("Total members:", output.length);
  console.log("PAID MEMBERS:", output.filter(u => u.memberType === 'PAID MEMBER').length);
  console.log("FREE TRIAL:", output.filter(u => u.memberType === 'FREE TRIAL').length);
  
  console.log(JSON.stringify(output, null, 2));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => console.error(e));
