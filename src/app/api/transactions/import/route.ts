import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { canManageFinance, getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
function normalized(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]/g, "");
}
function parseAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.abs(value);
  let raw = String(value ?? "").trim().replace(/₺|TRY|TL/gi, "").replace(/\s/g, "");
  if (!raw) return null;
  if (raw.includes(",") && raw.includes(".")) raw = raw.lastIndexOf(",") > raw.lastIndexOf(".") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  else if (raw.includes(",")) raw = raw.replace(",", ".");
  const n = Number(raw);
  return Number.isFinite(n) ? Math.abs(n) : null;
}
function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S);
  }
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const tr = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  const date = tr ? new Date(Number(tr[3]), Number(tr[2]) - 1, Number(tr[1])) : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  if (!canManageFinance(user.role)) return NextResponse.json({ error: "Excel aktarımı için yetkiniz yok." }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  const branchId = String(form.get("branchId") || "");
  const accountId = String(form.get("accountId") || "");
  if (!(file instanceof File) || !branchId || !accountId) return NextResponse.json({ error: "Dosya, şube ve hesap seçilmelidir." }, { status: 400 });
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) return NextResponse.json({ error: "Yalnızca XLSX, XLS veya CSV dosyaları kabul edilir." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Dosya boyutu 10 MB sınırını aşamaz." }, { status: 400 });
  if (user.branchId && !["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role) && user.branchId !== branchId) return NextResponse.json({ error: "Bu şubeye erişim yetkiniz yok." }, { status: 403 });
  const account = await prisma.financialAccount.findFirst({ where: { id: accountId, branchId } });
  if (!account) return NextResponse.json({ error: "Seçilen hesap bu şubeye ait değil." }, { status: 400 });
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) return NextResponse.json({ error: "Dosyada okunabilir çalışma sayfası bulunamadı." }, { status: 400 });
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
    if (!rows.length) return NextResponse.json({ error: "Dosyada aktarılacak satır bulunamadı." }, { status: 400 });
    const batchId = randomUUID();
    const data: Array<{ branchId:string; accountId:string; createdById:string; type:"INCOME"|"EXPENSE"; transactionDate:Date; amount:number; description:string; documentNo?:string; source:string; importBatchId:string; importHash:string }> = [];
    const errors: Array<{ row:number; reason:string }> = [];
    rows.forEach((row, index) => {
      const values = new Map(Object.entries(row).map(([key, value]) => [normalized(key), value]));
      const pick = (...keys:string[]) => { for (const key of keys) { const v = values.get(key); if (v !== undefined && String(v).trim() !== "") return v; } return ""; };
      const date = parseDate(pick("tarih","islemtarihi","transactiondate","date"));
      const amount = parseAmount(pick("tutar","amount","islemtutari","borc","alacak"));
      const description = String(pick("aciklama","islemaciklamasi","description","detay")).trim();
      const typeRaw = normalized(pick("tur","islemturu","type","islem"));
      const type = ["gelir","income","alacak","giris","tahsilat"].includes(typeRaw) ? "INCOME" : ["gider","expense","borc","cikis","odeme"].includes(typeRaw) ? "EXPENSE" : null;
      const documentNo = String(pick("belgeno","belgenumarasi","fisno","documentno","referans")).trim();
      if (!date || !amount || !description || !type) {
        errors.push({ row: index + 2, reason: "Tarih, tutar, açıklama ve tür alanları zorunludur." });
        return;
      }
      const fingerprint = [branchId, accountId, date.toISOString(), amount.toFixed(2), type, description.toLocaleLowerCase("tr-TR"), documentNo].join("|");
      data.push({ branchId, accountId, createdById: user.id, type, transactionDate: date, amount, description, documentNo: documentNo || undefined, source: "EXCEL", importBatchId: batchId, importHash: createHash("sha256").update(fingerprint).digest("hex") });
    });
    if (!data.length) return NextResponse.json({ imported: 0, duplicates: 0, errors: errors.slice(0, 50) }, { status: 422 });
    const result = await prisma.financeTransaction.createMany({ data, skipDuplicates: true });
    const duplicates = data.length - result.count;
    await prisma.auditLog.create({ data: { userId: user.id, action: "EXCEL_IMPORT", entity: "FinanceTransaction", entityId: batchId, afterData: { fileName: file.name, processed: data.length, imported: result.count, duplicates, rejected: errors.length } } });
    return NextResponse.json({ batchId, imported: result.count, duplicates, rejected: errors.length, errors: errors.slice(0, 50) });
  } catch {
    return NextResponse.json({ error: "Excel dosyası okunamadı. Şablon başlıklarını kontrol edin." }, { status: 400 });
  }
}