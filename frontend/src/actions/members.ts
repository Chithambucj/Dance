"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createMember(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const firstName    = (formData.get("firstName")    as string)?.trim();
  const lastName     = (formData.get("lastName")     as string)?.trim();
  const email        = (formData.get("email")        as string)?.trim().toLowerCase();
  const phone        = (formData.get("phone")        as string)?.trim();
  const address      = (formData.get("address")      as string)?.trim();
  const password     = (formData.get("password")     as string) || "password";
  const isInstructor = formData.get("isInstructor") === "on";
  const bio          = (formData.get("bio")          as string)?.trim();
  const experience   = (formData.get("experience")   as string)?.trim();
  const specialities = (formData.get("specialities") as string)?.trim();
  const dob              = (formData.get("dob")              as string)?.trim();

  // Enrollment & Payment
  const batchId        = (formData.get("batchId") as string)?.trim();
  const totalFeeStr    = (formData.get("totalFee") as string)?.trim();
  const initialPaidStr = (formData.get("initialPayment") as string)?.trim();
  const paymentMethod  = (formData.get("paymentMethod") as string)?.trim() || "CASH";

  if (!firstName || !lastName || !email) {
    return { success: false, error: "First name, last name, and email are required." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: "A user with this email already exists." };

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: "MEMBER",
        firstName,
        lastName,
        phone: phone || null,
        address: address || null,
        status: "ACTIVE",
        isInstructor,
        bio: bio || null,
        experience: experience || null,
        specialities: specialities || null,
        ...(dob && { dateOfBirth: new Date(dob) }),
      },
    });

    if (batchId) {
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          batchId,
          status: "ACTIVE",
        },
      });

      const totalFee = totalFeeStr ? parseFloat(totalFeeStr) : 0;
      const initialPaid = initialPaidStr ? parseFloat(initialPaidStr) : 0;

      if (totalFee > 0) {
        if (initialPaid > 0) {
          await prisma.payment.create({
            data: {
              userId: user.id,
              amount: initialPaid,
              status: "COMPLETED",
              paymentMethod,
              description: "Initial Enrollment Fee",
              paidAt: new Date(),
            },
          });
        }
        const pendingAmount = totalFee - initialPaid;
        if (pendingAmount > 0) {
          await prisma.payment.create({
            data: {
              userId: user.id,
              amount: pendingAmount,
              status: "PENDING",
              description: "Remaining Enrollment Fee",
            },
          });
          await prisma.user.update({
            where: { id: user.id },
            data: { membershipStatus: "PAYMENT_PENDING" },
          });
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { membershipStatus: "ACTIVE" },
          });
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/instructors");
    return { success: true };
  } catch (err) {
    console.error("createMember error:", err);
    return { success: false, error: "Unexpected error. Please try again." };
  }
}

export async function editMember(id: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const firstName    = (formData.get("firstName")    as string)?.trim();
  const lastName     = (formData.get("lastName")     as string)?.trim();
  const email        = (formData.get("email")        as string)?.trim().toLowerCase();
  const phone        = (formData.get("phone")        as string)?.trim();
  const address      = (formData.get("address")      as string)?.trim();
  const status       = (formData.get("status")       as string) || "ACTIVE";
  const isInstructor = formData.get("isInstructor") === "on";
  const bio          = (formData.get("bio")          as string)?.trim();
  const experience   = (formData.get("experience")   as string)?.trim();
  const specialities = (formData.get("specialities") as string)?.trim();
  const profileImage = (formData.get("profileImage") as string)?.trim();
  const dob              = (formData.get("dob")              as string)?.trim();

  // Enrollment & Payment
  const batchId        = (formData.get("batchId") as string)?.trim();
  const totalFeeStr    = (formData.get("totalFee") as string)?.trim();
  const initialPaidStr = (formData.get("initialPayment") as string)?.trim();
  const paymentMethod  = (formData.get("paymentMethod") as string)?.trim() || "CASH";

  if (!firstName || !lastName || !email) {
    return { success: false, error: "First name, last name, and email are required." };
  }

  try {
    const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
    if (existing) return { success: false, error: "A user with this email already exists." };

    await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        status,
        isInstructor,
        bio: bio || null,
        experience: experience || null,
        specialities: specialities || null,
        ...(profileImage ? { profileImage } : {}),
        ...(dob && { dateOfBirth: new Date(dob) }),
      },
    });

    if (batchId) {
      // Check if not already enrolled
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: { userId: id, batchId },
      });
      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: id,
            batchId,
            status: "ACTIVE",
          },
        });
      }

      const totalFee = totalFeeStr ? parseFloat(totalFeeStr) : 0;
      const initialPaid = initialPaidStr ? parseFloat(initialPaidStr) : 0;

      if (totalFee > 0 && !existingEnrollment) {
        if (initialPaid > 0) {
          await prisma.payment.create({
            data: {
              userId: id,
              amount: initialPaid,
              status: "COMPLETED",
              paymentMethod,
              description: "Enrollment Fee",
              paidAt: new Date(),
            },
          });
        }
        const pendingAmount = totalFee - initialPaid;
        if (pendingAmount > 0) {
          await prisma.payment.create({
            data: {
              userId: id,
              amount: pendingAmount,
              status: "PENDING",
              description: "Remaining Enrollment Fee",
            },
          });
          await prisma.user.update({
            where: { id },
            data: { membershipStatus: "PAYMENT_PENDING" },
          });
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/instructors");
    return { success: true };
  } catch (err) {
    console.error("editMember error:", err);
    return { success: false, error: "Unexpected error. Please try again." };
  }
}

export async function toggleMemberStatus(id: string, newStatus: "ACTIVE" | "INACTIVE") {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("toggleMemberStatus error:", err);
    return { success: false, error: "Failed to update member status." };
  }
}

export async function resetMemberPassword(id: string, newPassword?: string) {
  await requireAuth(["ADMIN"]);
  try {
    const pass = newPassword?.trim() || "password";
    const hashed = await bcrypt.hash(pass, 12);
    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
    return { success: true };
  } catch (err) {
    console.error("resetMemberPassword error:", err);
    return { success: false, error: "Failed to reset password." };
  }
}

export async function deleteMember(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.attendance.deleteMany({ where: { userId: id } });
    await prisma.enrollment.deleteMany({ where: { userId: id } });
    await prisma.payment.deleteMany({ where: { userId: id } });
    
    await prisma.batch.updateMany({
      where: { instructorId: id },
      data: { instructorId: null },
    });

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/instructors");
    return { success: true };
  } catch (err) {
    console.error("deleteMember error:", err);
    return { success: false, error: "Failed to delete member." };
  }
}

export async function removeInstructor(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.batch.updateMany({
      where: { instructorId: id },
      data: { instructorId: null },
    });

    await prisma.user.update({
      where: { id },
      data: { isInstructor: false },
    });
    revalidatePath("/admin");
    revalidatePath("/instructors");
    return { success: true };
  } catch (err) {
    console.error("removeInstructor error:", err);
    return { success: false, error: "Failed to remove instructor." };
  }
}
