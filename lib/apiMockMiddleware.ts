// Mock middleware for development - returns mock data when database fails
import { mockStats, mockProperties, mockInquiries, mockUsers } from '@/lib/mockData';

export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallbackData: T,
  errorLogger?: (error: any) => void
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (errorLogger) {
      errorLogger(error);
    }
    console.warn('API call failed, using mock data:', error);
    return fallbackData;
  }
}

export const mockApiResponses = {
  stats: mockStats,
  properties: mockProperties,
  inquiries: mockInquiries,
  users: mockUsers,
};
