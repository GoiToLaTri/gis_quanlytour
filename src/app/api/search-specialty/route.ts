import connect from "@/lib/mongodb";
import Specialties from "@/models/specialty";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  try {
    await connect();
    const specialties = await Specialties.find({
      ten: { $regex: query, $options: "i" },
    });
    if (specialties.length > 0) console.log(specialties);
    return NextResponse.json(specialties, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return new Response("Failed to create tour", { status: 500 });
  }
}
