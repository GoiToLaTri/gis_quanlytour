import connect from "@/lib/mongodb";
import TourDes from "@/models/tour-des";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connect();
    const tour_des = await TourDes.findById(new mongoose.Types.ObjectId(id));
    console.log(tour_des);
    if (!tour_des)
      return new Response("Địa điểm không tồn tại", { status: 403 });
    await TourDes.findByIdAndDelete(tour_des._id);
    return new Response("Xóa địa điểm thành công", { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Lỗi hệ thống", { status: 500 });
  }
}
