import { NextRequest, NextResponse } from 'next/server';
import Specialty from '@/models/specialty';
import connect from '@/lib/mongodb';
import DestinationsSpecialties from '@/models/destinations-specialties';

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await connect();

    const spct = await Specialty.findOne({ ten: body.ten });

    if (spct) {
      const desSpec = await DestinationsSpecialties.findOne({
        ma_dac_san: spct._id,
        ma_dia_diem: body.ma_dia_diem,
      });
      if (desSpec)
        return new NextResponse("Điểm đến đã tồn tại", { status: 403 });
      await DestinationsSpecialties.create({
        ma_dac_san: spct._id,
        ma_dia_diem: body.ma_dia_diem,
      });
    return new Response("Thêm đặc sản thành công", { status: 201 });
  }

    const newSpecialty = await Specialty.create({ten : body.ten });
    await DestinationsSpecialties.create({
      ma_dac_san: newSpecialty._id,
      ma_dia_diem: body.ma_dia_diem,
    });
    return new Response("Thêm đặc sản thành công", { status: 201 });
    // return new Response(JSON.stringify(newSpecialty), {status: 201});

  } catch (error: any) {
    console.log(error)
    return new Response("Lỗi không thể thêm đặc sản mới",{status: 500});
  }
}
export async function GET(req: Request) { 
  try { 
    await connect();
    const specialties = await Specialty.find({});
    return NextResponse.json(JSON.stringify(specialties));

    } catch (error: any) {
      console.log(error);
      return new Response ("Không thể tải danh sách đặc sản", {status: 500});
      
  }

} 