import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testSms() {
  const code = '123456';
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

  const input = {
    telefon: 'vbilmemkacv3',
    type: 'register',
    payload: { adSoyad: 'Test', tckn: '12312312311', eposta: 'test@h.com', telefon: '5551234567', sifreHash: 'abc' }
  };

  try {
    const record = await prisma.smsVerification.create({
      data: {
        tenantId: input.tenantId || undefined,
        userId: input.userId || undefined,
        telefon: '5551234567',
        type: input.type,
        codeHash,
        expiresAt,
        payload: input.payload ? JSON.parse(JSON.stringify(input.payload)) : undefined
      },
    });
    console.log("Success:", record);
  } catch (error) {
    console.error("Prisma Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSms();
