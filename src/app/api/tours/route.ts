import connect from "@/lib/mongodb";
import TourSchema from "@/models/tour";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connect();
    const tours = await TourSchema.find();
    return new Response(JSON.stringify(tours), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to fetch tours", { status: 500 });
  }
}
