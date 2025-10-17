import connect from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Destination from "@/models/destination";
import DestinationsSpecialties from "@/models/destinations-specialties";

export async function POST(req: NextRequest) {
  const { specialtyId } = await req.json();
  try {
    await connect();
    const destinationSpecialty = await DestinationsSpecialties.find({
      maDS: new mongoose.Types.ObjectId(specialtyId),
    });

    if (destinationSpecialty.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    console.log("Destination specialty:", destinationSpecialty);
    const destinationIds = destinationSpecialty.map(
      (destination) => destination.maDD,
    );

    const foundDestinations = await Destination.find({
      _id: { $in: destinationIds },
    });

    return NextResponse.json(foundDestinations, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new Response("Failed to create tour", { status: 500 });
  }
}
