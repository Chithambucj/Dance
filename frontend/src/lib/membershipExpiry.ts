import { prisma } from "@/lib/prisma";
import { IS_FREE_TRIAL_WHERE } from "@/lib/memberQueries";

/**
 * Automatically syncs expired memberships and user statuses in the database.
 * Can be called synchronously or run periodically.
 */
export async function syncMembershipExpiries(now = new Date()): Promise<{
  expiredMembershipsCount: number;
  expiredUsersCount: number;
}> {
  try {
    // 1. Mark active/pending memberships whose expiryDate has passed as EXPIRED
    const expiredMembershipsResult = await prisma.membership.updateMany({
      where: {
        expiryDate: { lt: now },
        status: { in: ["ACTIVE", "PAYMENT_PENDING", "PARTIALLY_PAID"] },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // 2. Identify paid members who have NO active future membership and whose latest membership is expired
    const usersWithExpiredMemberships = await prisma.user.findMany({
      where: {
        role: "MEMBER",
        membershipStatus: { in: ["ACTIVE", "PAYMENT_PENDING", "PARTIALLY_PAID"] },
        memberships: {
          some: {
            expiryDate: { lt: now },
          },
          none: {
            expiryDate: { gte: now },
            status: "ACTIVE",
          },
        },
        NOT: IS_FREE_TRIAL_WHERE,
      },
      select: { id: true },
    });

    let expiredUsersCount = 0;
    if (usersWithExpiredMemberships.length > 0) {
      const userIds = usersWithExpiredMemberships.map((u) => u.id);
      const userUpdateResult = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { membershipStatus: "EXPIRED" },
      });
      expiredUsersCount = userUpdateResult.count;
    }

    return {
      expiredMembershipsCount: expiredMembershipsResult.count,
      expiredUsersCount,
    };
  } catch (err) {
    console.error("Error in syncMembershipExpiries:", err);
    return { expiredMembershipsCount: 0, expiredUsersCount: 0 };
  }
}

// Background scheduler: runs once every hour if running in Node server environment
const globalForExpiry = global as unknown as { __expiryTimerStarted?: boolean };
if (!globalForExpiry.__expiryTimerStarted && typeof setInterval !== "undefined") {
  globalForExpiry.__expiryTimerStarted = true;
  // Run on startup
  syncMembershipExpiries().catch(console.error);
  // Recurring check every hour
  setInterval(() => {
    syncMembershipExpiries().catch(console.error);
  }, 60 * 60 * 1000);
}
