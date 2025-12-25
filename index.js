import express from "express";
import Stripe from "stripe";

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/caution", async (req, res) => {
  try {
    const { email, amount } = req.body;

    const customer = await stripe.customers.create({ email });

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customer.id,
      capture_method: "manual",
      payment_method_types: ["card"]
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customer.id,
      payment_intent: intent.id,
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel"
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000);
