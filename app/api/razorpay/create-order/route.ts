import { NextResponse } from "next/server";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

function credentials() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured.");
  }
  return { keyId, keySecret };
}

export async function POST(request: Request) {
  try {
    const { amount, receipt } = await request.json();
    const rupees = Number(amount);
    if (!Number.isFinite(rupees) || rupees < 1) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    const { keyId, keySecret } = credentials();
    const response = await fetch(RAZORPAY_ORDERS_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(rupees * 100),
        currency: "INR",
        receipt: receipt || `rasoigo-${Date.now()}`
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: payload.error?.description || "Unable to create Razorpay order." }, { status: response.status });
    }

    return NextResponse.json({
      id: payload.id,
      amount: payload.amount,
      currency: payload.currency,
      keyId
    });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to create Razorpay order." },
      { status: 500 }
    );
  }
}
