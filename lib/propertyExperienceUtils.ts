/**
 * Property Experience 360° - Utility Functions
 * Helper functions for property features implementation
 */

import { Property } from "@/store/propertyStore";

/**
 * Calculate room area percentage
 */
export const getRoomPercentage = (
  roomArea: number,
  totalArea: number
): number => {
  if (totalArea === 0) return 0;
  return Math.round((roomArea / totalArea) * 100);
};

/**
 * Convert square feet to square meters
 */
export const sqftToSqm = (sqft: number): number => {
  return Math.round(sqft / 10.764);
};

/**
 * Convert square meters to square feet
 */
export const sqmToSqft = (sqm: number): number => {
  return Math.round(sqm * 10.764);
};

/**
 * Calculate price per square meter
 */
export const getPricePerSqm = (price: number, area?: number): number => {
  if (!area || area === 0) return 0;
  return Math.round(price / area);
};

/**
 * Generate property score based on multiple factors
 * @returns Score from 0-100
 */
export const generatePropertyScore = (property: Property): number => {
  let score = 50; // Base score

  // Price factor (if below average, increase score)
  if (property.priceIntelligence?.percentageDiff) {
    const priceDiff = property.priceIntelligence.percentageDiff;
    if (priceDiff < -10) score += 15; // Well below average
    else if (priceDiff < 0) score += 10; // Below average
    else if (priceDiff > 10) score -= 10; // Above average
  }

  // Amenities factor
  const amenityBonus = Math.min(property.amenities?.length || 0, 20);
  score += Math.floor(amenityBonus / 2);

  // Rating factor
  if (property.averageRating) {
    score += Math.floor(property.averageRating * 5);
  }

  // Space factor
  if ((property as any).area && property.bedrooms) {
    const sqmPerBed = (property as any).area / property.bedrooms;
    if (sqmPerBed > 20) score += 10;
    else if (sqmPerBed > 15) score += 5;
  }

  // Location factor (would require neighborhood data)
  if (property.locationIntelligence?.safetyScore) {
    score += property.locationIntelligence.safetyScore / 10;
  }

  // Cap score at 100
  return Math.min(score, 100);
};

/**
 * Generate comparison report
 */
export const generateComparisonReport = (
  properties: Property[]
): {
  bestPrice: Property | null;
  bestRating: Property | null;
  bestSpace: Property | null;
  mostAmenities: Property | null;
} => {
  if (properties.length === 0) {
    return {
      bestPrice: null,
      bestRating: null,
      bestSpace: null,
      mostAmenities: null,
    };
  }

  return {
    bestPrice: properties.reduce((prev, current) =>
      current.price < prev.price ? current : prev
    ),
    bestRating: properties.reduce((prev, current) =>
      (current.averageRating || 0) > (prev.averageRating || 0)
        ? current
        : prev
    ),
    bestSpace: properties.reduce((prev, current) =>
      (current.area || 0) > (prev.area || 0) ? current : prev
    ),
    mostAmenities: properties.reduce((prev, current) =>
      (current.amenities?.length || 0) > (prev.amenities?.length || 0)
        ? current
        : prev
    ),
  };
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)}L`;
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(0)}k`;
  }
  return `₹${price}`;
};

/**
 * Calculate estimated commute (mock function - replace with real API)
 */
export const estimateCommuteTime = (
  distance: number,
  mode: "driving" | "transit" | "walking" | "cycling"
): number => {
  // Distance in km, returns minutes
  switch (mode) {
    case "driving":
      return Math.round(distance * 1.5); // ~1.5 min/km
    case "transit":
      return Math.round(distance * 2.5 + 5); // ~2.5 min/km + wait time
    case "walking":
      return Math.round(distance * 12); // ~12 min/km
    case "cycling":
      return Math.round(distance * 4); // ~4 min/km
    default:
      return 0;
  }
};

/**
 * Get room color coding for visualization
 */
export const getRoomColor = (
  roomName: string
): { bg: string; border: string } => {
  const lower = roomName.toLowerCase();

  if (lower.includes("bedroom"))
    return { bg: "from-blue-500", border: "border-blue-500" };
  if (lower.includes("kitchen"))
    return { bg: "from-green-500", border: "border-green-500" };
  if (lower.includes("living") || lower.includes("hall"))
    return { bg: "from-purple-500", border: "border-purple-500" };
  if (lower.includes("bathroom"))
    return { bg: "from-cyan-500", border: "border-cyan-500" };
  if (lower.includes("dining"))
    return { bg: "from-amber-500", border: "border-amber-500" };
  if (lower.includes("balcony"))
    return { bg: "from-green-600", border: "border-green-600" };

  return { bg: "from-zinc-500", border: "border-zinc-500" };
};

/**
 * Validate floor plan data
 */
export const validateFloorPlan = (
  imageUrl?: string,
  rooms?: Array<{ name: string; area: number; unit: string }>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!imageUrl) {
    errors.push("Floor plan image is required");
  }

  if (!rooms || rooms.length === 0) {
    errors.push("At least one room must be defined");
  }

  rooms?.forEach((room, idx) => {
    if (!room.name?.trim()) {
      errors.push(`Room ${idx + 1}: Name is required`);
    }
    if (room.area <= 0) {
      errors.push(`Room ${idx + 1}: Area must be greater than 0`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate walkability score based on amenities
 */
export const calculateWalkabilityScore = (amenities?: any[]): number => {
  if (!amenities || amenities.length === 0) return 0;

  let score = 0;
  const amenityDistance = amenities.reduce(
    (sum, a) => sum + (a.walkTimeMinutes || 0),
    0
  );
  const avgWalkTime = amenityDistance / amenities.length;

  // Lower walk time = higher walkability
  if (avgWalkTime < 5) score = 90;
  else if (avgWalkTime < 10) score = 75;
  else if (avgWalkTime < 15) score = 60;
  else if (avgWalkTime < 20) score = 45;
  else if (avgWalkTime < 30) score = 30;
  else score = 15;

  return score;
};

/**
 * Generate property highlights for quick view
 */
export const generatePropertyHighlights = (property: Property): string[] => {
  const highlights: string[] = [];

  if (property.priceIntelligence?.percentageDiff) {
    if (property.priceIntelligence.percentageDiff < -10) {
      highlights.push("Great Value");
    }
  }

  if (property.amenities?.length >= 15) {
    highlights.push("Well Equipped");
  }

  if (property.averageRating && property.averageRating >= 4.5) {
    highlights.push("Highly Rated");
  }

  if (property.area && property.bedrooms && property.area / property.bedrooms > 20) {
    highlights.push("Spacious");
  }

  if (property.weeklyBookings && property.weeklyBookings > 5) {
    highlights.push("Popular");
  }

  if (property.instantBooking) {
    highlights.push("Instant Book");
  }

  if (property.ownerVerified) {
    highlights.push("Verified");
  }

  return highlights;
};
