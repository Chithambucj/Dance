"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";

export async function getDashboardMembersData() {
  await requireAuth(["ADMIN"]);

  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: {
          batch: {
            include: { classStyle: true }
          }
        }
      }
    }
  });

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === "ACTIVE").length;
  const inactiveMembers = totalMembers - activeMembers;
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = members.filter((m) => new Date(m.createdAt) >= firstDayOfMonth).length;

  return {
    stats: {
      total: totalMembers,
      active: activeMembers,
      inactive: inactiveMembers,
      newThisMonth,
      male: 0, // Not tracked in DB currently
      female: 0, // Not tracked in DB currently
      other: totalMembers, // All default to other/not specified
    },
    members: members.map(m => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      phone: m.phone,
      email: m.email,
      status: m.status,
      createdAt: m.createdAt,
      enrollments: m.enrollments.map(e => ({
        batchName: e.batch.name,
        className: e.batch.classStyle.name
      }))
    }))
  };
}

export async function getDashboardBatchesData() {
  await requireAuth(["ADMIN"]);

  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      classStyle: true,
      instructor: true,
      _count: { select: { enrollments: true } }
    }
  });

  const activeBatchesCount = batches.filter(b => b.isActive).length;

  return {
    stats: {
      total: batches.length,
      active: activeBatchesCount,
    },
    batches: batches.map(b => ({
      id: b.id,
      name: b.name,
      danceStyle: b.classStyle.name,
      instructor: b.instructor ? `${b.instructor.firstName} ${b.instructor.lastName}` : "Unassigned",
      schedule: b.schedule,
      capacity: b.capacity,
      enrolled: b._count.enrollments,
      status: b.isActive ? "Active" : "Inactive"
    }))
  };
}

export async function getDashboardTodayClassesData() {
  await requireAuth(["ADMIN"]);

  const today = new Date();
  const todayName = today.toLocaleDateString("en-US", { weekday: "short" });

  const batches = await prisma.batch.findMany({
    where: { isActive: true },
    include: {
      classStyle: true,
      instructor: true,
      _count: { select: { enrollments: true } },
      attendances: {
        where: {
          date: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lt: new Date(today.setHours(23, 59, 59, 999))
          }
        }
      }
    }
  });

  const todayClasses = batches.filter(b => b.schedule.toLowerCase().includes(todayName.toLowerCase()));

  return {
    classes: todayClasses.map(b => {
      const present = b.attendances.filter(a => a.present).length;
      const absent = b.attendances.filter(a => !a.present).length;
      const attendanceRecorded = present + absent;
      const attendancePct = attendanceRecorded > 0 ? Math.round((present / attendanceRecorded) * 100) : 0;

      return {
        id: b.id,
        className: b.classStyle.name,
        batchName: b.name,
        instructor: b.instructor ? `${b.instructor.firstName} ${b.instructor.lastName}` : "Unassigned",
        schedule: b.schedule,
        students: b._count.enrollments,
        present,
        absent,
        attendancePct,
        status: "Scheduled" // Could be dynamically calculated based on time
      };
    })
  };
}

export async function getDashboardRevenueData() {
  await requireAuth(["ADMIN"]);

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } }
    }
  });

  const totalRevenue = payments.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === "PENDING" || p.status === "OVERDUE").reduce((sum, p) => sum + p.amount, 0);
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthRevenue = payments
    .filter(p => p.status === "COMPLETED" && new Date(p.createdAt) >= firstDayOfMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  const todayStart = new Date(now.setHours(0,0,0,0));
  const todayCollection = payments
    .filter(p => p.status === "COMPLETED" && new Date(p.createdAt) >= todayStart)
    .reduce((sum, p) => sum + p.amount, 0);

  const lastMonthRevenue = payments
    .filter(p => p.status === "COMPLETED" && new Date(p.createdAt) >= firstDayOfLastMonth && new Date(p.createdAt) < firstDayOfMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    stats: {
      total: totalRevenue,
      pending: pendingAmount,
      thisMonth: thisMonthRevenue,
      today: todayCollection,
      lastMonth: lastMonthRevenue,
      transactionsCount: payments.length
    },
    transactions: payments.map(p => ({
      id: p.id,
      date: p.createdAt,
      member: `${p.user.firstName} ${p.user.lastName}`,
      type: p.description || "Fee",
      amount: p.amount,
      method: p.paymentMethod || "Direct",
      status: p.status
    }))
  };
}

