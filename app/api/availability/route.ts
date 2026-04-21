import { NextRequest, NextResponse } from "next/server";
import { getAvailabilityForDate } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const serviceId = searchParams.get("serviceId");
  const barberId = searchParams.get("barberId");
  const date = searchParams.get("date");

  if (!slug || !serviceId || !barberId || !date) {
    return NextResponse.json({ message: "Parametros em falta." }, { status: 400 });
  }

  const availability = await getAvailabilityForDate(slug, serviceId, barberId, date);

  if (!availability) {
    return NextResponse.json({ message: "Disponibilidade indisponível." }, { status: 404 });
  }

  return NextResponse.json(availability);
}
