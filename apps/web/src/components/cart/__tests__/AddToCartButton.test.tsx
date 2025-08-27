/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuth, useUser } from '@clerk/nextjs';
import AddToCartButton from '../AddToCartButton';
import { useCartStore } from '@/app/store/cartStore';
import { useGuestCartStore } from '@/app/store/guestCartStore';
import { addToCart } from '@/utils/cart';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef<any, any>(({ children, ...props }, ref) => 
      React.createElement('button', { ...props, ref }, children)
    ),
    div: React.forwardRef<any, any>(({ children, ...props }, ref) => 
      React.createElement('div', { ...props, ref }, children)
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

// Mock cart utilities
vi.mock('@/utils/cart', () => ({
  addToCart: vi.fn(),
}));

// Mock cart stores
vi.mock('@/app/store/cartStore', () => ({
  useCartStore: vi.fn(),
}));

vi.mock('@/app/store/guestCartStore', () => ({
  useGuestCartStore: vi.fn(),
}));

// Mock GA4 hook
vi.mock('@/lib/hooks/useGA4', () => ({
  useGA4Ecommerce: () => ({
    trackAddToCart: vi.fn(),
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ShoppingBag: () => React.createElement('svg', { 'data-testid': 'shopping-bag-icon' }),
  Check: () => React.createElement('svg', { 'data-testid': 'check-icon' }),
  AlertCircle: () => React.createElement('svg', { 'data-testid': 'alert-icon' }),
}));

describe('AddToCartButton', () => {
  const mockProps = {
    productId: 1,
    productName: 'Diamond Ring',
    productPrice: 150000, // $1,500
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Default mock implementations
    (useAuth as any).mockReturnValue({
      getToken: vi.fn().mockResolvedValue('mock-token'),
    });
    
    (useUser as any).mockReturnValue({
      isSignedIn: true,
    });
    
    (useCartStore as any).mockImplementation((selector) => {
      const mockState = {
        fetchCartCount: vi.fn(),
        setCartCount: vi.fn(),
        openDrawer: vi.fn(),
        setLastAddedItem: vi.fn(),
      };
      return selector(mockState);
    });
    
    (useGuestCartStore as any).mockImplementation((selector) => {
      const mockState = {
        addItem: vi.fn(),
      };
      if (selector === useGuestCartStore.getState) {
        return { getCount: () => 0 };
      }
      return selector(mockState);
    });
    
    (addToCart as any).mockResolvedValue({ success: true });
  });

  it('renders the add to cart button', () => {
    render(<AddToCartButton {...mockProps} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Diamond Ring to cart')).toBeInTheDocument();
  });

  it('adds item to cart when clicked', async () => {
    const user = userEvent.setup();
    const mockAddToCart = addToCart as any;
    const mockFetchCartCount = vi.fn();
    
    (useCartStore as any).mockImplementation((selector) => {
      return selector({
        fetchCartCount: mockFetchCartCount,
        setCartCount: vi.fn(),
        openDrawer: vi.fn(),
        setLastAddedItem: vi.fn(),
      });
    });
    
    render(<AddToCartButton {...mockProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(1, 1, 'mock-token');
      expect(mockFetchCartCount).toHaveBeenCalledWith('mock-token');
    });
  });

  it('shows loading state when adding to cart', async () => {
    const user = userEvent.setup();
    
    // Make addToCart take some time to resolve
    (addToCart as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AddToCartButton {...mockProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Should show loading text immediately
    expect(screen.getByText('Adding...')).toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<AddToCartButton {...mockProps} disabled={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('handles add to cart errors gracefully', async () => {
    const user = userEvent.setup();
    const mockOnError = vi.fn();
    
    (addToCart as any).mockRejectedValue(new Error('Network error'));
    
    render(<AddToCartButton {...mockProps} onError={mockOnError} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Network error');
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('supports custom quantity', () => {
    render(<AddToCartButton {...mockProps} quantity={3} />);
    
    // Verify component renders with quantity prop
    expect(screen.getByLabelText('Add Diamond Ring to cart')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<AddToCartButton {...mockProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Add Diamond Ring to cart');
  });

  it('shows success state after adding to cart', async () => {
    const user = userEvent.setup();
    
    render(<AddToCartButton {...mockProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Added!')).toBeInTheDocument();
    });
  });

  it('handles guest checkout appropriately', async () => {
    const user = userEvent.setup();
    const mockAddGuestItem = vi.fn();
    const mockSetCartCount = vi.fn();
    
    // Mock unsigned user
    (useUser as any).mockReturnValue({
      isSignedIn: false,
    });
    
    (useCartStore as any).mockImplementation((selector) => {
      return selector({
        fetchCartCount: vi.fn(),
        setCartCount: mockSetCartCount,
        openDrawer: vi.fn(),
        setLastAddedItem: vi.fn(),
      });
    });
    
    (useGuestCartStore as any).mockImplementation((selector) => {
      if (selector === useGuestCartStore.getState) {
        return { getCount: () => 1 };
      }
      return selector({
        addItem: mockAddGuestItem,
      });
    });
    
    render(<AddToCartButton {...mockProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockAddGuestItem).toHaveBeenCalled();
    });
  });

  it('calls onSuccess callback after successful add', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = vi.fn();
    
    render(<AddToCartButton {...mockProps} onSuccess={mockOnSuccess} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});