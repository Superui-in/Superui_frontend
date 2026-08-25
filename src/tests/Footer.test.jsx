import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Footer from '../components/layout/Footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </BrowserRouter>
);

vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { message: 'Subscribed', email: 'test@example.com' } })),
  },
}));

vi.mock('../hooks/useSiteContent', () => ({
  useSiteContent: () => ({ data: null }),
}));

vi.mock('../components/common/Logo', () => ({
  getLogoHtml: () => null,
}));

describe('Footer Newsletter Subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders newsletter form with email input and subscribe button', () => {
    render(<Footer />, { wrapper });
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeTruthy();
  });

  it('submits email and shows success message', async () => {
    render(<Footer />, { wrapper });
    const input = screen.getByPlaceholderText(/enter your email/i);
    const button = screen.getByRole('button', { name: /subscribe/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/thank you for subscribing/i)).toBeTruthy();
    });
  });

  it('calls subscribe API with correct email', async () => {
    const api = (await import('../api/axiosInstance')).default;
    render(<Footer />, { wrapper });
    const input = screen.getByPlaceholderText(/enter your email/i);
    const button = screen.getByRole('button', { name: /subscribe/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/subscribe', { email: 'test@example.com' });
    });
  });

  it('clears input after successful subscription', async () => {
    render(<Footer />, { wrapper });
    const input = screen.getByPlaceholderText(/enter your email/i);
    const button = screen.getByRole('button', { name: /subscribe/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
