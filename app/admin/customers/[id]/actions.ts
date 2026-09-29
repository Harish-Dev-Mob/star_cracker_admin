"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateCustomer(
  id: string,
  data: {
    name: string;
    email: string;
    phone: string;
    newPassword?: string;
    role: "CUSTOMER" | "ADMIN";
    isBlocked: boolean;
  }
) {
  try {
    const updateData: any = {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role,
      isBlocked: data.isBlocked,
    };

    if (data.newPassword && data.newPassword.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/admin/customers/${id}`);
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message || "Failed to update customer" };
  }
}
