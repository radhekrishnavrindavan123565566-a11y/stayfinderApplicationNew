/**
 * Nestora — Platform Pricing & Revenue Config
 * Aap yahan se saari fees ek jagah manage kar sakte ho
 */

export const PRICING = {
  // Booking commission (tenant se liya jata hai)
  BOOKING_COMMISSION_PCT: 0.10,        // 10% of monthly rent

  // Owner subscription plans (monthly)
  PLANS: {
    free: {
      name: "Free",
      price: 0,
      maxListings: 1,
      features: ["1 property listing", "Basic analytics", "In-app chat"],
    },
    basic: {
      name: "Basic",
      price: 299,
      maxListings: 3,
      features: ["3 property listings", "Priority support", "Verified badge", "Analytics"],
    },
    pro: {
      name: "Pro",
      price: 799,
      maxListings: 10,
      features: ["10 listings", "Featured placement", "AI price suggestions", "Bulk broadcast", "Dedicated support"],
    },
    enterprise: {
      name: "Enterprise",
      price: 1999,
      maxListings: 999,
      features: ["Unlimited listings", "All Pro features", "Custom branding", "API access"],
    },
  },

  // One-time fees
  AGREEMENT_FEE: 99,                   // Per rent agreement generated
  OWNER_VERIFICATION_FEE: 199,         // One-time Aadhaar verification badge
  BOOST_PRICE: 299,                    // 7-day featured listing boost

  // Service provider commission
  SERVICE_COMMISSION_PCT: 0.15,        // 15% of service job value

  // Referral reward
  REFERRAL_REWARD: 100,                // ₹100 wallet credit per successful referral
} as const;

export type PlanKey = keyof typeof PRICING.PLANS;
