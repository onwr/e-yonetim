import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

type AuditInput = {
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  meta?: unknown;
};

export async function writeAuditLog(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      meta: input.meta ? (input.meta as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
}
