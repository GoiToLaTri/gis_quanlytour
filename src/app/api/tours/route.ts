import connect from "@/lib/mongodb";
import Tour from "@/models/tour";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    console.log("Search query:", q);

    await connect();
    const tours = await Tour.find({
      $or: [{ ten: { $regex: q, $options: "i" } }],
    });
    return new Response(JSON.stringify(tours), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to fetch tours", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connect();
    console.log(body);
    const newTour = new Tour(body);
    await newTour.save();
    return new Response(JSON.stringify(newTour), { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to create tour", { status: 500 });
  }
}
