// Smoke test for the Button primitive. Confirms render + variant class wiring.
// Add real interaction tests as components grow.

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('<Button>', () => {
  it('renders its children', () => {
    render(<Button>Save changes</Button>)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('applies the primary navy background by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button', { name: 'Primary' })
    // CLAUDE.md: primary buttons are navy `#0F4C4C`.
    expect(btn.className).toMatch(/0F4C4C/)
  })
})
