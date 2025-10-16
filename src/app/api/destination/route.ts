import connect from "@/lib/mongodb";
import Destination from "@/models/destination";
import Tour from "@/models/tour";
import TourDes from "@/models/tour-des";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  await connect();
  const tour_id = String(body.ma_tour).trim();
  if (!tour_id || !mongoose.Types.ObjectId.isValid(tour_id))
    return new Response("Mã tour không hợp lệ", { status: 400 });

  const tour = await Tour.findById(body.ma_tour);
  if (!tour) return new Response("Tour không được tìm thấy", { status: 404 });

  const destination = await Destination.create(body);
  await TourDes.create({
    ma_tour: destination.ma_tour,
    ma_dia_diem: destination._id,
    diem_den: body.diem_den || false,
    diem_khoi_hanh: body.diem_khoi_hanh || false,
  });

  // Lưu body vào cơ sở dữ liệu ở đây
  return new Response("Thêm điểm đến thành công", { status: 201 });
}
