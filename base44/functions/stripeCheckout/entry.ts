import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const { email } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PlanForm 125 — Single Plan Document",
              description: "One-time purchase: create and download one Section 125 plan document.",
            },
            unit_amount: 1999, // $19.99
          },
          quantity: 1,
        },
      ],
      success_url: "https://planform125.brokertoolbox.net/sso-login?payment=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://planform125.brokertoolbox.net/sso-login?payment=cancelled",
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});