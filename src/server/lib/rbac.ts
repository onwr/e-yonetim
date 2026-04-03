import { prisma } from "@/server/db/prisma";
import { forbidden } from "@/server/lib/errors";

export async function ensurePermission(userId: string, resource: string, action: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const hasPermission = userRoles.some((userRole) =>
    userRole.role.rolePermissions.some(
      (rp) =>
        (rp.permission.resource === resource || rp.permission.resource === "*") &&
        (rp.permission.action === action || rp.permission.action === "*"),
    ),
  );

  if (!hasPermission) {
    throw forbidden();
  }
}
