import connect from "@/lib/mongodb";
import Destination from "@/models/destination";
import Tour from "@/models/tour";
import TourDes from "@/models/tour-des";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  await connect();
  const tour_id = String(body.ma_tour).trim();
  if (!tour_id || !mongoose.Types.ObjectId.isValid(tour_id))
    return new Response("Mã tour không hợp lệ", { status: 400 });

  const tour = await Tour.findById(body.ma_tour);
  if (!tour) return new Response("Tour không được tìm thấy", { status: 404 });

  const des = await Destination.findOne({ ten: body.ten });

  if (des) {
    const tourDes = await TourDes.findOne({
      ma_tour: body.ma_tour,
      ma_dia_diem: des._id,
    });
    if (tourDes)
      return new NextResponse("Điểm đến đã tồn tại", { status: 403 });
    await TourDes.create({
      ma_tour: body.ma_tour,
      ma_dia_diem: des._id,
      diem_den: body.diem_den || false,
      diem_khoi_hanh: body.diem_khoi_hanh || false,
    });
    return new Response("Thêm điểm đến thành công", { status: 201 });
  }

  const destination = await Destination.create(body);
  await TourDes.create({
    ma_tour: destination.ma_tour,
    ma_dia_diem: destination._id,
    diem_den: body.diem_den || false,
    diem_khoi_hanh: body.diem_khoi_hanh || false,
  });

  return new Response("Thêm điểm đến thành công", { status: 201 });
}
