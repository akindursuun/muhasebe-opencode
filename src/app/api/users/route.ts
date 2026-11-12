import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
const schema=z.object({name:z.string().min(2).max(100),email:z.string().email().max(254),password:z.string().min(12).max(200),role:z.enum(["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING","HR","BRANCH_MANAGER","VIEWER"]),branchId:z.string().nullable().optional()});
export async function GET(){
 const user=await getSessionUser();
 if(!user||!["SUPER_ADMIN","GENERAL_MANAGER"].includes(user.role)) return NextResponse.json({error:"Kullanıcı listesi için yetkiniz yok."},{status:403});
 const users=await prisma.user.findMany({select:{id:true,name:true,email:true,role:true,isActive:true,branchId:true,branch:{select:{name:true,code:true}},createdAt:true},orderBy:{name:"asc"}});
 return NextResponse.json({users});
}
export async function POST(request:NextRequest){
 const user=await getSessionUser();
 if(!user||!["SUPER_ADMIN","GENERAL_MANAGER"].includes(user.role)) return NextResponse.json({error:"Kullanıcı oluşturma yetkiniz yok."},{status:403});
 const input=schema.safeParse(await request.json());
 if(!input.success) return NextResponse.json({error:"Kullanıcı bilgilerini kontrol edin. Şifre en az 12 karakter olmalıdır."},{status:400});
 if(input.data.role==="SUPER_ADMIN"&&user.role!=="SUPER_ADMIN") return NextResponse.json({error:"Süper yönetici hesabını yalnızca süper yönetici oluşturabilir."},{status:403});
 if(input.data.branchId&&!await prisma.branch.findUnique({where:{id:input.data.branchId}})) return NextResponse.json({error:"Şube bulunamadı."},{status:404});
 const passwordHash=await bcrypt.hash(input.data.password,12);
 try{
  const created=await prisma.user.create({data:{name:input.data.name,email:input.data.email.trim().toLowerCase(),passwordHash,role:input.data.role,branchId:input.data.branchId||null},select:{id:true,name:true,email:true,role:true,branchId:true,isActive:true}});
  await prisma.auditLog.create({data:{userId:user.id,action:"CREATE",entity:"User",entityId:created.id,afterData:{email:created.email,role:created.role,branchId:created.branchId}}});
  return NextResponse.json({user:created},{status:201});
 }catch{return NextResponse.json({error:"Bu e-posta adresi zaten kayıtlı olabilir."},{status:409});}
}