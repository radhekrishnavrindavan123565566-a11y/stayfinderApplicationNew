import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Feature: ai-rental-features, Property 10: AISearchBar filter mapping

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

// Simulate the mapping logic from AISearchBar to Property_Store
function mapNLPFiltersToStore(nlpFilters: NLPFilters): Partial<PropertyStoreFilters> {
  const storeFilters: Partial<PropertyStoreFilters> = {};

  if (nlpFilters.city) {
    storeFilters.city = nlpFilters.city;
  }

  if (nlpFilters.maxPrice !== undefined) {
    storeFilters.maxPrice = String(nlpFilters.maxPrice);
  }

  if (nlpFilters.minPrice !== undefined) {
    storeFilters.minPrice = String(nlpFilters.minPrice);
  }

  if (nlpFilters.bedrooms !== undefined) {
    storeFilters.bedrooms = String(nlpFilters.bedrooms);
  }

  if (nlpFilters.propertyType) {
    storeFilters.propertyType = nlpFilters.propertyType;
  }

  if (nlpFilters.keywords) {
    storeFilters.search = nlpFilters.keywords;
  }

  if (nlpFilters.nearLocation) {
    storeFilters.nearLocation = nlpFilters.nearLocation;
  }

  return storeFilters;
}

describe('AISearchBar Filter Mapping', () => {
  test('P10: AISearchBar filter mapping', () => {
    fc.assert(
      fc.property(
        fc.record({
          city: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          minPrice: fc.option(fc.integer({ min: 1000, max: 50000 }), { nil: undefined }),
          maxPrice: fc.option(fc.integer({ min: 50000, max: 200000 }), { nil: undefined }),
          bedrooms: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
          propertyType: fc.option(
            fc.constantFrom('apartment' as const, 'house' as const, 'villa' as const, 'studio' as const, 'condo' as const, 'cabin' as const),
            { nil: undefined }
          ),
          amenities: fc.option(fc.array(fc.string()), { nil: undefined }),
          keywords: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          nearLocation: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        }),
        (nlpFilters: NLPFilters) => {
          const storeFilters = mapNLPFiltersToStore(nlpFilters);

          // Assert each field maps to the correct Property_Store key
          if (nlpFilters.city !== undefined) {
            expect(storeFilters.city).toBe(nlpFilters.city);
          }

          if (nlpFilters.maxPrice !== undefined) {
            expect(storeFilters.maxPrice).toBe(String(nlpFilters.maxPrice));
          }

          if (nlpFilters.minPrice !== undefined) {
            expect(storeFilters.minPrice).toBe(String(nlpFilters.minPrice));
          }

          if (nlpFilters.bedrooms !== undefined) {
            expect(storeFilters.bedrooms).toBe(String(nlpFilters.bedrooms));
          }

          if (nlpFilters.propertyType !== undefined) {
            expect(storeFilters.propertyType).toBe(nlpFilters.propertyType);
          }

          if (nlpFilters.keywords !== undefined) {
            expect(storeFilters.search).toBe(nlpFilters.keywords);
          }

          if (nlpFilters.nearLocation !== undefined) {
            expect(storeFilters.nearLocation).toBe(nlpFilters.nearLocation);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P10: All NLP filter fields map correctly', () => {
    const nlpFilters: NLPFilters = {
      city: 'Allahabad',
      maxPrice: 8000,
      minPrice: 5000,
      bedrooms: 2,
      propertyType: 'apartment',
      keywords: 'near university',
      nearLocation: 'Civil Lines',
    };

    const storeFilters = mapNLPFiltersToStore(nlpFilters);

    expect(storeFilters.city).toBe('Allahabad');
    expect(storeFilters.maxPrice).toBe('8000');
    expect(storeFilters.minPrice).toBe('5000');
    expect(storeFilters.bedrooms).toBe('2');
    expect(storeFilters.propertyType).toBe('apartment');
    expect(storeFilters.search).toBe('near university');
    expect(storeFilters.nearLocation).toBe('Civil Lines');
  });

  test('P10: Empty NLP filters produce empty store filters', () => {
    const nlpFilters: NLPFilters = {};
    const storeFilters = mapNLPFiltersToStore(nlpFilters);

    expect(Object.keys(storeFilters).length).toBe(0);
  });

  test('P10: Partial NLP filters map only present fields', () => {
    const nlpFilters: NLPFilters = {
      city: 'Mumbai',
      bedrooms: 3,
    };

    const storeFilters = mapNLPFiltersToStore(nlpFilters);

    expect(storeFilters.city).toBe('Mumbai');
    expect(storeFilters.bedrooms).toBe('3');
    expect(storeFilters.maxPrice).toBeUndefined();
    expect(storeFilters.minPrice).toBeUndefined();
    expect(storeFilters.propertyType).toBeUndefined();
    expect(storeFilters.search).toBeUndefined();
    expect(storeFilters.nearLocation).toBeUndefined();
  });

  test('P10: Number fields are converted to strings', () => {
    fc.assert(
      fc.property(
        fc.record({
          minPrice: fc.integer({ min: 1000, max: 100000 }),
          maxPrice: fc.integer({ min: 1000, max: 100000 }),
          bedrooms: fc.integer({ min: 1, max: 10 }),
        }),
        (nlpFilters) => {
          const storeFilters = mapNLPFiltersToStore(nlpFilters);

          expect(typeof storeFilters.minPrice).toBe('string');
          expect(typeof storeFilters.maxPrice).toBe('string');
          expect(typeof storeFilters.bedrooms).toBe('string');

          expect(storeFilters.minPrice).toBe(String(nlpFilters.minPrice));
          expect(storeFilters.maxPrice).toBe(String(nlpFilters.maxPrice));
          expect(storeFilters.bedrooms).toBe(String(nlpFilters.bedrooms));
        }
      ),
      { numRuns: 100 }
    );
  });
});
