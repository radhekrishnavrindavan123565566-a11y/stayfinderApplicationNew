import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgreementSignModal from '@/components/agreements/AgreementSignModal';
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

describe('AgreementSignModal Component', () => {
  const mockOnSigned = vi.fn();
  const mockOnClose = vi.fn();
  const agreementId = 'agreement123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    test('should render modal with OTP step initially', () => {
      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Sign Agreement')).toBeInTheDocument();
      expect(screen.getByText('Verify your identity')).toBeInTheDocument();
      expect(screen.getByText('Send OTP')).toBeInTheDocument();
    });

    test('should show masked email', () => {
      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/te\*\*\*@example.com/)).toBeInTheDocument();
    });

    test('should close modal when X button is clicked', async () => {
      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      const closeButton = screen.getByRole('button', { name: '' });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('OTP Flow', () => {
    test('should send OTP when Send OTP button is clicked', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      const sendButton = screen.getByText('Send OTP');
      await user.click(sendButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/send-otp', {
          email: 'test@example.com',
          action: 'sign-agreement',
        });
      });
    });

    test('should show OTP input after sending OTP', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      const sendButton = screen.getByText('Send OTP');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
        expect(screen.getByText('Resend OTP')).toBeInTheDocument();
      });
    });

    test('should only accept 6-digit numeric OTP', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      // Send OTP first
      await user.click(screen.getByText('Send OTP'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });

      const otpInput = screen.getByPlaceholderText('000000') as HTMLInputElement;

      // Try to enter letters
      await user.type(otpInput, 'abc123');
      expect(otpInput.value).toBe('123');

      // Try to enter more than 6 digits
      await user.clear(otpInput);
      await user.type(otpInput, '1234567890');
      expect(otpInput.value).toBe('123456');
    });

    test('should enable Continue button only when OTP is 6 digits', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      await user.click(screen.getByText('Send OTP'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });

      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();

      const otpInput = screen.getByPlaceholderText('000000');
      await user.type(otpInput, '123456');

      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('Signature Flow', () => {
    test('should show signature step after OTP verification', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      // Send OTP
      await user.click(screen.getByText('Send OTP'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });

      // Enter OTP
      const otpInput = screen.getByPlaceholderText('000000');
      await user.type(otpInput, '123456');

      // Continue to signature
      await user.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(screen.getByText('OTP verified successfully')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
      });
    });

    test('should show signature preview', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      // Navigate to signature step
      await user.click(screen.getByText('Send OTP'));
      await waitFor(() => screen.getByPlaceholderText('000000'));
      await user.type(screen.getByPlaceholderText('000000'), '123456');
      await user.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
      });

      // Type signature
      const signatureInput = screen.getByPlaceholderText('Enter your full name');
      await user.type(signatureInput, 'John Doe');

      await waitFor(() => {
        expect(screen.getByText('Preview:')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    test('should submit signature with OTP', async () => {
      const mockSignResponse = {
        data: {
          data: {
            agreement: {
              _id: agreementId,
              status: 'pending_owner',
              tenantSignature: 'John Doe',
            },
          },
        },
      };
      vi.mocked(axios.post).mockResolvedValue(mockSignResponse);

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      // Navigate to signature step
      await user.click(screen.getByText('Send OTP'));
      await waitFor(() => screen.getByPlaceholderText('000000'));
      await user.type(screen.getByPlaceholderText('000000'), '123456');
      await user.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
      });

      // Enter signature and submit
      await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe');
      await user.click(screen.getByText('Sign Agreement'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/agreements/${agreementId}/sign`,
          {
            signature: 'John Doe',
            otp: '123456',
            email: 'test@example.com',
          }
        );
        expect(mockOnSigned).toHaveBeenCalledWith(mockSignResponse.data.data.agreement);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('should go back to OTP step when Back button is clicked', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      // Navigate to signature step
      await user.click(screen.getByText('Send OTP'));
      await waitFor(() => screen.getByPlaceholderText('000000'));
      await user.type(screen.getByPlaceholderText('000000'), '123456');
      await user.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(screen.getByText('OTP verified successfully')).toBeInTheDocument();
      });

      // Go back
      await user.click(screen.getByText('Back'));

      await waitFor(() => {
        expect(screen.getByText('Verify your identity')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid OTP error', async () => {
      vi.mocked(axios.post)
        .mockResolvedValueOnce({ data: { success: true } }) // Send OTP success
        .mockRejectedValueOnce({
          isAxiosError: true,
          response: { status: 401, data: { error: 'Invalid OTP' } },
        }); // Sign failure

      render(
        <AgreementSignModal
          agreementId={agreementId}
          onSigned={mockOnSigned}
          onClose={mockOnClose}
        />
      );
      const user = userEvent.setup();

      // Navigate to signature and submit
      await user.click(screen.getByText('Send OTP'));
      await waitFor(() => screen.getByPlaceholderText('000000'));
      await user.type(screen.getByPlaceholderText('000000'), '123456');
      await user.click(screen.getByText('Continue'));
      await waitFor(() => screen.getByPlaceholderText('Enter your full name'));
      await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe');
      await user.click(screen.getByText('Sign Agreement'));

      // Should go back to OTP step
      await waitFor(() => {
        expect(screen.getByText('Verify your identity')).toBeInTheDocument();
      });
    });
  });
});
