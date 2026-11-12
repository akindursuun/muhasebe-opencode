import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

function startOfDay(date: Date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
function startOfWeek(date: Date) { const d = startOfDay(date); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; }
function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
async function totals(where: { branchId?: string; transactionDate?: { gte: Date } }) {
  const [income, expense] = await Promise.all([
    prisma.financeTransaction.aggregate({ where: { ...where, type: "INCOME" }, _sum: { amount: true } }),
    prisma.financeTransaction.aggregate({ where: { ...where, type: "EXPENSE" }, _sum: { amount: true } })
  ]);
  const inValue = Number(income._sum.amount || 0);
  const outValue = Number(expense._sum.amount || 0);
  return { income: inValue, expense: outValue, net: inValue - outValue };
}
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const now = new Date();
  const scoped = user.branchId && !["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role) ? user.branchId : undefined;
  const [today, week, month, branches, accounts, recentTransactions] = await Promise.all([
    totals({ ...(scoped ? { branchId: scoped } : {}), transactionDate: { gte: startOfDay(now) } }),
    totals({ ...(scoped ? { branchId: scoped } : {}), transactionDate: { gte: startOfWeek(now) } }),
    totals({ ...(scoped ? { branchId: scoped } : {}), transactionDate: { gte: startOfMonth(now) } }),
    prisma.branch.findMany({ where: scoped ? { id: scoped, isActive: true } : { isActive: true }, orderBy: { code: "asc" } }),
    prisma.financialAccount.findMany({ where: { isActive: true, ...(scoped ? { branchId: scoped } : {}) }, include: { transactions: { select: { type: true, amount: true } } } }),
    prisma.financeTransaction.findMany({ where: scoped ? { branchId: scoped } : {}, include: { branch: { select: { name: true } }, account: { select: { name: true } } }, orderBy: { transactionDate: "desc" }, take: 8 })
  ]);
  const balances = accounts.reduce((acc, account) => {
    const movements = account.transactions.reduce((sum, tx) => sum + (tx.type === "INCOME" ? Number(tx.amount) : tx.type === "EXPENSE" ? -Number(tx.amount) : 0), 0);
    const balance = Number(account.openingBalance) + movements;
    if (account.type === "BANK") acc.bank += balance;
    if (account.type === "CASH") acc.cash += balance;
    return acc;
  }, { bank: 0, cash: 0 });
  const branchPerformance = await Promise.all(branches.map(async branch => ({ id: branch.id, code: branch.code, name: branch.name, ...(await totals({ branchId: branch.id, transactionDate: { gte: startOfMonth(now) } })) })));
  return NextResponse.json({
    generatedAt: now.toISOString(),
    today, week, month, balances, branchPerformance,
    recentTransactions: recentTransactions.map(tx => ({ id: tx.id, date: tx.transactionDate, type: tx.type, amount: Number(tx.amount), description: tx.description, branch: tx.branch.name, account: tx.account?.name || "—" }))
  });
}