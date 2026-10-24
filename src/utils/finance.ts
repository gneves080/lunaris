export function calculateOrderTotal(items: { quantity: number; unitPrice: number; discount: number }[], deliveryFee = 0, discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0)
  return Math.max(0, subtotal + deliveryFee - discount)
}

export function convertToBaseUnit(value: number, unit: 'g' | 'kg' | 'ml' | 'l' | 'un') {
  const map = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    un: 1,
  }
  return value * (map[unit] ?? 1)
}

export function sumRevenueByStatus(orders: { total: number; paymentStatus: string }[]) {
  return orders.reduce((acc, order) => {
    if (order.paymentStatus === 'Pago' || order.paymentStatus === 'Parcialmente pago') {
      acc += order.total
    }
    return acc
  }, 0)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}
