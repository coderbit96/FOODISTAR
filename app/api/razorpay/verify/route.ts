import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    } = await request.json();
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay secret is not configured." }, { status: 500 });
    }
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing Razorpay payment details." }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature.length !== String(signature).length) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const verified = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(String(signature))
    );

    if (!verified) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: "Unable to verify Razorpay payment." }, { status: 500 });
  }
}
