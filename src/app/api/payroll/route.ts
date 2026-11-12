import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
const schema=z.object({branchId:z.string().min(1),year:z.number().int().min(2020).max(2100),month:z.number().int().min(1).max(12),employeeId:z.string().min(1),baseGross:z.number().nonnegative(),overtimePay:z.number().nonnegative().default(0),bonus:z.number().nonnegative().default(0),deductions:z.number().nonnegative().default(0),netPay:z.number().nonnegative(),employerCost:z.number().nonnegative(),paidAt:z.string().datetime().optional(),notes:z.string().max(1000).optional()});
const canManage=(role:string)=>["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING","HR"].includes(role);
export async function GET(request:NextRequest){
 const user=await getSessionUser();if(!user)return NextResponse.json({error:"Oturum gerekli."},{status:401});
 const branchId=request.nextUrl.searchParams.get("branchId");const year=Number(request.nextUrl.searchParams.get("year"));const month=Number(request.nextUrl.searchParams.get("month"));
 const where:any={};if(user.branchId&&!["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING","HR"].includes(user.role))where.branchId=user.branchId;else if(branchId)where.branchId=branchId;
 if(Number.isInteger(year)&&year>0)where.year=year;if(Number.isInteger(month)&&month>=1&&month<=12)where.month=month;
 const periods=await prisma.payrollPeriod.findMany({where,include:{branch:{select:{name:true,code:true}},records:{include:{employee:{select:{firstName:true,lastName:true,employeeNo:true}}}}},orderBy:[{year:"desc"},{month:"desc"}]});
 return NextResponse.json({periods});
}
export async function POST(request:NextRequest){
 const user=await getSessionUser();if(!user||!canManage(user.role))return NextResponse.json({error:"Bordro kaydı yetkiniz yok."},{status:403});
 const input=schema.safeParse(await request.json());if(!input.success)return NextResponse.json({error:"Bordro bilgilerini kontrol edin."},{status:400});
 if(user.branchId&&!["SUPER_ADMIN","GENERAL_MANAGER","ACCOUNTING","HR"].includes(user.role)&&input.data.branchId!==user.branchId)return NextResponse.json({error:"Bu şube için bordro giremezsiniz."},{status:403});
 const employee=await prisma.employee.findFirst({where:{id:input.data.employeeId,branchId:input.data.branchId}});
 if(!employee)return NextResponse.json({error:"Personel bu şubede bulunamadı."},{status:404});
 const period=await prisma.payrollPeriod.upsert({where:{branchId_year_month:{branchId:input.data.branchId,year:input.data.year,month:input.data.month}},update:{},create:{branchId:input.data.branchId,year:input.data.year,month:input.data.month}});
 const record=await prisma.payrollRecord.upsert({where:{periodId_employeeId:{periodId:period.id,employeeId:employee.id}},update:{baseGross:input.data.baseGross,overtimePay:input.data.overtimePay,bonus:input.data.bonus,deductions:input.data.deductions,netPay:input.data.netPay,employerCost:input.data.employerCost,paidAt:input.data.paidAt?new Date(input.data.paidAt):null,notes:input.data.notes},create:{periodId:period.id,employeeId:employee.id,baseGross:input.data.baseGross,overtimePay:input.data.overtimePay,bonus:input.data.bonus,deductions:input.data.deductions,netPay:input.data.netPay,employerCost:input.data.employerCost,paidAt:input.data.paidAt?new Date(input.data.paidAt):null,notes:input.data.notes}});
 const records=await prisma.payrollRecord.findMany({where:{periodId:period.id}});
 await prisma.payrollPeriod.update({where:{id:period.id},data:{totalGross:records.reduce((s,r)=>s+Number(r.baseGross)+Number(r.overtimePay)+Number(r.bonus),0),totalNet:records.reduce((s,r)=>s+Number(r.netPay),0),totalEmployerCost:records.reduce((s,r)=>s+Number(r.employerCost),0)}});
 await prisma.auditLog.create({data:{userId:user.id,action:"UPSERT",entity:"PayrollRecord",entityId:record.id,afterData:{periodId:period.id,employeeId:employee.id,netPay:record.netPay.toString()}}});
 return NextResponse.json({periodId:period.id,record},{status:201});
}