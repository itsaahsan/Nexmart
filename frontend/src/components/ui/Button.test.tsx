import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner when loading', () => {
    const { container } = render(<Button isLoading>Save</Button>)
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('applies primary variant class by default', () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole('button').className).toContain('bg-accent')
  })

  it('applies danger variant class', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button').className).toContain('bg-error')
  })
})
