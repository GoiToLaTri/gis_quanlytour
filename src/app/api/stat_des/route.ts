import connect from "@/lib/mongodb";
import Destination from "@/models/destination";
import Tour from "@/models/tour";
import TourDes from "@/models/tour-des";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  await connect();
  const destination = await Destination.find({});
  return NextResponse.json(JSON.stringify(destination), { status: 200 });
}
