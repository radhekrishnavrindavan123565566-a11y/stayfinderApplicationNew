/**
 * Property Experience 360° Environment Configuration
 * Centralized configuration for property experience features
 */

// Feature Flags
export const FEATURES = {
  FLOOR_PLANS: process.env.ENABLE_FLOOR_PLANS === "true",
  PROPERTY_COMPARISON: process.env.ENABLE_PROPERTY_COMPARISON === "true",
  COMMUTE_ESTIMATOR: process.env.ENABLE_COMMUTE_ESTIMATOR === "true",
  NEIGHBORHOOD_MAP: process.env.ENABLE_NEIGHBORHOOD_MAP === "true",
  SMART_INSIGHTS: process.env.ENABLE_SMART_INSIGHTS === "true",
};

// API Keys
export const API_KEYS = {
  GOOGLE_MAPS: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  MAPBOX: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  COMMUTE_SERVICE: process.env.NEXT_PUBLIC_COMMUTE_API_KEY,
};

// File Upload Settings
export const UPLOAD_LIMITS = {
  FLOOR_PLAN_SIZE_MB: parseInt(process.env.MAX_FLOOR_PLAN_SIZE || "5", 10),
  VIDEO_SIZE_MB: parseInt(process.env.MAX_VIDEO_SIZE || "100", 10),
};

// Caching
export const CACHE = {
  COMMUTE_DURATION_DAYS: parseInt(process.env.COMMUTE_CACHE_DURATION || "7", 10),
};

// Performance Settings
export const LIMITS = {
  AMENITIES_PER_CATEGORY: parseInt(process.env.MAX_AMENITIES_PER_CATEGORY || "50", 10),
  COMPARISON_PROPERTIES: parseInt(process.env.MAX_COMPARISON_PROPERTIES || "5", 10),
  COMMUTE_DESTINATIONS: parseInt(process.env.MAX_COMMUTE_DESTINATIONS || "5", 10),
};

// Maps Configuration
export const MAPS_CONFIG = {
  ALLOWED_ORIGINS: (process.env.NEXT_PUBLIC_MAPS_ALLOWED_ORIGINS || "").split(","),
  SEARCH_RADIUS_KM: parseInt(process.env.AMENITY_SEARCH_RADIUS || "5", 10),
};

// Validation Functions
export const validateEnv = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required environment variables
  if (FEATURES.NEIGHBORHOOD_MAP && !API_KEYS.GOOGLE_MAPS) {
    errors.push(
      "Google Maps API key required for neighborhood map feature (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)"
    );
  }

  // Check file upload limits
  if (UPLOAD_LIMITS.FLOOR_PLAN_SIZE_MB <= 0) {
    errors.push("Floor plan size limit must be greater than 0");
  }

  if (UPLOAD_LIMITS.VIDEO_SIZE_MB <= 0) {
    errors.push("Video size limit must be greater than 0");
  }

  // Check comparison limits
  if (LIMITS.COMPARISON_PROPERTIES < 2 || LIMITS.COMPARISON_PROPERTIES > 10) {
    errors.push("Comparison properties limit should be between 2 and 10");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Helper function to get feature status
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

// Helper function to get API endpoint
export const getApiEndpoint = (endpoint: "COMMUTE_TIMES" | "NEIGHBORHOODS" | "AMENITIES"): string => {
  switch (endpoint) {
    case "COMMUTE_TIMES":
      return "/api/properties/commute-times";
    case "NEIGHBORHOODS":
      return "/api/properties/neighborhoods";
    case "AMENITIES":
      return "/api/properties/amenities";
    default:
      return "";
  }
};

// Helper to get Google Maps URL for embedding
export const getGoogleMapsEmbedUrl = (lat: number, lng: number, zoom = 15): string => {
  const apiKey = API_KEYS.GOOGLE_MAPS;
  if (!apiKey) {
    console.warn("Google Maps API key not configured");
    return "";
  }
  return `https://www.google.com/maps/embed/v1/place?q=${lat},${lng}&key=${apiKey}&zoom=${zoom}`;
};

// Export all configuration as a single object
export const PROPERTY_EXPERIENCE_CONFIG = {
  FEATURES,
  API_KEYS,
  UPLOAD_LIMITS,
  CACHE,
  LIMITS,
  MAPS_CONFIG,
  validateEnv,
  isFeatureEnabled,
  getApiEndpoint,
  getGoogleMapsEmbedUrl,
};

export default PROPERTY_EXPERIENCE_CONFIG;
