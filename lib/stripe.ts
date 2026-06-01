import Stripe from "stripe";
import { getActiveWebsiteSettings } from "@/lib/database/actions/website.settings.actions";

export const getStripe = async () => {
  const settingsResult = await getActiveWebsiteSettings();
  const settings = settingsResult?.success ? settingsResult.settings : null;
  const apiKey = settings?.stripeApiKey || process.env.STRIPE_API_KEY as string;

  return new Stripe(apiKey, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
};
