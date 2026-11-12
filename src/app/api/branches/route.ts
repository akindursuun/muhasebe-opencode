import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const createSchema = z.object({ code: z.string().min(2).max(12).regex(/^[A-Z0-9-]+$/), name: z.string().min(2).max(100), address: z.string().max(250).optional() });
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const where = user.branchId && !["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role) ? { id: user.branchId } : { isActive: true };
  const branches = await prisma.branch.findMany({ where, orderBy: { code: "asc" }, select: { id: true, code: true, name: true, address: true, isActive: true } });
  return NextResponse.json({ branches });
}
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN","GENERAL_MANAGER"].includes(user.role)) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  const input = createSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "Şube bilgilerini kontrol edin." }, { status: 400 });
  const branch = await prisma.branch.create({ data: input.data });
  return NextResponse.json({ branch }, { status: 201 });
}