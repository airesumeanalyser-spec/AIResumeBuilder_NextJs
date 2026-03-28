import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RZP_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RZP_KEY_SECRET || "";

const IS_TEST_MODE =
  !RAZORPAY_KEY_ID ||
  !RAZORPAY_KEY_SECRET ||
  RAZORPAY_KEY_ID.startsWith("rzp_test_") ||
  RAZORPAY_KEY_SECRET.startsWith("test_");

let razorpay: InstanceType<typeof Razorpay> | null = null;
if (!IS_TEST_MODE) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

function validateAmount(amount: number): boolean {
  return amount >= 100 && amount <= 5_000_000;
}

function verifySignature(
  order_id: string,
  payment_id: string,
  signature: string,
  secret: string
): boolean {
  const data = `${order_id}|${payment_id}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
  return expected === signature;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") || "create-order";
  const body = await request.json().catch(() => ({}));

  try {
    if (action === "create-order") {
      const {
        amount,
        currency = "INR",
        description,
        notes,
        customer_notify,
      } = body as {
        amount: number;
        currency?: string;
        description?: string;
        notes?: Record<string, string>;
        customer_notify?: number;
      };

      if (!amount || typeof amount !== "number") {
        return NextResponse.json(
          { error: "Amount is required and must be a number" },
          { status: 400 }
        );
      }
      if (!validateAmount(amount)) {
        return NextResponse.json(
          { error: "Amount must be between ₹1 and ₹50,000" },
          { status: 400 }
        );
      }
      if (!["INR", "USD", "EUR"].includes(currency)) {
        return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
      }

      if (IS_TEST_MODE) {
        const mockOrderId = `order_test_${Date.now()}`;
        return NextResponse.json({
          success: true,
          order: {
            id: mockOrderId,
            entity: "order",
            amount,
            amount_paid: 0,
            amount_due: amount,
            currency,
            receipt: `rcpt_${Date.now()}`,
            offer_id: null,
            status: "created",
            attempts: 0,
            notes: notes || {},
            created_at: Math.floor(Date.now() / 1000),
          },
        });
      }

      const orderData = {
        amount,
        currency,
        ...(description && { description }),
        ...(notes && { notes }),
        ...(customer_notify !== undefined && { customer_notify }),
      };
      const order = await razorpay!.orders.create(orderData);
      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          entity: order.entity,
          amount: order.amount,
          amount_paid: order.amount_paid,
          amount_due: order.amount_due,
          currency: order.currency,
          receipt: order.receipt,
          offer_id: order.offer_id,
          status: order.status,
          attempts: order.attempts,
          notes: order.notes,
          created_at: order.created_at,
        },
      });
    }

    if (action === "verify-payment") {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = body as {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      };

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
      }

      if (IS_TEST_MODE) {
        return NextResponse.json({
          success: true,
          message: "Payment verified successfully (TEST MODE)",
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
        });
      }

      const ok = verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        RAZORPAY_KEY_SECRET
      );
      if (!ok) {
        return NextResponse.json(
          { success: false, error: "Payment verification failed" },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("payments:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
