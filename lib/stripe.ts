import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore - Ignore the exact strict string match warning from typescript
  apiVersion: '2023-10-16', 
  typescript: true,
})
