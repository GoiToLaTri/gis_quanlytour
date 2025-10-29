import connect from "@/lib/mongodb";
import Specialties from "@/models/specialty";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  try {
    await connect();
    const specialties = await Specialties.findOne({
      ten: { $regex: query, $options: "i" },
    });
    return NextResponse.json(specialties, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new Response("Failed to find specialty", { status: 500 });
  }
}
