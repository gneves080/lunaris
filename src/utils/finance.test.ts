import { describe, expect, it } from 'vitest'
import { calculateOrderTotal, convertToBaseUnit, formatCurrency, sumRevenueByStatus } from './finance'

describe('finance utilities', () => {
  it('calculates order total correctly', () => {
    expect(calculateOrderTotal([
      { quantity: 2, unitPrice: 20, discount: 4 },
      { quantity: 1, unitPrice: 12, discount: 0 },
    ], 8, 2)).toBe(54)
  })

  it('converts units to base values', () => {
    expect(convertToBaseUnit(2, 'kg')).toBe(2000)
    expect(convertToBaseUnit(250, 'g')).toBe(250)
  })

  it('sums revenue for paid orders only', () => {
    expect(sumRevenueByStatus([
      { total: 50, paymentStatus: 'Pago' },
      { total: 100, paymentStatus: 'Pendente' },
      { total: 150, paymentStatus: 'Parcialmente pago' },
    ])).toBe(200)
  })

  it('formats BRL values', () => {
    expect(formatCurrency(25.5)).toBe('R$ 25,50')
  })
})
