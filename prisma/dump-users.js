const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    include: {
      memberships: {
        include: {
          plan: true,
          payments: true
        }
      }
    }
  });

  const output = users.map(user => {
    return {
      name: user.name,
      registrationType: user.registrationType,
      memberships: user.memberships.map(m => ({
        id: m.id,
        planId: m.planId,
        planName: m.plan?.name,
        planPrice: m.plan?.price,
        status: m.status,
        startDate: m.startDate,
        endDate: m.endDate,
        pendingAmount: m.pendingAmount,
        payments: m.payments.map(p => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          dueDate: p.dueDate,
          paymentDate: p.paymentDate
        }))
      }))
    };
  });

  console.log(JSON.stringify(output, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
