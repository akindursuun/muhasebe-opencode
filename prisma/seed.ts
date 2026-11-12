import { PrismaClient, UserRole, AccountType, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const branchOne = await prisma.branch.upsert({ where: { code: "BR-001" }, update: {}, create: { code: "BR-001", name: "1. Şube" } });
  const branchTwo = await prisma.branch.upsert({ where: { code: "BR-002" }, update: {}, create: { code: "BR-002", name: "2. Şube" } });
  for (const branch of [branchOne, branchTwo]) {
    await prisma.category.createMany({ data: [
      { branchId: branch.id, name: "Oda Geliri", type: TransactionType.INCOME }, { branchId: branch.id, name: "Yiyecek & İçecek", type: TransactionType.INCOME },
      { branchId: branch.id, name: "Diğer Gelir", type: TransactionType.INCOME }, { branchId: branch.id, name: "Personel Gideri", type: TransactionType.EXPENSE },
      { branchId: branch.id, name: "Elektrik / Su / Doğalgaz", type: TransactionType.EXPENSE }, { branchId: branch.id, name: "Satın Alma", type: TransactionType.EXPENSE },
      { branchId: branch.id, name: "Bakım / Onarım", type: TransactionType.EXPENSE }, { branchId: branch.id, name: "Diğer Gider", type: TransactionType.EXPENSE }
    ], skipDuplicates: true });
    await prisma.financialAccount.upsert({ where: { branchId_name: { branchId: branch.id, name: "Ana Kasa" } }, update: {}, create: { branchId: branch.id, name: "Ana Kasa", type: AccountType.CASH } });
    await prisma.financialAccount.upsert({ where: { branchId_name: { branchId: branch.id, name: "Banka Hesabı" } }, update: {}, create: { branchId: branch.id, name: "Banka Hesabı", type: AccountType.BANK } });
  }
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (email && password && password !== "CHANGE_THIS_BEFORE_FIRST_RUN") {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({ where: { email }, update: {}, create: { name: process.env.INITIAL_ADMIN_NAME || "Sistem Yöneticisi", email, passwordHash, role: UserRole.SUPER_ADMIN } });
  } else {
    console.warn("Initial administrator not created. Set INITIAL_ADMIN_EMAIL and a strong INITIAL_ADMIN_PASSWORD in .env.");
  }
}
main().finally(async () => prisma.$disconnect());