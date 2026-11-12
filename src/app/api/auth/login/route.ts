import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });
export async function POST(request: NextRequest) {
  try {
    const input = schema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: "E-posta veya şifre formatı geçersiz." }, { status: 400 });
    const email = input.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || !(await bcrypt.compare(input.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }
    await createSession({ id: user.id, name: user.name, email: user.email, role: user.role, branchId: user.branchId });
    return NextResponse.json({ ok: true, user: { name: user.name, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Giriş servisi şu anda kullanılamıyor." }, { status: 500 });
  }
}