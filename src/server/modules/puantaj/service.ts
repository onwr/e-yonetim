import { prisma } from "@/server/db/prisma";

export async function getPuantaj(tenantId: string, year: number, month: number) {
  const entries = await prisma.payrollEntry.findMany({
    where: { tenantId, year, month, deletedAt: null },
  });
  return entries;
}

export async function upsertPuantaj(
  tenantId: string,
  payload: Array<{ employeeId: string; year: number; month: number; data: unknown; overtime?: any; isLocked?: boolean }>,
) {
  for (const row of payload) {
    const emp = await prisma.employee.findUnique({
      where: { id: row.employeeId }
    });

    let filteredData = { ...(row.data as object) };
    let filteredOvertime = row.overtime ? { ...row.overtime } : {};

    if (emp && emp.personelJson && typeof emp.personelJson === "object") {
       const pj = emp.personelJson as any;
       // istenAyrilisTarihi ve iseBaslamaTarihi esas alan adlarıdır
       const cikisStr = pj?.istenAyrilisTarihi || pj?.cikisTarihi || pj?.sgkCikisTarihi || pj['İşten Çıkış Tarihi'] || null;
       const girisStr = pj?.iseBaslamaTarihi || pj?.girisTarihi || pj?.sgkGirisTarihi || pj['İşe Giriş Tarihi'] || null;
       
       const exitDate = cikisStr ? new Date(cikisStr) : null;
       if (exitDate && !isNaN(exitDate.getTime())) exitDate.setHours(0, 0, 0, 0);
       
       const entryDate = girisStr ? new Date(girisStr) : null;
       if (entryDate && !isNaN(entryDate.getTime())) entryDate.setHours(0, 0, 0, 0);
       
       const daysInMonth = new Date(row.year, row.month + 1, 0).getDate();
       
       for (let day = 1; day <= daysInMonth; day++) {
         const tempDate = new Date(row.year, row.month, day);
         tempDate.setHours(0, 0, 0, 0);
         const isAfterExit = exitDate && tempDate > exitDate;
         const isBeforeEntry = entryDate && tempDate < entryDate;
         
         if (isAfterExit || isBeforeEntry) {
           delete (filteredData as any)[day];
           if (typeof filteredOvertime === "object") {
             delete (filteredOvertime as any)[day];
           }
         }
       }
    }

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
        payload: {
          ...filteredData,
          overtime: filteredOvertime,
          isLocked: row.isLocked,
        },
      },
      update: {
        payload: {
          ...filteredData,
          overtime: filteredOvertime,
          isLocked: row.isLocked,
        },
      },
    });
  }
}
