import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Starting data backfill for legacy payments...');

  // 1. Find all PENDING payments that do not have a linked membership
  const legacyPayments = await prisma.payment.findMany({
    where: {
      status: 'PENDING',
      membershipId: null,
    },
    include: {
      user: true,
    },
  });

  console.log(`Found ${legacyPayments.length} legacy standalone pending payments.`);

  if (legacyPayments.length === 0) {
    console.log('No backfill needed.');
    return;
  }

  // 2. We need a default Plan for these memberships if planId is missing on payment
  // Let's just find the first available plan or create a dummy one.
  let defaultPlan = await prisma.pricingPlan.findFirst();
  if (!defaultPlan) {
    defaultPlan = await prisma.pricingPlan.create({
      data: {
        name: 'Legacy Offline Plan',
        price: 0,
        period: '/ month',
        billingPeriod: 'MONTHLY',
        features: '[]',
        isPublished: false,
      },
    });
  }

  let createdCount = 0;

  // 3. For each legacy payment, create a matching Membership and link them
  for (const payment of legacyPayments) {
    const planId = payment.planId || defaultPlan.id;

    // Generate a membership number
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const membershipNumber = `MEM-${year}-${rand}-LEGACY`;

    const now = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // arbitrary 30 days

    const newMembership = await prisma.membership.create({
      data: {
        membershipNumber,
        userId: payment.userId,
        planId: planId,
        startDate: now,
        expiryDate: expiry,
        status: 'PAYMENT_PENDING',
        totalFee: payment.amount,
        amountPaid: 0,
        pendingAmount: payment.amount,
        source: payment.source || 'OFFLINE',
        notes: 'Auto-generated during backfill for legacy pending payment',
      },
    });

    // Link payment to this new membership
    await prisma.payment.update({
      where: { id: payment.id },
      data: { membershipId: newMembership.id },
    });

    createdCount++;
  }

  console.log(`Successfully backfilled ${createdCount} memberships.`);
}

main()
  .catch((e) => {
    console.error('Error during backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
