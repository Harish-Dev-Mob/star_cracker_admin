"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCustomer(
  id: string,
  data: {
    name: string;
    email: string;
    phone: string;
    role: "CUSTOMER" | "ADMIN";
    isBlocked: boolean;
  }
) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role,
        isBlocked: data.isBlocked,
      },
    });

    revalidatePath(`/admin/customers/${id}`);
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message || "Failed to update customer" };
  }
}
