import { NextResponse } from "next/server";

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
    const { paymentId, amount, orderId } = await request.json();
    const rupees = Number(amount);

    if (!paymentId) {
      return NextResponse.json({ error: "Missing Razorpay payment id." }, { status: 400 });
    }
    if (!Number.isFinite(rupees) || rupees < 1) {
      return NextResponse.json({ error: "Invalid refund amount." }, { status: 400 });
    }

    const { keyId, keySecret } = credentials();
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(rupees * 100),
        speed: "normal",
        notes: {
          orderId: orderId || "",
          app: "RasoiGo"
        }
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: payload.error?.description || "Unable to process Razorpay refund." }, { status: response.status });
    }

    return NextResponse.json({
      id: payload.id,
      status: payload.status,
      amount: payload.amount
    });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to process Razorpay refund." },
      { status: 500 }
    );
  }
}
