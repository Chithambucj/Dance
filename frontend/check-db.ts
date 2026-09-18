import { prisma } from './src/lib/prisma';

async function main() {
  const members = await prisma.user.findMany({
    where: {
      role: 'MEMBER',
      membershipStatus: { notIn: ['FREE_TRIAL', 'TRIAL_EXPIRED'] }
    },
    include: {
      memberships: {
        include: { plan: true },
        orderBy: { createdAt: 'desc' }
      },
      payments: true
    }
  })

  console.log(`Found ${members.length} PAID MEMBERS (UI definition)`)
  for (const m of members) {
    console.log(`\nUser: ${m.firstName} ${m.lastName} (${m.membershipStatus})`)
    console.log(`  Memberships: ${m.memberships.length}`)
    if (m.memberships.length > 0) {
      const active = m.memberships[0]
      console.log(`    [Latest] Status: ${active.status}, Expiry: ${active.expiryDate}, Plan Price: ${active.plan?.price || 0}, Pending: ${active.pendingAmount}`)
    }
    console.log(`  Payments: ${m.payments.length}`)
    const pendingP = m.payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
    console.log(`    Pending Payments: ${pendingP.length} -> Sum: ${pendingP.reduce((acc, p) => acc + p.amount, 0)}`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
