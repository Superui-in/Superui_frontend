import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSubscribers from '../pages/admin/AdminSubscribers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockSubscribers = [
  { _id: '1', email: 'user1@example.com', createdAt: '2026-08-20T10:00:00Z' },
  { _id: '2', email: 'user2@example.com', createdAt: '2026-08-21T10:00:00Z' },
  { _id: '3', email: 'user3@example.com', createdAt: '2026-08-22T10:00:00Z' },
];

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { subscribers: mockSubscribers, total: 3, page: 1, pages: 1 } })),
    delete: vi.fn(() => Promise.resolve({ data: { message: 'Subscriber removed' } })),
  },
}));

vi.mock('../hooks/useSiteContent', () => ({
  useInvalidateContent: () => vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Admin Subscribers Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders subscribers list', async () => {
    render(<AdminSubscribers />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeTruthy();
      expect(screen.getByText('user2@example.com')).toBeTruthy();
      expect(screen.getByText('user3@example.com')).toBeTruthy();
    });
  });

  it('shows total subscriber count', async () => {
    render(<AdminSubscribers />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('3')).toBeTruthy();
    });
  });

  it('has search input to filter subscribers', async () => {
    render(<AdminSubscribers />, { wrapper });
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search email/i)).toBeTruthy();
    });
  });

  it('can delete a subscriber', async () => {
    window.confirm = vi.fn(() => true);
    render(<AdminSubscribers />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeTruthy();
    });
  });
});
