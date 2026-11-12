import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
const schema = z.object({ branchId:z.string().min(1), name:z.string().min(2).max(100), type:z.enum(["BANK","CASH","POS","OTHER"]), openingBalance:z.number().min(-999999999).max(999999999).default(0), bankName:z.string().max(100).optional(), iban:z.string().max(34).optional() });
export async function GET() {
 const user=await getSessionUser();
 if(!user) return NextResponse.json({error:"Oturum gerekli."},{status:401});
 const where=user.branchId&&!["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role)?{branchId:user.branchId,isActive:true}:{isActive:true};
 const accounts=await prisma.financialAccount.findMany({where,include:{branch:{select:{name:true,code:true}}},orderBy:[{branch:{code:"asc"}},{type:"asc"},{name:"asc"}]});
 return NextResponse.json({accounts});
}
export async function POST(request:NextRequest) {
 const user=await getSessionUser();
 if(!user||!["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role)) return NextResponse.json({error:"Hesap oluşturma yetkiniz yok."},{status:403});
 const input=schema.safeParse(await request.json());
 if(!input.success) return NextResponse.json({error:"Hesap bilgilerini kontrol edin."},{status:400});
 const branch=await prisma.branch.findUnique({where:{id:input.data.branchId}});
 if(!branch) return NextResponse.json({error:"Şube bulunamadı."},{status:404});
 const account=await prisma.financialAccount.create({data:input.data});
 await prisma.auditLog.create({data:{userId:user.id,action:"CREATE",entity:"FinancialAccount",entityId:account.id,afterData:{name:account.name,type:account.type,branchId:account.branchId}}});
 return NextResponse.json({account},{status:201});
}