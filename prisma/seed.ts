/**
 * Prisma Seed Script — Happy Feetz Dance Studio
 * Run: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding studio database with complete studio data...");

  // ── Clean up existing data ──────────────────────────────
  // Order matters: delete children before parents (FK constraints)
  await prisma.notification.deleteMany();
  await prisma.whatsAppReminder.deleteMany();
  await prisma.freeTrial.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.media.deleteMany();
  await prisma.pricingPlan.deleteMany();
  await prisma.websiteSection.deleteMany();
  await prisma.studioSettings.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.classStyle.deleteMany();
  await prisma.razorpayOrder.deleteMany();
  await prisma.user.deleteMany();

  // ── Passwords ────────────────────────────────────────────
  const adminPass = await bcrypt.hash("admin", 12);
  const memberPass = await bcrypt.hash("password", 12);

  // ── 1. Studio Settings ────────────────────────────────────
  await prisma.studioSettings.create({
    data: {
      id: "default",
      studioName: "Dance Studio",
      tagline: "Move • Groove • Inspire",
      description: "Mumbai's most energetic dance studio. Hip Hop, Bollywood, Salsa & Contemporary classes for all age groups.",
      logo: "",
      favicon: "/favicon.ico",
      address: "123 Dance Ave, Bandra West, Mumbai, MH 400050",
      phone: "+91-98765-43210",
      email: "hello@dancestudio.com",
      googleMapsUrl: "https://maps.google.com/?q=Bandra+West+Mumbai",
      instagram: "https://instagram.com/dancestudio",
      facebook: "https://facebook.com/dancestudio",
      youtube: "https://youtube.com/dancestudio",
      whatsapp: "+919876543210",
      businessHours: "Mon-Sat: 7:00 AM - 9:00 PM, Sun: 8:00 AM - 2:00 PM",
      currency: "INR (₹)",
      timezone: "Asia/Kolkata",
      seoTitle: "Dance Studio | Move • Groove • Inspire",
      seoDescription: "Join our Dance Studio for Hip Hop, Bollywood, Salsa & Contemporary classes. Expert instructors, flexible schedules, all age groups. Book a trial class today!",
      socialPreviewImage: "/images/about-studio.jpg",
    },
  });

  // ── 2. Users (Admin, Instructors, Members) ────────────────
  const admin = await prisma.user.create({
    data: {
      email: "admin@dance.com",
      password: adminPass,
      role: "ADMIN",
      firstName: "Studio",
      lastName: "Owner",
      phone: "+91-98765-43210",
      address: "Bandra West, Mumbai",
      status: "ACTIVE",
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      email: "alex@dance.com",
      password: memberPass,
      role: "MEMBER",
      isInstructor: true,
      firstName: "Alex",
      lastName: "Johnson",
      phone: "+91-98765-00101",
      profileImage: "/images/hip-hop.jpg",
      bio: "10+ years choreographing Hip Hop, Urban Choreography & Street Styles. Finalist in Dance India Dance 2018.",
      experience: "10+ Years",
      specialities: "Hip Hop, Street Dance, Popping",
      status: "ACTIVE",
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: "priya@dance.com",
      password: memberPass,
      role: "MEMBER",
      isInstructor: true,
      firstName: "Priya",
      lastName: "Sharma",
      phone: "+91-98765-00102",
      profileImage: "/images/bollywood.jpg",
      bio: "Bollywood and Classical Kathak specialist. Trained in Mumbai & London, worked on over 15 music videos.",
      experience: "8+ Years",
      specialities: "Bollywood Fusion, Kathak, Semi-Classical",
      status: "ACTIVE",
    },
  });

  const instructor3 = await prisma.user.create({
    data: {
      email: "carlos@dance.com",
      password: memberPass,
      role: "MEMBER",
      isInstructor: true,
      firstName: "Carlos",
      lastName: "Mendez",
      phone: "+91-98765-00103",
      profileImage: "/images/salsa.jpg",
      bio: "International Salsa & Bachata champion. Passionate about rhythm, connection, and partner work.",
      experience: "12+ Years",
      specialities: "Salsa, Bachata, Latin Fusion",
      status: "ACTIVE",
    },
  });

  const members = await Promise.all([
    prisma.user.create({
      data: {
        email: "member@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "John",
        lastName: "Smith",
        phone: "+91-98200-11001",
        address: "Khar West, Mumbai",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Sarah",
        lastName: "Connor",
        phone: "+91-98200-11002",
        address: "Juhu, Mumbai",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        email: "bruce@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Bruce",
        lastName: "Wayne",
        phone: "+91-98200-11003",
        address: "Worli, Mumbai",
        status: "ACTIVE",
        membershipStatus: "PAYMENT_PENDING",
      },
    }),
    prisma.user.create({
      data: {
        email: "diana@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Diana",
        lastName: "Prince",
        phone: "+91-98200-11004",
        address: "Santacruz, Mumbai",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        email: "tony@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Tony",
        lastName: "Stark",
        phone: "+91-98200-11005",
        address: "Andheri West, Mumbai",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        email: "neha@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Neha",
        lastName: "Kapoor",
        phone: "+91-98200-11006",
        address: "Powai, Mumbai",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        email: "rohit@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Rohit",
        lastName: "Verma",
        phone: "+91-98200-11007",
        address: "Bandra East, Mumbai",
        status: "ACTIVE",
        membershipStatus: "PAYMENT_PENDING",
      },
    }),
    prisma.user.create({
      data: {
        email: "ananya@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Ananya",
        lastName: "Deshmukh",
        phone: "+91-98200-11008",
        address: "Dadar, Mumbai",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        email: "trial@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Kavya",
        lastName: "Sharma",
        phone: "+91-98111-22334",
        address: "Andheri West, Mumbai",
        status: "ACTIVE",
        membershipStatus: "TRIAL_EXPIRED",
        freeTrial: {
          create: {
            program: "Hip Hop",
            preferredBatch: "Evening (5 PM – 7 PM)",
            experienceLevel: "BEGINNER",
            trialStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            trialEndDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: "EXPIRED",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "expired@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Vikram",
        lastName: "Rao",
        phone: "+91-98222-33445",
        address: "Powai, Mumbai",
        status: "ACTIVE",
        membershipStatus: "TRIAL_EXPIRED",
        freeTrial: {
          create: {
            program: "Bollywood",
            preferredBatch: "Morning (7 AM – 9 AM)",
            experienceLevel: "INTERMEDIATE",
            trialStartDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            trialEndDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: "EXPIRED",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "activetrial@dance.com",
        password: memberPass,
        role: "MEMBER",
        firstName: "Active",
        lastName: "TrialUser",
        phone: "+91-99999-00001",
        address: "Bandra West, Mumbai",
        status: "ACTIVE",
        membershipStatus: "FREE_TRIAL",
        freeTrial: {
          create: {
            program: "Hip Hop",
            preferredBatch: "Morning (7 AM – 9 AM)",
            experienceLevel: "BEGINNER",
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            status: "ACTIVE",
          },
        },
      },
    }),
  ]);

  // ── 3. Class Styles (Dance Styles) ────────────────────────
  const [hipHop, bollywood, salsa, contemporary] = await Promise.all([
    prisma.classStyle.create({
      data: {
        name: "Hip Hop",
        description: "High-energy urban dance style blending rhythm, freestyle, popping, and breaking. Perfect for all age groups.",
        image: "/images/hip-hop.jpg",
        level: "All Levels",
        price: 1500,
        duration: "60 mins",
        isPublished: true,
        displayOrder: 1,
      },
    }),
    prisma.classStyle.create({
      data: {
        name: "Bollywood",
        description: "Vibrant Indian film dance combining classical, folk, and contemporary styles with energetic music.",
        image: "/images/bollywood.jpg",
        level: "Beginner & Inter",
        price: 1500,
        duration: "60 mins",
        isPublished: true,
        displayOrder: 2,
      },
    }),
    prisma.classStyle.create({
      data: {
        name: "Salsa",
        description: "Lively Latin partner dance focusing on footwork, timing, turns, and sensuous movement.",
        image: "/images/salsa.jpg",
        level: "Intermediate",
        price: 1800,
        duration: "75 mins",
        isPublished: true,
        displayOrder: 3,
      },
    }),
    prisma.classStyle.create({
      data: {
        name: "Contemporary",
        description: "Expressive modern dance integrating ballet, jazz, lyrical movement, and floorwork.",
        image: "/images/contemporary.jpg",
        level: "Advanced",
        price: 2000,
        duration: "90 mins",
        isPublished: true,
        displayOrder: 4,
      },
    }),
  ]);

  // ── 4. Batches ────────────────────────────────────────────
  const batch1 = await prisma.batch.create({
    data: {
      name: "Hip-Hop Beginners",
      classStyleId: hipHop.id,
      instructorId: instructor1.id,
      schedule: "Mon, Wed • 6:00 PM – 7:00 PM",
      days: "Monday, Wednesday",
      startTime: "18:00",
      endTime: "19:00",
      capacity: 20,
      feeMonthly: 1500,
      feeQuarterly: 4000,
      feeYearly: 12000,
      isActive: true,
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      name: "Bollywood Fusion",
      classStyleId: bollywood.id,
      instructorId: instructor2.id,
      schedule: "Tue, Thu • 5:00 PM – 6:00 PM",
      days: "Tuesday, Thursday",
      startTime: "17:00",
      endTime: "18:00",
      capacity: 25,
      feeMonthly: 1500,
      feeQuarterly: 4000,
      feeYearly: 12000,
      isActive: true,
    },
  });

  const batch3 = await prisma.batch.create({
    data: {
      name: "Salsa Intermediate",
      classStyleId: salsa.id,
      instructorId: instructor3.id,
      schedule: "Fri • 7:00 PM – 8:30 PM",
      days: "Friday",
      startTime: "19:00",
      endTime: "20:30",
      capacity: 15,
      feeMonthly: 1800,
      feeQuarterly: 4800,
      feeYearly: 15000,
      isActive: true,
    },
  });

  const batch4 = await prisma.batch.create({
    data: {
      name: "Contemporary Advanced",
      classStyleId: contemporary.id,
      instructorId: instructor2.id,
      schedule: "Sat • 10:00 AM – 12:00 PM",
      days: "Saturday",
      startTime: "10:00",
      endTime: "12:00",
      capacity: 12,
      feeMonthly: 2000,
      feeQuarterly: 5400,
      feeYearly: 18000,
      isActive: true,
    },
  });

  // ── 5. Enrollments ────────────────────────────────────────
  await prisma.enrollment.createMany({
    data: [
      { userId: members[0].id, batchId: batch1.id, status: "ACTIVE" },
      { userId: members[0].id, batchId: batch3.id, status: "ACTIVE" },
      { userId: members[1].id, batchId: batch2.id, status: "ACTIVE" },
      { userId: members[1].id, batchId: batch4.id, status: "ACTIVE" },
      { userId: members[2].id, batchId: batch1.id, status: "ACTIVE" },
      { userId: members[3].id, batchId: batch2.id, status: "ACTIVE" },
      { userId: members[3].id, batchId: batch3.id, status: "ACTIVE" },
      { userId: members[4].id, batchId: batch4.id, status: "ACTIVE" },
      { userId: members[5].id, batchId: batch2.id, status: "ACTIVE" },
      { userId: members[6].id, batchId: batch1.id, status: "ACTIVE" },
      { userId: members[7].id, batchId: batch3.id, status: "ACTIVE" },
    ],
  });

  // ── 6. Attendance ─────────────────────────────────────────
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    d.setHours(18, 0, 0, 0);
    return d;
  };

  await prisma.attendance.createMany({
    data: [
      { userId: members[0].id, batchId: batch1.id, date: daysAgo(1), present: true },
      { userId: members[0].id, batchId: batch1.id, date: daysAgo(3), present: true },
      { userId: members[0].id, batchId: batch1.id, date: daysAgo(8), present: false },
      { userId: members[0].id, batchId: batch3.id, date: daysAgo(2), present: true },
      { userId: members[2].id, batchId: batch1.id, date: daysAgo(1), present: true },
      { userId: members[2].id, batchId: batch1.id, date: daysAgo(3), present: false },
      { userId: members[1].id, batchId: batch2.id, date: daysAgo(2), present: true },
      { userId: members[1].id, batchId: batch2.id, date: daysAgo(4), present: true },
      { userId: members[3].id, batchId: batch2.id, date: daysAgo(2), present: true },
      { userId: members[5].id, batchId: batch2.id, date: daysAgo(2), present: true },
      { userId: members[6].id, batchId: batch1.id, date: daysAgo(1), present: true },
    ],
  });

  // ── 7. Payments ───────────────────────────────────────────
  await prisma.payment.createMany({
    data: [
      { userId: members[0].id, amount: 1500, status: "COMPLETED", paymentMethod: "UPI", description: "Monthly Membership - Hip Hop", createdAt: daysAgo(5), referenceNumber: "UPI-8849102" },
      { userId: members[0].id, amount: 1500, status: "COMPLETED", paymentMethod: "Cash", description: "Monthly Membership - Salsa", createdAt: daysAgo(35), referenceNumber: "CASH-0021" },
      { userId: members[1].id, amount: 4000, status: "COMPLETED", paymentMethod: "Card", description: "Quarterly Plan - Bollywood", createdAt: daysAgo(10), referenceNumber: "CARD-99120" },
      { userId: members[2].id, amount: 1500, status: "PENDING", paymentMethod: null, description: "Monthly Membership - Hip Hop", dueDate: daysAgo(5), notes: "Pending student transfer" },
      { userId: members[3].id, amount: 1800, status: "COMPLETED", paymentMethod: "UPI", description: "Monthly Membership - Salsa", createdAt: daysAgo(7), referenceNumber: "UPI-449102" },
      { userId: members[4].id, amount: 12000, status: "COMPLETED", paymentMethod: "Bank Transfer", description: "Annual Plan - All Access", createdAt: daysAgo(2), referenceNumber: "NEFT-77123" },
      { userId: members[5].id, amount: 1500, status: "COMPLETED", paymentMethod: "UPI", description: "Monthly Membership - Bollywood", createdAt: daysAgo(12), referenceNumber: "UPI-66129" },
      { userId: members[6].id, amount: 1500, status: "PENDING", paymentMethod: null, description: "Monthly Membership - Hip Hop", dueDate: daysAgo(2) },
    ],
  });

  // ── 8. Announcements ──────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      {
        title: "🎉 Annual Dance Showcase — Save the Date!",
        content: "Our Annual Dance Showcase is taking place on September 15th at St. Andrew's Auditorium, Bandra! All members are invited to participate. Auditions begin next week.",
        image: "/images/about-studio.jpg",
        targetAudience: "ALL",
        isPublished: true,
      },
      {
        title: "Independence Day Holiday Notice",
        content: "The studio will remain closed on August 15th. Regular batch schedules will resume seamlessly on August 16th.",
        targetAudience: "ALL",
        isPublished: true,
      },
      {
        title: "Special Contemporary Masterclass with Guest Artist",
        content: "Exclusive 2-hour lyrical contemporary masterclass this Saturday with international guest artist Liam Vance. Registration open on Member Dashboard.",
        image: "/images/contemporary.jpg",
        targetAudience: "MEMBERS",
        isPublished: true,
      },
    ],
  });

  // ── 9. Events ─────────────────────────────────────────────
  await prisma.event.createMany({
    data: [
      {
        title: "Summer Hip Hop Battle 2026",
        description: "Open 1v1 and 2v2 freestyle street dance battle. Cash prizes, certificates, and live DJ sets!",
        image: "/images/hip-hop.jpg",
        eventDate: daysAgo(-15),
        startTime: "4:00 PM",
        endTime: "8:00 PM",
        location: "Main Studio Stage, Bandra",
        registrationRequired: true,
        registrationLink: "https://happyfeetz.com/events/battle-2026",
        category: "Competition",
        isPublished: true,
        displayOrder: 1,
      },
      {
        title: "Bollywood Choreography Weekend Workshop",
        description: "Intensive 2-day workshop covering viral Bollywood choreography and expressive facial expressions with Priya Sharma.",
        image: "/images/bollywood.jpg",
        eventDate: daysAgo(-22),
        startTime: "11:00 AM",
        endTime: "2:00 PM",
        location: "Studio Hall 2",
        registrationRequired: true,
        registrationLink: "https://happyfeetz.com/events/bollywood-workshop",
        category: "Workshop",
        isPublished: true,
        displayOrder: 2,
      },
      {
        title: "Sensual Salsa & Bachata Social Night",
        description: "A fun-filled Latin dance social evening for couples and solo dancers. Includes a 45-min beginner intro lesson!",
        image: "/images/salsa.jpg",
        eventDate: daysAgo(-30),
        startTime: "7:30 PM",
        endTime: "11:00 PM",
        location: "Sky Lounge Studio, Bandra",
        registrationRequired: false,
        category: "Special Class",
        isPublished: true,
        displayOrder: 3,
      },
    ],
  });

  // ── 10. Pricing Plans (Paid Plans Only) ───────────────────
  await prisma.pricingPlan.createMany({
    data: [
      {
        name: "Monthly Plan",
        description: "Our most popular membership for consistent dance progression.",
        price: 1500,
        period: "/ month",
        billingPeriod: "MONTHLY",
        durationDays: 30,
        classesIncluded: "8 Classes / Month",
        validity: "30 Days",
        features: JSON.stringify(["8 Classes per month", "Batch schedule flexibility", "Progress tracking in portal", "WhatsApp community support", "Access to practice hall"]),
        isFeatured: true,
        isPublished: true,
        displayOrder: 1,
        badge: "Most Popular",
      },
      {
        name: "Quarterly Plan",
        description: "Best value for dedicated dancers committed to mastering a style.",
        price: 4000,
        period: "/ 3 months",
        billingPeriod: "QUARTERLY",
        durationDays: 90,
        classesIncluded: "24 Classes / 3 Months",
        validity: "90 Days",
        features: JSON.stringify(["24 Classes across 3 months", "Priority enrollment in batches", "1 make-up class per month", "Quarterly showcase qualification", "10% off guest workshops"]),
        isFeatured: false,
        isPublished: true,
        displayOrder: 2,
        badge: "Best Value",
      },
      {
        name: "Annual All-Access",
        description: "Unlimited dance pass for passionate artists and performance enthusiasts.",
        price: 12000,
        period: "/ year",
        billingPeriod: "YEARLY",
        durationDays: 365,
        classesIncluded: "Unlimited Classes",
        validity: "365 Days",
        features: JSON.stringify(["Unlimited classes across all styles", "Free entry to Annual Showcase", "2 free workshop passes", "Personal mentor review", "Exclusive studio merchandise kit"]),
        isFeatured: false,
        isPublished: true,
        displayOrder: 3,
      },
    ],
  });

  const createdPlans = await prisma.pricingPlan.findMany();
  const monthlyPlan = createdPlans.find((p) => p.billingPeriod === "MONTHLY") || createdPlans[0];
  const quarterlyPlan = createdPlans.find((p) => p.billingPeriod === "QUARTERLY") || createdPlans[1];
  const annualPlan = createdPlans.find((p) => p.billingPeriod === "YEARLY") || createdPlans[2];

  // Create active memberships for paid members
  if (monthlyPlan && quarterlyPlan && annualPlan) {
    await prisma.membership.createMany({
      data: [
        {
          membershipNumber: "MEM-2026-001",
          userId: members[0].id, // John Smith
          planId: monthlyPlan.id,
          startDate: daysAgo(25),
          expiryDate: daysAgo(-5), // Active, expires in 5 days
          status: "ACTIVE",
          totalFee: 1500,
          amountPaid: 1500,
          pendingAmount: 0,
        },
        {
          membershipNumber: "MEM-2026-002",
          userId: members[1].id, // Sarah Connor
          planId: quarterlyPlan.id,
          startDate: daysAgo(10),
          expiryDate: daysAgo(-80), // Active, expires in 80 days
          status: "ACTIVE",
          totalFee: 4000,
          amountPaid: 4000,
          pendingAmount: 0,
        },
        {
          membershipNumber: "MEM-2026-003",
          userId: members[3].id, // Diana Prince
          planId: monthlyPlan.id,
          startDate: daysAgo(7),
          expiryDate: daysAgo(-23), // Active, expires in 23 days
          status: "ACTIVE",
          totalFee: 1800,
          amountPaid: 1800,
          pendingAmount: 0,
        },
        {
          membershipNumber: "MEM-2026-004",
          userId: members[4].id, // Tony Stark
          planId: annualPlan.id,
          startDate: daysAgo(2),
          expiryDate: daysAgo(-363), // Active, expires in ~1 year
          status: "ACTIVE",
          totalFee: 12000,
          amountPaid: 12000,
          pendingAmount: 0,
        },
        {
          membershipNumber: "MEM-2026-005",
          userId: members[5].id, // Neha Kapoor
          planId: monthlyPlan.id,
          startDate: daysAgo(12),
          expiryDate: daysAgo(-18), // Active, expires in 18 days
          status: "ACTIVE",
          totalFee: 1500,
          amountPaid: 1500,
          pendingAmount: 0,
        },
        {
          membershipNumber: "MEM-2026-006",
          userId: members[2].id, // Bruce Wayne
          planId: monthlyPlan.id,
          startDate: daysAgo(35),
          expiryDate: daysAgo(5), // Due date in the past -> Overdue
          status: "PAYMENT_PENDING",
          totalFee: 1500,
          amountPaid: 0,
          pendingAmount: 1500,
        },
        {
          membershipNumber: "MEM-2026-007",
          userId: members[6].id, // Rohit Verma
          planId: monthlyPlan.id,
          startDate: daysAgo(32),
          expiryDate: daysAgo(2), // Due date in the past -> Overdue
          status: "PAYMENT_PENDING",
          totalFee: 1500,
          amountPaid: 0,
          pendingAmount: 1500,
        },
      ],
    });
  }

  // ── 11. Media / Gallery ───────────────────────────────────
  await prisma.media.createMany({
    data: [
      {
        title: "Annual Showcase 2025 Grand Finale",
        description: "Our student troupe performance at St. Andrew's Auditorium",
        filePath: "/images/about-studio.jpg",
        publicUrl: "/images/about-studio.jpg",
        mediaType: "IMAGE",
        category: "Performances",
        isFeatured: true,
        isPublished: true,
        displayOrder: 1,
      },
      {
        title: "Hip Hop Street Jam Session",
        description: "Freestyle circle battle during urban choreography training",
        filePath: "/images/hip-hop.jpg",
        publicUrl: "/images/hip-hop.jpg",
        mediaType: "IMAGE",
        category: "Classes",
        isFeatured: true,
        isPublished: true,
        displayOrder: 2,
      },
      {
        title: "Bollywood Beats Rehearsal",
        description: "Energetic festive choreography sequence rehearsal",
        filePath: "/images/bollywood.jpg",
        publicUrl: "/images/bollywood.jpg",
        mediaType: "IMAGE",
        category: "Classes",
        isFeatured: true,
        isPublished: true,
        displayOrder: 3,
      },
      {
        title: "Contemporary Floorwork Masterclass",
        description: "Expressive lyrical combinations and modern floorwork",
        filePath: "/images/contemporary.jpg",
        publicUrl: "/images/contemporary.jpg",
        mediaType: "IMAGE",
        category: "Classes",
        isFeatured: true,
        isPublished: true,
        displayOrder: 4,
      },
      {
        title: "Salsa Social Night Fever",
        description: "Latin partner dance moves and turn patterns",
        filePath: "/images/salsa.jpg",
        publicUrl: "/images/salsa.jpg",
        mediaType: "IMAGE",
        category: "Events",
        isFeatured: false,
        isPublished: true,
        displayOrder: 5,
      },
      {
        title: "Studio Interior & Mirrored Dance Floor",
        description: "Our state-of-the-art 3,000 sq ft dance floor with acoustic sound system",
        filePath: "/images/about-studio.jpg",
        publicUrl: "/images/about-studio.jpg",
        mediaType: "IMAGE",
        category: "Studio",
        isFeatured: false,
        isPublished: true,
        displayOrder: 6,
      },
    ],
  });

  // ── 12. Website CMS Sections ──────────────────────────────
  await prisma.websiteSection.createMany({
    data: [
      {
        sectionKey: "hero",
        heading: "Dance Your Way",
        highlightedText: "to a Better You",
        description: "Experience the joy of movement with Mumbai's premier dance community. Learn Hip Hop, Bollywood, Salsa, and Contemporary from award-winning instructors.",
        badgeText: "🔥 Summer Admissions Open • 2026 Batch",
        primaryBtnText: "Explore Classes",
        primaryBtnLink: "/classes",
        secondaryBtnText: "View Schedule",
        secondaryBtnLink: "/schedule",
        image: "/images/about-studio.jpg",
        isPublished: true,
      },
      {
        sectionKey: "about",
        title: "Our Story",
        subtitle: "Born from a love of movement, our studio has grown into Mumbai's most vibrant dance family.",
        description: "To make professional dance education accessible, joyful, and transformative for every individual — from the first-time dancer to the seasoned performer.",
        image: "/images/about-studio.jpg",
        data: JSON.stringify({
          mission: "To make professional dance education accessible, joyful, and transformative for every individual — from the first-time dancer to the seasoned performer.",
          vision: "To be India's most loved dance studio brand — known for our warmth, diversity of styles, and the lasting confidence we build.",
          milestones: [
            { year: "2015", event: "Founded in Bandra with just 15 students and 1 dance floor." },
            { year: "2018", event: "Expanded to a 3,000 sq ft studio; launched Bollywood and Salsa programs." },
            { year: "2021", event: "Won Regional Dance Academy of the Year award." },
            { year: "2026", event: "Over 500+ active members and 25+ regular dance batches." },
          ],
        }),
        isPublished: true,
      },
      {
        sectionKey: "stats",
        title: "Studio Milestones",
        data: JSON.stringify([
          { value: "500+", label: "Active Dancers" },
          { value: "15+", label: "Expert Instructors" },
          { value: "25+", label: "Weekly Batches" },
          { value: "98%", label: "Satisfaction Rate" },
        ]),
        isPublished: true,
      },
      {
        sectionKey: "why_choose_us",
        title: "Why Dance With Us?",
        data: JSON.stringify([
          { title: "World-Class Choreographers", desc: "Learn from certified, award-winning dancers with national and international stage experience." },
          { title: "Premium Acoustic Studio", desc: "3,000 sq ft sprung wooden flooring designed to prevent joint injuries and enhance movement." },
          { title: "Flexible Batch Schedules", desc: "Morning, evening, and weekend batches tailored for working professionals and students." },
          { title: "Stage & Showcase Opportunities", desc: "Perform in annual showcases, video shoots, and inter-studio dance competitions." },
        ]),
        isPublished: true,
      },
    ],
  });

  console.log("✅ Seeding complete!");
  console.log("\n🔐 Default Credentials:");
  console.log("   Admin (Studio Owner): admin@dance.com    / admin");
  console.log("   Member (Student):    member@dance.com   / password");
  console.log("   (+ sarah, bruce, diana, tony, neha, rohit, ananya @dance.com / password)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
