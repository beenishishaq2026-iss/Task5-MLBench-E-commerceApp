import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Add it in your environment variables ' +
          '(e.g. Vercel -> Project Settings -> Environment Variables) and redeploy.'
      );
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});

export default stripe;