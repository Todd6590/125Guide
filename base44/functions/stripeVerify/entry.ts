import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return Response.json({ error: "Missing session_id" }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return Response.json({ error: "Payment not completed" }, { status: 402 });
    }

    // Return a session object matching the SSO session shape for planform125_single
    return Response.json({
      success: true,
      session: {
        email: session.customer_email || session.customer_details?.email || "unknown",
        name: session.customer_details?.name || "",
        plan: "planform125_single",
        is_admin: false,
        authenticated_at: Date.now(),
        expires_at: Date.now() + (8 * 60 * 60 * 1000), // 8 hours
        stripe_session_id: session_id,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});