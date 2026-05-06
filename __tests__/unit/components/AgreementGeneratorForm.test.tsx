import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgreementGeneratorForm from '@/components/agreements/AgreementGeneratorForm';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
vi.mock('react-hot-toast');
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      _id: 'user123',
      email: 'test@example.com',
      role: 'tenant',
    },
  })),
}));
vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }: any) => children({ loading: false }),
}));
vi.mock('@/lib/agreementTemplate', () => ({
  AgreementPDF: () => null,
}));
vi.mock('./AgreementSignModal', () => ({
  default: () => <div>Sign Modal</div>,
}));

describe('AgreementGeneratorForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    test('should render all form fields', () => {
      render(<AgreementGeneratorForm />);

      expect(screen.getByPlaceholderText("Enter tenant's full name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter owner's full name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., 2BHK Apartment in Civil Lines')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter complete property address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter monthly rent amount')).toBeInTheDocument();
    });

    test('should render language selection options', () => {
      render(<AgreementGeneratorForm />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Hindi (हिंदी)')).toBeInTheDocument();
    });

    test('should have English selected by default', () => {
      render(<AgreementGeneratorForm />);

      const englishRadio = screen.getByLabelText('English') as HTMLInputElement;
      expect(englishRadio.checked).toBe(true);
    });
  });

  describe('Form Validation', () => {
    test('should show validation errors for empty required fields', async () => {
      render(<AgreementGeneratorForm />);
      const user = userEvent.setup();

      const submitButton = screen.getByText('Generate Agreement');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Tenant name is required')).toBeInTheDocument();
      });
    });

    test('should validate monthly rent is greater than 0', async () => {
      render(<AgreementGeneratorForm />);
      const user = userEvent.setup();

      const rentInput = screen.getByPlaceholderText('Enter monthly rent amount');
      await user.type(rentInput, '0');

      const submitButton = screen.getByText('Generate Agreement');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Monthly rent must be greater than 0')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('should submit form with valid data', async () => {
      const mockResponse = {
        data: {
          data: {
            agreement: {
              _id: 'agreement123',
              agreementText: 'Test agreement text',
              status: 'draft',
            },
          },
        },
      };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      render(<AgreementGeneratorForm />);
      const user = userEvent.setup();

      // Fill form
      await user.type(screen.getByPlaceholderText("Enter tenant's full name"), 'John Doe');
      await user.type(screen.getByPlaceholderText("Enter owner's full name"), 'Jane Smith');
      await user.type(screen.getByPlaceholderText('e.g., 2BHK Apartment in Civil Lines'), '2BHK Apartment');
      await user.type(screen.getByPlaceholderText('Enter complete property address'), '123 Test Street');
      await user.type(screen.getByPlaceholderText('Enter monthly rent amount'), '10000');

      const startDateInput = screen.getAllByRole('textbox')[4] as HTMLInputElement;
      const endDateInput = screen.getAllByRole('textbox')[5] as HTMLInputElement;
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

      const submitButton = screen.getByText('Generate Agreement');
      await user.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/agreements/generate', expect.objectContaining({
          tenantName: 'John Doe',
          ownerName: 'Jane Smith',
          propertyTitle: '2BHK Apartment',
          propertyAddress: '123 Test Street',
          monthlyRent: 10000,
        }));
      });
    });

    test('should show preview after successful generation', async () => {
      const mockResponse = {
        data: {
          data: {
            agreement: {
              _id: 'agreement123',
              agreementText: 'Test agreement text',
              status: 'draft',
            },
          },
        },
      };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      render(<AgreementGeneratorForm />);
      const user = userEvent.setup();

      // Fill and submit form
      await user.type(screen.getByPlaceholderText("Enter tenant's full name"), 'John Doe');
      await user.type(screen.getByPlaceholderText("Enter owner's full name"), 'Jane Smith');
      await user.type(screen.getByPlaceholderText('e.g., 2BHK Apartment in Civil Lines'), '2BHK Apartment');
      await user.type(screen.getByPlaceholderText('Enter complete property address'), '123 Test Street');
      await user.type(screen.getByPlaceholderText('Enter monthly rent amount'), '10000');

      const submitButton = screen.getByText('Generate Agreement');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Agreement Preview')).toBeInTheDocument();
        expect(screen.getByText('Test agreement text')).toBeInTheDocument();
      });
    });
  });

  describe('User Authentication', () => {
    test('should show login message when user is not authenticated', () => {
      const { useAuthStore } = require('@/store/authStore');
      useAuthStore.mockReturnValue({ user: null });

      render(<AgreementGeneratorForm />);

      expect(screen.getByText('Please log in to generate agreements')).toBeInTheDocument();
    });
  });
});
