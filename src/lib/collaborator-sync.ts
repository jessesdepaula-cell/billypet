import { prisma } from "@/lib/db";

/**
 * Automatically creates Collaborator records for existing tenant Users
 * who do not yet have a Collaborator record. This is a migration helper 
 * that resolves the issue where previously registered veterinarians/staff
 * were stored only in the User table and did not appear under the new 
 * Collaborators architecture.
 */
export async function syncCollaborators(tenantId: string) {
  try {
    const usersWithoutCollaborator = await prisma.user.findMany({
      where: {
        tenantId,
        role: { not: "SUPER_ADMIN" },
        collaborator: { is: null },
      },
    });

    if (usersWithoutCollaborator.length === 0) return;

    for (const user of usersWithoutCollaborator) {
      await prisma.collaborator.create({
        data: {
          tenantId,
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    }

    console.log(`Synced ${usersWithoutCollaborator.length} users to collaborators for tenant ${tenantId}`);
  } catch (err) {
    console.error("Error syncing collaborators:", err);
  }
}
