import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Rating from './Rating'

describe('Rating', () => {
  it('renders star rating value', () => {
    render(<Rating value={4.5} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('renders count when provided', () => {
    render(<Rating value={4.0} count={120} />)
    expect(screen.getByText('(120)')).toBeInTheDocument()
  })

  it('hides count when not provided', () => {
    render(<Rating value={3.0} />)
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument()
  })

  it('renders 5 stars', () => {
    const { container } = render(<Rating value={3} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(5)
  })

  it('uses small size when specified', () => {
    render(<Rating value={4} size="sm" count={5} />)
    const count = screen.getByText('(5)')
    expect(count.className).toContain('text-xs')
  })
})
