import { NextResponse } from "next/server";
import { vergiDaireleri } from "@/server/modules/referans/data";

export async function GET() {
  return NextResponse.json({
    status: "OK",
    data: [...vergiDaireleri].sort((a, b) => a.name.localeCompare(b.name, "tr-TR")),
  });
}
