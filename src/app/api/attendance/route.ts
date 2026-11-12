import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
const schema=z.object({branchId:z.string().min(1),employeeId:z.string().min(1),workDate:z.string().datetime(),status:z.enum(["WORKED","OFF","ANNUAL_LEAVE","SICK_LEAVE","UNPAID_LEAVE","ABSENT","HALF_DAY"]),checkIn:z.string().datetime().optional(),checkOut:z.string().datetime().optional(),overtimeMin:z.number().int().min(0).max(1440).default(0),note:z.string().max(500).optional()});
const allowed=(role:string)=>["SUPER_ADMIN","GENERAL_MANAGER","HR","BRANCH_MANAGER"].includes(role);
export async function GET(request:NextRequest){
 const user=await getSessionUser();if(!user)return NextResponse.json({error:"Oturum gerekli."},{status:401});
 const branchId=request.nextUrl.searchParams.get("branchId");const month=request.nextUrl.searchParams.get("month");
 const where:any={};if(user.branchId&&!["SUPER_ADMIN","GENERAL_MANAGER","HR"].includes(user.role))where.branchId=user.branchId;else if(branchId)where.branchId=branchId;
 if(month&&/^\d{4}-\d{2}$/.test(month)){const [year,m]=month.split("-").map(Number);where.workDate={gte:new Date(year,m-1,1),lt:new Date(year,m,1)};}
 const rows=await prisma.attendance.findMany({where,include:{employee:{select:{firstName:true,lastName:true,employeeNo:true}}},orderBy:[{workDate:"desc"},{employee:{lastName:"asc"}}],take:2000});
 return NextResponse.json({attendance:rows});
}
export async function POST(request:NextRequest){
 const user=await getSessionUser();if(!user||!allowed(user.role))return NextResponse.json({error:"Puantaj kaydı yetkiniz yok."},{status:403});
 const input=schema.safeParse(await request.json());if(!input.success)return NextResponse.json({error:"Puantaj bilgilerini kontrol edin."},{status:400});
 if(user.branchId&&!["SUPER_ADMIN","GENERAL_MANAGER","HR"].includes(user.role)&&input.data.branchId!==user.branchId)return NextResponse.json({error:"Bu şubeye puantaj giremezsiniz."},{status:403});
 const employee=await prisma.employee.findFirst({where:{id:input.data.employeeId,branchId:input.data.branchId}});
 if(!employee)return NextResponse.json({error:"Personel bu şubede bulunamadı."},{status:404});
 const row=await prisma.attendance.upsert({where:{employeeId_workDate:{employeeId:input.data.employeeId,workDate:new Date(input.data.workDate)}},update:{status:input.data.status,checkIn:input.data.checkIn?new Date(input.data.checkIn):null,checkOut:input.data.checkOut?new Date(input.data.checkOut):null,overtimeMin:input.data.overtimeMin,note:input.data.note},create:{...input.data,workDate:new Date(input.data.workDate),checkIn:input.data.checkIn?new Date(input.data.checkIn):undefined,checkOut:input.data.checkOut?new Date(input.data.checkOut):undefined}});
 return NextResponse.json({attendance:row},{status:201});
}