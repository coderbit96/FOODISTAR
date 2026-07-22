import { NextResponse } from "next/server";
import { getFoodImageOptions } from "@/lib/food-images";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";
  const category = searchParams.get("category") || "";
  const urls = getFoodImageOptions(name, category);

  return NextResponse.json({
    imageUrl: urls[0],
    fallbackUrls: urls,
    name,
    category
  });
}
