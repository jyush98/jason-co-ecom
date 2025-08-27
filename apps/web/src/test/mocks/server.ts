/**
 * Mock Service Worker server configuration for API mocking in tests
 */
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock data
const mockProducts = [
  {
    id: 1,
    name: "Diamond Luxury Ring",
    description: "Exquisite 18k gold ring with premium diamond",
    price: 15000.00,
    category: "rings",
    inventory_count: 5,
    featured: true,
    product_details: {
      material: "18k Gold",
      stone: "Diamond",
      certification: "GIA Certified"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "Pearl Necklace Collection",
    description: "Elegant pearl necklace with gold clasp",
    price: 2500.00,
    category: "necklaces",
    inventory_count: 12,
    featured: false,
    product_details: {
      material: "Gold",
      stone: "Pearl",
      length: "18 inches"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
]

const mockUser = {
  id: 1,
  clerk_user_id: "test-user-123",
  email: "test@jasonjewels.com",
  first_name: "Test",
  last_name: "User",
  created_at: "2024-01-01T00:00:00Z"
}

const mockCart = {
  items: [
    {
      id: 1,
      product_id: 1,
      quantity: 1,
      price: 15000.00,
      product: mockProducts[0]
    }
  ],
  total_amount: 15000.00,
  total_items: 1
}

// API request handlers
export const handlers = [
  // Products API
  http.get('/api/v1/products', () => {
    return HttpResponse.json(mockProducts)
  }),

  http.get('/api/v1/products/featured', () => {
    return HttpResponse.json(mockProducts.filter(p => p.featured))
  }),

  http.get('/api/v1/products/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const product = mockProducts.find(p => p.id === id)
    
    if (!product) {
      return new HttpResponse(null, { 
        status: 404,
        statusText: 'Product not found'
      })
    }
    
    return HttpResponse.json(product)
  }),

  http.get('/api/v1/products/search', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    if (!query) {
      return HttpResponse.json([])
    }
    
    const filtered = mockProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    )
    
    return HttpResponse.json(filtered)
  }),

  // Cart API
  http.get('/api/v1/cart', () => {
    return HttpResponse.json(mockCart)
  }),

  http.post('/api/v1/cart/add', async ({ request }) => {
    const body = await request.json() as { product_id: number; quantity: number }
    
    return HttpResponse.json({
      message: "Item added to cart",
      item: {
        id: Date.now(),
        product_id: body.product_id,
        quantity: body.quantity,
        price: mockProducts.find(p => p.id === body.product_id)?.price || 0
      }
    })
  }),

  http.delete('/api/v1/cart/remove/:id', ({ params }) => {
    return HttpResponse.json({
      message: `Item ${params.id} removed from cart`
    })
  }),

  http.put('/api/v1/cart/update/:id', async ({ params, request }) => {
    const body = await request.json() as { quantity: number }
    
    return HttpResponse.json({
      message: `Item ${params.id} quantity updated to ${body.quantity}`
    })
  }),

  // User API
  http.get('/api/v1/users/profile', () => {
    return HttpResponse.json(mockUser)
  }),

  // Checkout API
  http.post('/api/v1/checkout/complete', async ({ request }) => {
    const body = await request.json() as any
    
    return HttpResponse.json({
      id: Date.now(),
      status: "confirmed",
      total_amount: body.total_amount || 15000.00,
      payment_intent_id: body.payment_intent_id,
      created_at: new Date().toISOString()
    })
  }),

  // Payment API
  http.post('/api/v1/payment/create-intent', async ({ request }) => {
    const body = await request.json() as { amount: number; currency: string }
    
    return HttpResponse.json({
      client_secret: "pi_test_12345_secret",
      payment_intent_id: "pi_test_12345",
      amount: Math.round(body.amount * 100), // Convert to cents
      currency: body.currency || "usd"
    })
  }),

  // Wishlist API
  http.get('/api/v1/wishlist', () => {
    return HttpResponse.json({
      items: [
        {
          id: 1,
          product_id: 2,
          product: mockProducts[1]
        }
      ]
    })
  }),

  http.post('/api/v1/wishlist/add', async ({ request }) => {
    const body = await request.json() as { product_id: number }
    
    return HttpResponse.json({
      message: "Item added to wishlist",
      item: {
        id: Date.now(),
        product_id: body.product_id,
        product: mockProducts.find(p => p.id === body.product_id)
      }
    })
  }),

  // Error scenarios for testing
  http.get('/api/v1/products/error', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }),

  http.post('/api/v1/cart/error', () => {
    return new HttpResponse(null, {
      status: 400,
      statusText: 'Bad Request'
    })
  }),
]

// Setup MSW server
export const server = setupServer(...handlers)