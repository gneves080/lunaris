import { useMemo, useState } from 'react'
import type { Customer, Order, OrderItem, Product } from '../types'
import { calculateOrderTotal, formatCurrency } from '../utils/finance'

const defaultItem = { productId: '', quantity: 1, unitPrice: 0, discount: 0 }

export function OrdersPage({ orders, customers, products, setOrders }: { orders: Order[]; customers: Customer[]; products: Product[]; setOrders: (orders: Order[]) => void }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '')
  const [selectedItems, setSelectedItems] = useState<Array<typeof defaultItem>>([{ ...defaultItem, productId: products[0]?.id ?? '' }])
  const [formError, setFormError] = useState('')

  const productMap = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products])

  function addItem() {
    setSelectedItems((current) => [...current, { ...defaultItem, productId: products[0]?.id ?? '' }])
  }

  function updateItem(index: number, field: keyof typeof defaultItem, value: string | number) {
    setSelectedItems((current) => current.map((item, i) => {
      if (i !== index) return item
      const next = { ...item, [field]: value }
      if (field === 'productId') {
        const product = productMap[value as string]
        next.unitPrice = product ? product.price : 0
      }
      return next
    }))
  }

  function createOrder() {
    const customer = customers.find((item) => item.id === customerId)
    if (!customer || !selectedItems.length || selectedItems.some((item) => {
      const product = productMap[item.productId]
      return !product || !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0 || !Number.isFinite(item.discount) || item.discount < 0 || item.discount > item.quantity * item.unitPrice
    })) {
      setFormError('Selecione um cliente e confira os produtos, quantidades, preços e descontos.')
      return
    }
    setFormError('')

    const items: OrderItem[] = selectedItems.map((item) => {
      const product = productMap[item.productId]
      return {
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: product?.name ?? 'Produto',
        quantity: item.quantity,
        unitPrice: item.unitPrice || product?.price || 0,
        discount: item.discount,
        total: (item.quantity * (item.unitPrice || product?.price || 0)) - item.discount,
      }
    })

    const total = calculateOrderTotal(items, 8, 0)
    const order: Order = {
      id: crypto.randomUUID(),
      number: `LUN-${String(orders.length + 1001)}`,
      customerId: customer.id,
      customerName: customer.name,
      createdAt: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      items,
      discount: 0,
      deliveryFee: 8,
      total,
      paymentMethod: 'Pix',
      paymentStatus: 'Pendente',
      status: 'Pendente de confirmação',
      notes: 'Pedido gerado pelo dashboard.',
    }

    setOrders([order, ...orders])
    setSelectedItems([{ ...defaultItem, productId: products[0]?.id ?? '' }])
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="text-xl font-bold">Novo pedido</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="rounded-xl border border-[#E7DED4] p-3">
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          <button type="button" onClick={addItem} className="tool-button bg-[#6F4E37] text-white hover:bg-[#5c3d2d]">Adicionar item</button>
        </div>

        <div className="mt-6 space-y-4">
          {selectedItems.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-[#E7DED4] p-3 md:grid-cols-4">
              <select value={item.productId} onChange={(event) => updateItem(index, 'productId', event.target.value)} className="rounded-xl border border-[#E7DED4] p-3">
                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
              <input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(index, 'quantity', Number(event.target.value))} className="rounded-xl border border-[#E7DED4] p-3" />
              <input type="number" min={0} value={item.unitPrice} onChange={(event) => updateItem(index, 'unitPrice', Number(event.target.value))} className="rounded-xl border border-[#E7DED4] p-3" />
              <input type="number" min={0} value={item.discount} onChange={(event) => updateItem(index, 'discount', Number(event.target.value))} className="rounded-xl border border-[#E7DED4] p-3" />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          {formError && <p className="mr-auto self-center text-sm text-[#ff9d9d]" role="alert">{formError}</p>}
          <button type="button" onClick={createOrder} className="tool-button bg-[#3F805B] text-white hover:bg-[#2e6549]">Salvar pedido</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-bold">Pedidos recentes</h2>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col justify-between gap-2 rounded-2xl border border-[#E7DED4] p-4 md:flex-row md:items-center">
              <div>
                <p className="font-semibold">{order.number}</p>
                <p className="text-sm text-[#6B7280]">{order.customerName} • {order.status}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#292524]">{formatCurrency(order.total)}</p>
                <p className="text-xs text-[#6B7280]">{new Date(order.deliveryDate).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
