import connect from "@/lib/mongodb";
import TourSchema from "@/models/tour";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { ten, gia_nguoi_lon, gia_tre_em, so_ngay } = await req.json();
  try {
    await connect();
    const newTour = await TourSchema.create({
      ten,
      gia_nguoi_lon,
      gia_tre_em,
      so_ngay,
    });
    return new Response(JSON.stringify(newTour), { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return new Response("Failed to create tour", { status: 500 });
  }
}
