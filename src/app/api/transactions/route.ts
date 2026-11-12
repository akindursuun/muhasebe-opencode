import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canManageFinance, getSessionUser } from "@/lib/auth";

const createSchema = z.object({
  branchId: z.string().min(1), accountId: z.string().optional().nullable(), categoryId: z.string().optional().nullable(),
  type: z.enum(["INCOME","EXPENSE"]), transactionDate: z.string().datetime(), amount: z.number().positive().max(999999999),
  description: z.string().min(2).max(500), documentNo: z.string().max(100).optional(), notes: z.string().max(2000).optional()
});
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const branchId = params.get("branchId");
  if (user.branchId && !["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role) && branchId && branchId !== user.branchId) return NextResponse.json({ error: "Şube erişim yetkiniz yok." }, { status: 403 });
  const where: any = {};
  if (user.branchId && !["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role)) where.branchId = user.branchId;
  else if (branchId) where.branchId = branchId;
  const from = params.get("from"); const to = params.get("to");
  if (from || to) where.transactionDate = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };
  const transactions = await prisma.financeTransaction.findMany({ where, include: { branch: true, account: true, category: true }, orderBy: { transactionDate: "desc" }, take: 500 });
  return NextResponse.json({ transactions });
}
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  if (!canManageFinance(user.role)) return NextResponse.json({ error: "Finans kaydı oluşturma yetkiniz yok." }, { status: 403 });
  const input = createSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "İşlem bilgilerini kontrol edin.", details: input.error.flatten() }, { status: 400 });
  if (user.branchId && !["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role) && input.data.branchId !== user.branchId) return NextResponse.json({ error: "Bu şubeye kayıt ekleyemezsiniz." }, { status: 403 });
  const branch = await prisma.branch.findUnique({ where: { id: input.data.branchId } });
  if (!branch) return NextResponse.json({ error: "Şube bulunamadı." }, { status: 404 });
  if (input.data.accountId) {
    const account = await prisma.financialAccount.findFirst({ where: { id: input.data.accountId, branchId: input.data.branchId } });
    if (!account) return NextResponse.json({ error: "Finans hesabı bu şubeye ait değil." }, { status: 400 });
  }
  if (input.data.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: input.data.categoryId, type: input.data.type, OR: [{ branchId: input.data.branchId }, { branchId: null }] } });
    if (!category) return NextResponse.json({ error: "Kategori bu şubeye veya işlem türüne ait değil." }, { status: 400 });
  }
  const transaction = await prisma.financeTransaction.create({ data: {
    branchId: input.data.branchId, accountId: input.data.accountId || null, categoryId: input.data.categoryId || null,
    createdById: user.id, type: input.data.type, transactionDate: new Date(input.data.transactionDate),
    amount: input.data.amount, description: input.data.description, documentNo: input.data.documentNo, notes: input.data.notes
  }});
  await prisma.auditLog.create({ data: { userId: user.id, action: "CREATE", entity: "FinanceTransaction", entityId: transaction.id, afterData: { type: transaction.type, amount: transaction.amount.toString(), branchId: transaction.branchId } } });
  return NextResponse.json({ transaction }, { status: 201 });
}