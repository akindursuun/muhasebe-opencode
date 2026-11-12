import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
const schema=z.object({branchId:z.string().min(1),employeeNo:z.string().max(40).optional(),firstName:z.string().min(1).max(80),lastName:z.string().min(1).max(80),email:z.string().email().optional().or(z.literal("")),phone:z.string().max(30).optional(),department:z.string().max(100).optional(),position:z.string().max(100).optional(),startDate:z.string().datetime(),monthlyGross:z.number().nonnegative().optional(),monthlyNet:z.number().nonnegative().optional()});
const canManage=(role:string)=>["SUPER_ADMIN","GENERAL_MANAGER","HR","BRANCH_MANAGER"].includes(role);
export async function GET(request:NextRequest){
 const user=await getSessionUser(); if(!user)return NextResponse.json({error:"Oturum gerekli."},{status:401});
 const branchId=request.nextUrl.searchParams.get("branchId");
 const where:any={status:"ACTIVE"};
 if(user.branchId&&!["SUPER_ADMIN","GENERAL_MANAGER","HR","ACCOUNTING"].includes(user.role))where.branchId=user.branchId; else if(branchId)where.branchId=branchId;
 const employees=await prisma.employee.findMany({where,select:{id:true,branchId:true,employeeNo:true,firstName:true,lastName:true,department:true,position:true,startDate:true,status:true,monthlyGross:true,monthlyNet:true,branch:{select:{name:true,code:true}}},orderBy:[{branch:{code:"asc"}},{lastName:"asc"}]});
 return NextResponse.json({employees});
}
export async function POST(request:NextRequest){
 const user=await getSessionUser(); if(!user||!canManage(user.role))return NextResponse.json({error:"Personel kaydı oluşturma yetkiniz yok."},{status:403});
 const input=schema.safeParse(await request.json()); if(!input.success)return NextResponse.json({error:"Personel bilgilerini kontrol edin."},{status:400});
 if(user.branchId&&!["SUPER_ADMIN","GENERAL_MANAGER","HR"].includes(user.role)&&input.data.branchId!==user.branchId)return NextResponse.json({error:"Bu şubeye personel ekleyemezsiniz."},{status:403});
 const employee=await prisma.employee.create({data:{...input.data,startDate:new Date(input.data.startDate),email:input.data.email||null}});
 await prisma.auditLog.create({data:{userId:user.id,action:"CREATE",entity:"Employee",entityId:employee.id,afterData:{branchId:employee.branchId,employeeNo:employee.employeeNo}}});
 return NextResponse.json({employee:{id:employee.id,firstName:employee.firstName,lastName:employee.lastName,branchId:employee.branchId}},{status:201});
}