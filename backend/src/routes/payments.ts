import { Router } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' });

const checkoutBody = z.object({
  priceId: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
  customerEmail: z.string().email().optional(),
});

router.post('/checkout', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = checkoutBody.parse(req.body);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    });
    res.json({ id: session.id, url: session.url });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? 'Checkout failed' });
  }
});

router.post('/webhook', (req, res) => {
  // Placeholder: configure raw body parsing and verify signature in production
  res.json({ received: true });
});

export default router;


