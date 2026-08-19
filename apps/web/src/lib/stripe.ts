import Stripe from "stripe";
import { getStripeServerEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const { secretKey } = getStripeServerEnv();
  stripeClient = new Stripe(secretKey);

  return stripeClient;
}
