import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Feature: ai-rental-features, Property 9: NLP_Filters schema compatibility

interface NLPFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: 'apartment' | 'house' | 'villa' | 'studio' | 'condo' | 'cabin';
  amenities?: string[];
  keywords?: string;
  nearLocation?: string;
}

interface PropertyStoreFilters {
  search: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  bedrooms: string;
  nearLocation: string;
}

// Valid Filters interface fields
const VALID_FILTER_KEYS = ['city', 'minPrice', 'maxPrice', 'bedrooms', 'propertyType', 'keywords', 'search', 'nearLocation', 'amenities'];

// Simulate GPT parsing with INR and BHK support
function parseNLPQuery(query: string): NLPFilters {
  const filters: NLPFilters = {};

  // Parse INR prices
  const priceMatch = query.match(/₹(\d+)|(\d+)\s*(?:thousand|k)/i);
  if (priceMatch) {
    const amount = priceMatch[1] ? parseInt(priceMatch[1]) : parseInt(priceMatch[2]) * 1000;
    filters.maxPrice = amount;
  }

  // Parse BHK
  const bhkMatch = query.match(/(\d+)\s*BHK/i);
  if (bhkMatch) {
    filters.bedrooms = parseInt(bhkMatch[1]);
  }

  // Parse city
  const cityMatch = query.match(/(?:in|near)\s+([A-Za-z]+)/i);
  if (cityMatch) {
    filters.city = cityMatch[1];
  }

  // Parse property type
  const typeMatch = query.match(/\b(apartment|house|villa|studio|condo|cabin)\b/i);
  if (typeMatch) {
    filters.propertyType = typeMatch[1].toLowerCase() as any;
  }

  return filters;
}

describe('AI Search', () => {
  test('P9: NLP_Filters schema compatibility', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (query: string) => {
          const filters = parseNLPQuery(query);

          // Assert returned filters keys are all valid Filters interface fields
          Object.keys(filters).forEach(key => {
            expect(VALID_FILTER_KEYS).toContain(key);
          });

          // If price is present, it should be a number
          if (filters.maxPrice !== undefined) {
            expect(typeof filters.maxPrice).toBe('number');
            expect(filters.maxPrice).toBeGreaterThanOrEqual(0);
          }

          if (filters.minPrice !== undefined) {
            expect(typeof filters.minPrice).toBe('number');
            expect(filters.minPrice).toBeGreaterThanOrEqual(0);
          }

          // If bedrooms is present, it should be an integer
          if (filters.bedrooms !== undefined) {
            expect(typeof filters.bedrooms).toBe('number');
            expect(Number.isInteger(filters.bedrooms)).toBe(true);
            expect(filters.bedrooms).toBeGreaterThan(0);
          }

          // If propertyType is present, it should be a valid type
          if (filters.propertyType !== undefined) {
            expect(['apartment', 'house', 'villa', 'studio', 'condo', 'cabin']).toContain(filters.propertyType);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P9: INR price parsing', () => {
    const testCases = [
      { query: '2BHK under ₹8000', expected: 8000 },
      { query: 'apartment for 10 thousand', expected: 10000 },
      { query: 'house under 15k', expected: 15000 },
      { query: 'flat ₹12000 per month', expected: 12000 },
    ];

    testCases.forEach(({ query, expected }) => {
      const filters = parseNLPQuery(query);
      expect(filters.maxPrice).toBe(expected);
    });
  });

  test('P9: BHK parsing', () => {
    const testCases = [
      { query: '2BHK apartment', expected: 2 },
      { query: '3 BHK house', expected: 3 },
      { query: '1BHK near college', expected: 1 },
      { query: '4BHK villa', expected: 4 },
    ];

    testCases.forEach(({ query, expected }) => {
      const filters = parseNLPQuery(query);
      expect(filters.bedrooms).toBe(expected);
    });
  });
});
