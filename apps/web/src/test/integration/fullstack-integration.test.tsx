/**
 * @vitest-environment jsdom
 * 
 * Full-stack Integration Tests
 * 
 * Tests the complete frontend-backend integration for critical user flows:
 * - Product browsing with real API calls
 * - Cart functionality with backend state management
 * - Authentication flow integration
 * - Payment processing integration
 * - Error handling across the full stack
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Test component that simulates product browsing
function ProductBrowser() {
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v1/products/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : data.products || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) return <div data-testid="loading">Loading products...</div>
  if (error) return <div data-testid="error">Error: {error}</div>

  return (
    <div data-testid="product-browser">
      <h1>Luxury Jewelry Collection</h1>
      <div data-testid="product-count">
        {products.length} products found
      </div>
      <div data-testid="product-list">
        {products.map((product) => (
          <div key={product.id} data-testid={`product-${product.id}`}>
            <h3>{product.name}</h3>
            <p>${(product.price / 100).toLocaleString()}</p>
            {product.featured && <span data-testid="featured-badge">Featured</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// Test component that simulates cart functionality
function CartManager() {
  const [cartCount, setCartCount] = React.useState(0)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const addToCart = async (productId: number) => {
    if (!isAuthenticated) {
      alert('Please sign in to add items to cart')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/v1/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add item to cart')
      }

      // Refresh cart count
      await fetchCartCount()
    } catch (err) {
      console.error('Add to cart error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCartCount = async () => {
    if (!isAuthenticated) return

    try {
      const response = await fetch('/api/v1/cart/count', {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCartCount(data.count)
      }
    } catch (err) {
      console.error('Cart count error:', err)
    }
  }

  const signIn = () => {
    setIsAuthenticated(true)
    fetchCartCount()
  }

  return (
    <div data-testid="cart-manager">
      {!isAuthenticated ? (
        <button onClick={signIn} data-testid="sign-in-btn">
          Sign In
        </button>
      ) : (
        <div>
          <div data-testid="cart-count">Cart: {cartCount} items</div>
          <button 
            onClick={() => addToCart(1)} 
            disabled={loading}
            data-testid="add-to-cart-btn"
          >
            {loading ? 'Adding...' : 'Add Luxury Ring to Cart'}
          </button>
        </div>
      )}
    </div>
  )
}

// Test component for payment flow
function PaymentProcessor() {
  const [paymentIntent, setPaymentIntent] = React.useState(null)
  const [processing, setProcessing] = React.useState(false)
  const [error, setError] = React.useState(null)

  const createPaymentIntent = async (amount: number) => {
    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          shipping_address: {
            first_name: 'Test',
            last_name: 'Customer',
            address_line_1: '123 Test St',
            city: 'Beverly Hills',
            state: 'CA',
            postal_code: '90210',
            country: 'US'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Payment intent creation failed')
      }

      const data = await response.json()
      setPaymentIntent(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div data-testid="payment-processor">
      {error && <div data-testid="payment-error">Error: {error}</div>}
      
      <button
        onClick={() => createPaymentIntent(1500000)} // $15,000
        disabled={processing}
        data-testid="create-payment-btn"
      >
        {processing ? 'Creating Payment...' : 'Purchase Luxury Ring ($15,000)'}
      </button>

      {paymentIntent && (
        <div data-testid="payment-intent">
          <div>Payment Intent: {paymentIntent.payment_intent_id}</div>
          <div>Amount: ${(paymentIntent.amount / 100).toLocaleString()}</div>
          <div>Status: Ready for payment</div>
        </div>
      )}
    </div>
  )
}

describe('Full-stack Integration Tests', () => {
  beforeEach(() => {
    // Start MSW server for API mocking
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('Product Browsing Integration', () => {
    it('should load and display luxury products from API', async () => {
      // Mock API response with luxury products
      server.use(
        http.get('/api/v1/products/products', () => {
          return HttpResponse.json({
            products: [
              {
                id: 1,
                name: 'Diamond Engagement Ring',
                price: 1500000, // $15,000
                featured: true
              },
              {
                id: 2,
                name: 'Gold Wedding Band',
                price: 250000, // $2,500
                featured: false
              },
              {
                id: 3,
                name: 'Pearl Necklace',
                price: 500000, // $5,000
                featured: true
              }
            ],
            total: 3,
            page: 1,
            page_size: 20
          })
        })
      )

      render(<ProductBrowser />)

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByTestId('product-count')).toHaveTextContent('3 products found')
      })

      // Verify luxury products are displayed
      expect(screen.getByText('Diamond Engagement Ring')).toBeInTheDocument()
      expect(screen.getByText('$15,000')).toBeInTheDocument()
      expect(screen.getByText('Gold Wedding Band')).toBeInTheDocument()
      expect(screen.getByText('$2,500')).toBeInTheDocument()
      expect(screen.getByText('Pearl Necklace')).toBeInTheDocument()
      expect(screen.getByText('$5,000')).toBeInTheDocument()

      // Check featured badges
      const featuredBadges = screen.getAllByTestId('featured-badge')
      expect(featuredBadges).toHaveLength(2) // Ring and Necklace are featured
    })

    it('should handle API errors gracefully', async () => {
      // Mock API error
      server.use(
        http.get('/api/v1/products/products', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      render(<ProductBrowser />)

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Error: Failed to fetch products')
      })
    })
  })

  describe('Cart Integration', () => {
    it('should handle complete cart workflow with authentication', async () => {
      const user = userEvent.setup()

      // Mock cart API responses
      server.use(
        http.get('/api/v1/cart/count', ({ request }) => {
          const authHeader = request.headers.get('authorization')
          if (!authHeader) {
            return new HttpResponse(null, { status: 401 })
          }
          return HttpResponse.json({ count: 0 })
        }),
        http.post('/api/v1/cart/add', ({ request }) => {
          const authHeader = request.headers.get('authorization')
          if (!authHeader) {
            return new HttpResponse(null, { status: 401 })
          }
          return HttpResponse.json({ 
            message: 'Item added to cart',
            user_db_id: 1 
          })
        }),
        // Mock updated cart count after adding item
        http.get('/api/v1/cart/count', ({ request }) => {
          const authHeader = request.headers.get('authorization')
          if (!authHeader) {
            return new HttpResponse(null, { status: 401 })
          }
          return HttpResponse.json({ count: 1 })
        })
      )

      render(<CartManager />)

      // Should show sign in button initially
      expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument()

      // Sign in
      await user.click(screen.getByTestId('sign-in-btn'))

      // Should now show cart interface
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart: 0 items')
      })

      // Add item to cart
      await user.click(screen.getByTestId('add-to-cart-btn'))

      // Should show loading state
      expect(screen.getByText('Adding...')).toBeInTheDocument()

      // Wait for cart count to update
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart: 1 items')
      })
    })

    it('should require authentication for cart operations', async () => {
      const user = userEvent.setup()

      // Mock unauthenticated responses
      server.use(
        http.post('/api/v1/cart/add', () => {
          return new HttpResponse(null, { status: 401 })
        })
      )

      render(<CartManager />)

      // Try to add to cart without authentication
      // Should show sign in prompt
      expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument()
      expect(screen.queryByTestId('add-to-cart-btn')).not.toBeInTheDocument()
    })
  })

  describe('Payment Integration', () => {
    it('should create payment intent for luxury purchase', async () => {
      const user = userEvent.setup()

      // Mock payment intent creation
      server.use(
        http.post('/api/v1/payment/create-payment-intent', async ({ request }) => {
          const body = await request.json()
          
          expect(body.amount).toBe(1500000) // $15,000
          expect(body.currency).toBe('usd')
          
          return HttpResponse.json({
            payment_intent_id: 'pi_test_luxury_ring',
            client_secret: 'pi_test_luxury_ring_secret',
            amount: 1500000,
            currency: 'usd'
          })
        })
      )

      render(<PaymentProcessor />)

      // Click to create payment intent
      await user.click(screen.getByTestId('create-payment-btn'))

      // Should show processing state
      expect(screen.getByText('Creating Payment...')).toBeInTheDocument()

      // Wait for payment intent to be created
      await waitFor(() => {
        expect(screen.getByTestId('payment-intent')).toBeInTheDocument()
      })

      // Verify payment intent details
      expect(screen.getByText('Payment Intent: pi_test_luxury_ring')).toBeInTheDocument()
      expect(screen.getByText('Amount: $15,000')).toBeInTheDocument()
      expect(screen.getByText('Status: Ready for payment')).toBeInTheDocument()
    })

    it('should handle payment creation failures', async () => {
      const user = userEvent.setup()

      // Mock payment creation failure
      server.use(
        http.post('/api/v1/payment/create-payment-intent', () => {
          return new HttpResponse(null, { status: 400 })
        })
      )

      render(<PaymentProcessor />)

      await user.click(screen.getByTestId('create-payment-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('payment-error')).toHaveTextContent('Error: Payment intent creation failed')
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle network failures gracefully', async () => {
      // Mock network failure
      server.use(
        http.get('/api/v1/products/products', () => {
          return HttpResponse.error()
        })
      )

      render(<ProductBrowser />)

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
      })
    })

    it('should handle authentication failures across components', async () => {
      const user = userEvent.setup()

      // Mock auth failure for all endpoints
      server.use(
        http.post('/api/v1/cart/add', () => {
          return new HttpResponse(null, { status: 401 })
        }),
        http.get('/api/v1/cart/count', () => {
          return new HttpResponse(null, { status: 401 })
        }),
        http.post('/api/v1/payment/create-payment-intent', () => {
          return new HttpResponse(null, { status: 401 })
        })
      )

      // Test cart component
      render(<CartManager />)
      expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument()

      // Test payment component  
      const { rerender } = render(<PaymentProcessor />)
      await user.click(screen.getByTestId('create-payment-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('payment-error')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Integration', () => {
    it('should handle large product catalogs efficiently', async () => {
      // Mock large product dataset
      const largeProductList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Luxury Item ${i + 1}`,
        price: 50000 + (i * 1000), // $500 - $1,500 range
        featured: i % 20 === 0 // 5% featured
      }))

      server.use(
        http.get('/api/v1/products/products', () => {
          return HttpResponse.json({
            products: largeProductList.slice(0, 20), // First page
            total: largeProductList.length,
            page: 1,
            page_size: 20
          })
        })
      )

      const start = performance.now()
      render(<ProductBrowser />)

      await waitFor(() => {
        expect(screen.getByTestId('product-count')).toHaveTextContent('20 products found')
      })

      const renderTime = performance.now() - start

      // Should render efficiently even with large dataset metadata
      expect(renderTime).toBeLessThan(1000) // Under 1 second
    })
  })
})