import { NextResponse } from "next/server";
import type { UserProfile } from "@/lib/types";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Admin password is not configured." }, { status: 500 });
  }

  if (String(email).trim().toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  const profile: UserProfile = {
    uid: "admin-local",
    fullName: "RasoiGo Admin",
    email: adminEmail,
    role: "admin",
    createdAt: new Date("2026-07-15").toISOString()
  };

  return NextResponse.json({ profile });
}
