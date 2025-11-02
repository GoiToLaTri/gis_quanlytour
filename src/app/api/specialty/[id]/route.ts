import connect from "@/lib/mongodb";
import DestinationsSpecialties from "@/models/destinations-specialties";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await connect();
    const des_spec = await DestinationsSpecialties.findById(new mongoose.Types.ObjectId(id));
    if (!des_spec)
      return new Response("Đặc sản không tồn tại", { status: 403 });
    await DestinationsSpecialties.findByIdAndDelete(des_spec._id);
    return new Response("Xóa đặc sản thành công", { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Lỗi hệ thống", { status: 500 });
  }
}