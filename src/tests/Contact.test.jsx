import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '../pages/ContactPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const { mockPost } = vi.hoisted(() => {
  const mockPost = vi.fn(() => Promise.resolve({ data: { message: 'Message sent successfully!' } }));
  return { mockPost };
});

vi.mock('../api/axiosInstance', () => ({
  default: {
    post: mockPost,
  },
}));

describe('Contact Page Email Submission', () => {
  beforeEach(() => {
    mockPost.mockClear();
  });

  it('renders contact form with required fields', () => {
    render(<ContactPage />, { wrapper });
    expect(screen.getByPlaceholderText(/john doe/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/john@example\.com/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /send inquiry/i })).toBeTruthy();
  });

  it('submits custom website contact form successfully', async () => {
    render(<ContactPage />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/john doe/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/john@example\.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/\+91 98765 43210/i), { target: { value: '9876543210' } });

    const websiteTypeSelect = screen.getByDisplayValue('Select Type');
    fireEvent.change(websiteTypeSelect, { target: { value: 'E-Commerce' } });

    fireEvent.change(screen.getByPlaceholderText(/describe your website requirements/i), { target: { value: 'Need a website with payment integration and modern design for my business' } });

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/contact/custom-website', expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        websiteType: 'E-Commerce',
        requirements: 'Need a website with payment integration and modern design for my business',
      }));
    });
  });

  it('calls API with correct endpoint and payload', async () => {
    render(<ContactPage />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/john doe/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/john@example\.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/\+91 98765 43210/i), { target: { value: '9876543210' } });

    const websiteTypeSelect = screen.getByDisplayValue('Select Type');
    fireEvent.change(websiteTypeSelect, { target: { value: 'E-Commerce' } });

    fireEvent.change(screen.getByPlaceholderText(/describe your website requirements/i), { target: { value: 'Need a website with payment integration and modern design for my business' } });

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('/contact/custom-website', expect.any(Object));
    });
  });
});
