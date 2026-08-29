import Stripe from 'stripe';

// Present but dormant: nothing in the checkout flow calls this yet.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default stripe;
