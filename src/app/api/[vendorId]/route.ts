import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { vendorId: string } }) {
  const points = [
    { lat: -25.296, lng: -57.635 },
    { lat: -25.299, lng: -57.622 },
    { lat: -25.303, lng: -57.610 },
  ];
  return NextResponse.json({ vendorId: params.vendorId, points });
}