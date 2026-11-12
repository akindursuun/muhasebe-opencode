import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
const schema=z.object({branchId:z.string().min(1),name:z.string().min(2).max(100),type:z.enum(["INCOME","EXPENSE"])});
export async function GET() {
 const user=await getSessionUser();
 if(!user) return NextResponse.json({error:"Oturum gerekli."},{status:401});
 const where=user.branchId&&!["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role)?{OR:[{branchId:user.branchId},{branchId:null}],isActive:true}:{isActive:true};
 const categories=await prisma.category.findMany({where,orderBy:[{type:"asc"},{name:"asc"}]});
 return NextResponse.json({categories});
}
export async function POST(request:NextRequest) {
 const user=await getSessionUser();
 if(!user||!["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING"].includes(user.role)) return NextResponse.json({error:"Kategori oluşturma yetkiniz yok."},{status:403});
 const input=schema.safeParse(await request.json());
 if(!input.success) return NextResponse.json({error:"Kategori bilgilerini kontrol edin."},{status:400});
 const category=await prisma.category.create({data:input.data});
 return NextResponse.json({category},{status:201});
}