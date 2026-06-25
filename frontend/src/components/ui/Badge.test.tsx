import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies success variant class', () => {
    render(<Badge variant="success">OK</Badge>)
    expect(screen.getByText('OK').className).toContain('bg-green-100')
  })

  it('applies error variant class', () => {
    render(<Badge variant="error">Fail</Badge>)
    expect(screen.getByText('Fail').className).toContain('bg-red-100')
  })

  it('applies default variant by default', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default').className).toContain('bg-gray-100')
  })
})
