import connect from "@/lib/mongodb";
import Tour from "@/models/tour";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await context.params;

    const tour = await Tour.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        // B1: Join sang bảng phụ tourdes
        $lookup: {
          from: "tourdes", // tên collection bảng phụ
          localField: "_id", // _id của Tour
          foreignField: "ma_tour", // field trong bảng phụ
          as: "tour_dest_links",
        },
      },
      {
        // B2: Join tiếp sang bảng destination dựa theo ma_dia_diem
        $lookup: {
          from: "destinations",
          localField: "tour_dest_links.ma_dia_diem",
          foreignField: "_id",
          as: "destinations",
        },
      },
      {
        // (tuỳ chọn) loại bỏ field trung gian nếu muốn
        $project: {
          ten: 1,
          gia_nguoi_lon: 1,
          gia_tre_em: 1,
          so_ngay: 1,
          tour_dest_links: 1, // giữ lại để biết đâu là điểm khởi hành, đâu là điểm đến
          destinations: 1,
        },
      },
    ]);

    if (!tour.length) {
      return NextResponse.json(
        { message: "Không tìm thấy tour" },
        { status: 404 }
      );
    }

    return NextResponse.json(tour[0], { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Lỗi server", error }, { status: 500 });
  }
}
