const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Find users who have completed payments but NO memberships
  const usersToBackfill = await prisma.user.findMany({
    where: {
      role: 'MEMBER',
      payments: { some: { status: 'COMPLETED', amount: { gt: 0 } } },
      memberships: { none: {} }
    },
    include: {
      payments: {
        where: { status: 'COMPLETED', amount: { gt: 0 } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  console.log(`Found ${usersToBackfill.length} users to backfill memberships for.`);

  // Find a generic plan to use if none is specified
  const defaultPlan = await prisma.pricingPlan.findFirst({
    where: { name: { contains: 'Monthly' } }
  });

  for (const user of usersToBackfill) {
    const latestPayment = user.payments[0];
    
    // Create a new membership for this user based on the payment
    const newMembership = await prisma.membership.create({
      data: {
        membershipNumber: `MEM-BACKFILL-${user.id.substring(0, 6).toUpperCase()}`,
        userId: user.id,
        planId: defaultPlan.id, // Using default if we don't have exact matching plan
        startDate: latestPayment.createdAt,
        expiryDate: new Date(latestPayment.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
        status: new Date(latestPayment.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) > new Date() ? 'ACTIVE' : 'EXPIRED',
        totalFee: latestPayment.amount,
        amountPaid: latestPayment.amount,
        pendingAmount: 0,
        source: latestPayment.source,
        notes: `Backfilled from legacy payment ${latestPayment.id}`
      }
    });

    // Update the payment to link to the new membership
    await prisma.payment.update({
      where: { id: latestPayment.id },
      data: {
        membershipId: newMembership.id,
        planId: defaultPlan.id
      }
    });

    // Update user membership status
    await prisma.user.update({
      where: { id: user.id },
      data: { membershipStatus: newMembership.status }
    });

    console.log(`Backfilled membership for ${user.firstName} ${user.lastName}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
