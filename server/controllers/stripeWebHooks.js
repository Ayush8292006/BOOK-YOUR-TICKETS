import Stripe from "stripe";
import Booking from "../models/Booking.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebHooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  console.log("🔔 Webhook received!");
  console.log("📦 Body length:", req.body?.length);

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook verified. Event:", event.type);
  } catch (err) {
    console.log("❌ Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    
    console.log("💰 Payment completed for booking:", bookingId);
    
    if (bookingId) {
      const updated = await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentLink: "",
      }, { new: true });
      
      if (updated) {
        console.log("✅ Booking updated:", updated._id, "isPaid:", updated.isPaid);
      } else {
        console.log("❌ Booking not found:", bookingId);
      }
    } else {
      console.log("❌ No bookingId in metadata");
    }
  }

  res.json({ received: true });
};