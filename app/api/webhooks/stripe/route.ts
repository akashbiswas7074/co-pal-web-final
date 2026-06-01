import { connectToDatabase } from "@/lib/database/connect";
import Order from "@/lib/database/models/order.model";
import { getStripe } from "@/lib/stripe";
import { getActiveWebsiteSettings } from "@/lib/database/actions/website.settings.actions";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ messsage: "Not Allowed" }, { status: 405 });
  }
  const body = await req.text();

  const signature = (await headers()).get("Stripe-Signature") as string;
  let event;

  try {
    const settingsResult = await getActiveWebsiteSettings();
    const settings = settingsResult?.success ? settingsResult.settings : null;
    const webhookSecret = settings?.stripeSecretWebhook || process.env.STRIPE_SECRET_WEBHOOK as string;
    
    const stripe = await getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: unknown) {
    return new Response("Webhook Error", { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (!session.metadata?.orderId) {
      return new Response(null, { status: 503 });
    }
    await connectToDatabase();
    const order = await Order.findById(session.metadata?.orderId);
    order.isPaid = true;
    order.paidAt = Date.now();
    await order.save();
  } else {
    console.log("unhandled event");
  }
  return new Response(null, { status: 200 });
}
