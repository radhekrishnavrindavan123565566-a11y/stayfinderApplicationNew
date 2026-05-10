/**
 * Late Fee Calculator
 * Automatically calculates penalty for late rent payments
 */

export interface LateFeeConfig {
  gracePeriodDays: number; // Grace period before late fee applies
  flatFee?: number; // Fixed late fee amount
  percentageFee?: number; // Percentage of rent amount
  dailyFee?: number; // Daily penalty after grace period
  maxLateFee?: number; // Maximum late fee cap
}

export interface LateFeeResult {
  isLate: boolean;
  daysLate: number;
  lateFee: number;
  totalAmount: number;
  breakdown: {
    originalAmount: number;
    flatFee: number;
    percentageFee: number;
    dailyFee: number;
  };
}

const DEFAULT_CONFIG: LateFeeConfig = {
  gracePeriodDays: 3, // 3 days grace period
  flatFee: 100, // ₹100 flat fee
  percentageFee: 2, // 2% of rent
  dailyFee: 50, // ₹50 per day after grace period
  maxLateFee: 2000, // Maximum ₹2000 late fee
};

/**
 * Calculate late fee for a rent payment
 * @param dueDate - Original due date
 * @param paymentDate - Actual payment date (or current date if not paid)
 * @param rentAmount - Monthly rent amount
 * @param config - Late fee configuration (optional)
 * @returns Late fee calculation result
 */
export function calculateLateFee(
  dueDate: Date,
  paymentDate: Date = new Date(),
  rentAmount: number,
  config: Partial<LateFeeConfig> = {}
): LateFeeResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Calculate days late
  const dueDateMs = new Date(dueDate).setHours(0, 0, 0, 0);
  const paymentDateMs = new Date(paymentDate).setHours(0, 0, 0, 0);
  const daysLate = Math.max(0, Math.ceil((paymentDateMs - dueDateMs) / (1000 * 60 * 60 * 24)));
  
  // Check if within grace period
  if (daysLate <= finalConfig.gracePeriodDays) {
    return {
      isLate: false,
      daysLate,
      lateFee: 0,
      totalAmount: rentAmount,
      breakdown: {
        originalAmount: rentAmount,
        flatFee: 0,
        percentageFee: 0,
        dailyFee: 0,
      },
    };
  }
  
  // Calculate late fees
  const flatFee = finalConfig.flatFee || 0;
  const percentageFee = finalConfig.percentageFee 
    ? (rentAmount * finalConfig.percentageFee) / 100 
    : 0;
  
  // Daily fee applies after grace period
  const daysAfterGrace = daysLate - finalConfig.gracePeriodDays;
  const dailyFee = finalConfig.dailyFee 
    ? daysAfterGrace * finalConfig.dailyFee 
    : 0;
  
  // Total late fee (capped at max)
  let totalLateFee = flatFee + percentageFee + dailyFee;
  if (finalConfig.maxLateFee && totalLateFee > finalConfig.maxLateFee) {
    totalLateFee = finalConfig.maxLateFee;
  }
  
  return {
    isLate: true,
    daysLate,
    lateFee: Math.round(totalLateFee),
    totalAmount: Math.round(rentAmount + totalLateFee),
    breakdown: {
      originalAmount: rentAmount,
      flatFee: Math.round(flatFee),
      percentageFee: Math.round(percentageFee),
      dailyFee: Math.round(dailyFee),
    },
  };
}

/**
 * Get late fee message in English
 */
export function getLateFeeMessage(result: LateFeeResult): string {
  if (!result.isLate) {
    return "On-time payment - No penalty";
  }
  
  const { daysLate, lateFee, breakdown } = result;
  let message = `${daysLate} days late - Penalty: ₹${lateFee}\n`;
  
  if (breakdown.flatFee > 0) {
    message += `• Fixed Fee: ₹${breakdown.flatFee}\n`;
  }
  if (breakdown.percentageFee > 0) {
    message += `• Percentage Fee: ₹${breakdown.percentageFee}\n`;
  }
  if (breakdown.dailyFee > 0) {
    message += `• Daily Fee: ₹${breakdown.dailyFee}\n`;
  }
  
  return message.trim();
}

/**
 * Example usage:
 * 
 * const dueDate = new Date('2025-01-05');
 * const paymentDate = new Date('2025-01-15'); // 10 days late
 * const rentAmount = 10000;
 * 
 * const result = calculateLateFee(dueDate, paymentDate, rentAmount);
 * console.log(result);
 * // {
 * //   isLate: true,
 * //   daysLate: 10,
 * //   lateFee: 450, // ₹100 flat + ₹200 (2%) + ₹350 (7 days × ₹50)
 * //   totalAmount: 10450,
 * //   breakdown: { ... }
 * // }
 */
