import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // pour parser le formulaire

// Formulaire simple pour tester depuis le navigateur
app.get("/", (req, res) => {
  res.send(`
    <h1>Tester la caution Stripe</h1>
    <form method="POST" action="/caution">
      <input type="email" name="email" placeholder="Email" required />
      <input type="number" name="amount" placeholder="Montant en centimes" required />
      <button type="submit">Créer la caution</button>
    </form>
  `);
});

// Endpoint /caution
app.post("/caution", async (req, res) => {
  const { email, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      payment_intent_data: {
        capture_method: "manual", // clé pour bloquer sans débiter
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Caution" },
            unit_amount: parseInt(amount),
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    // Affiche le lien directement dans le navigateur
    res.send(`
      <h2>Caution créée !</h2>
      <p><a href="${session.url}" target="_blank">Clique ici pour payer la caution</a></p>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur : " + err.message);
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running...")
);
