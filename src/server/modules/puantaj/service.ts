import { prisma } from "@/server/db/prisma";

export async function getPuantaj(tenantId: string, year: number, month: number) {
  const entries = await prisma.payrollEntry.findMany({
    where: { tenantId, year, month, deletedAt: null },
  });
  return entries;
}

export async function upsertPuantaj(
  tenantId: string,
  payload: Array<{ employeeId: string; year: number; month: number; data: unknown }>,
) {
  for (const row of payload) {
    await prisma.payrollEntry.upsert({
      where: {
        tenantId_employeeId_year_month: {
          tenantId,
          employeeId: row.employeeId,
          year: row.year,
          month: row.month,
        },
      },
      create: {
        tenantId,
        employeeId: row.employeeId,
        year: row.year,
        month: row.month,
        payload: row.data as object,
      },
      update: {
        payload: row.data as object,
      },
    });
  }
}
