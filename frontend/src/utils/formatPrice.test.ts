import { describe, it, expect } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('formats zero correctly', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('formats whole numbers with .00', () => {
    expect(formatPrice(10)).toBe('$10.00')
    expect(formatPrice(249)).toBe('$249.00')
  })

  it('formats decimals correctly', () => {
    expect(formatPrice(9.99)).toBe('$9.99')
    expect(formatPrice(249.99)).toBe('$249.99')
  })

  it('formats large numbers with commas', () => {
    expect(formatPrice(1000)).toBe('$1,000.00')
    expect(formatPrice(1234567.89)).toBe('$1,234,567.89')
  })

  it('formats negative numbers', () => {
    expect(formatPrice(-5.50)).toBe('-$5.50')
  })
})
