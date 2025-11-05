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

  const destination = await Destination.create({ ...body, ma_tour: undefined });
  await TourDes.create({
    ma_tour: body.ma_tour,
    ma_dia_diem: destination._id,
    diem_den: body.diem_den || false,
    diem_khoi_hanh: body.diem_khoi_hanh || false,
  });

  return new Response("Thêm điểm đến thành công", { status: 201 });
}

export async function GET(req: NextRequest) {
  await connect();
  const desInf = await TourDes.find({})
    .populate("ma_tour")
    .populate("ma_dia_diem");

  const destination = desInf
    .filter((item) => item.ma_dia_diem && item.ma_tour)
    .map((item) => ({
      _id: item.ma_dia_diem?._id,
      ten_tour: item.ma_tour?.ten,
      dia_chi: item.ma_dia_diem?.dia_chi,
      ten_dia_diem: item.ma_dia_diem?.ten,
      kinh_do: item.ma_dia_diem?.kinh_do,
      vi_do: item.ma_dia_diem?.vi_do,
    }));

  return NextResponse.json(destination, { status: 200 });
}
