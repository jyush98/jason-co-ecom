/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test component to verify our infrastructure
function TestComponent() {
  return <div data-testid="test-component">Hello Test Infrastructure!</div>
}

describe('Frontend Testing Infrastructure', () => {
  it('can render React components', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Hello Test Infrastructure!')).toBeInTheDocument()
  })

  it('has access to DOM testing utilities', () => {
    render(<button onClick={() => {}}>Click me</button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('can test component props and attributes', () => {
    render(<input placeholder="Test input" type="text" />)
    const input = screen.getByPlaceholderText('Test input')
    expect(input).toHaveAttribute('type', 'text')
  })
})