export async function getDashboardAttendanceData() {
  await requireAuth(["ADMIN"]);

  const attendances = await prisma.attendance.findMany({
    orderBy: { date: "desc" },
    take: 500, // Limit to recent for performance
    include: {
      user: { select: { firstName: true, lastName: true } },
      batch: { select: { name: true, instructor: { select: { firstName: true, lastName: true } } } }
    }
  });

  const total = attendances.length;
  const presentCount = attendances.filter(a => a.present).length;
  const attendancePct = total > 0 ? Math.round((presentCount / total) * 100) : 100;

  const today = new Date();
  const todayStart = new Date(today.setHours(0,0,0,0));
  
  const todayAttendances = attendances.filter(a => new Date(a.date) >= todayStart);
  const presentToday = todayAttendances.filter(a => a.present).length;
  const absentToday = todayAttendances.filter(a => !a.present).length;

  return {
    stats: {
      percentage: attendancePct,
      totalRecords: total,
      presentToday,
      absentToday,
      lateCheckins: 0 // Not tracked in DB
    },
    records: attendances.map(a => ({
      id: a.id,
      student: `${a.user.firstName} ${a.user.lastName}`,
      batch: a.batch.name,
      instructor: a.batch.instructor ? `${a.batch.instructor.firstName} ${a.batch.instructor.lastName}` : "Unassigned",
      date: a.date,
      status: a.present ? "Present" : "Absent"
    }))
  };
}

export async function getDashboardPopularClassesData() {
  await requireAuth(["ADMIN"]);

  const classStyles = await prisma.classStyle.findMany({
    include: {
      batches: {
        include: {
          instructor: { select: { firstName: true, lastName: true } },
          enrollments: {
            include: {
              user: {
                include: {
                  attendances: true,
                  payments: true
                }
              }
            }
          }
        }
      }
    }
  });

  return classStyles.map(cs => {
    let totalStudents = 0;
    let totalCapacity = 0;
    const studentsList: any[] = [];

    cs.batches.forEach(b => {
      totalStudents += b.enrollments.length;
      totalCapacity += b.capacity;

      b.enrollments.forEach(e => {
        const atts = e.user.attendances.filter(a => a.batchId === b.id);
        const present = atts.filter(a => a.present).length;
        const attPct = atts.length > 0 ? Math.round((present / atts.length) * 100) : 100;

        const pending = e.user.payments.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

        studentsList.push({
          id: e.user.id,
          student: `${e.user.firstName} ${e.user.lastName}`,
          batch: b.name,
          instructor: b.instructor ? `${b.instructor.firstName} ${b.instructor.lastName}` : "Unassigned",
          attendancePct: attPct,
          feeStatus: pending > 0 ? `₹${pending} Due` : "Clear"
        });
      });
    });

    return {
      id: cs.id,
      name: cs.name,
      stats: {
        enrolled: totalStudents,
        capacity: totalCapacity,
        batches: cs.batches.length,
        revenue: 0 // Simplification
      },
      students: studentsList
    };
  }).sort((a, b) => b.stats.enrolled - a.stats.enrolled);
}

export async function getFullMemberData(memberId: string) {
  await requireAuth(["ADMIN"]);

  const member = await prisma.user.findUnique({
    where: { id: memberId },
    include: {
      enrollments: {
        include: {
          batch: {
            include: { classStyle: true, instructor: true }
          }
        }
      },
      payments: { orderBy: { createdAt: "desc" } },
      memberships: {
        include: { plan: true },
        orderBy: { createdAt: "desc" }
      },
      attendances: {
        include: { batch: { include: { classStyle: true } } },
        orderBy: { date: "desc" }
      }
    }
  });

  return member;
}
