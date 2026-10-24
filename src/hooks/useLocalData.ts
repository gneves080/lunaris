import { useEffect, useMemo, useState } from 'react'
import { addDays, isBefore, isWithinInterval, parseISO, startOfDay } from 'date-fns'
import { STORAGE_KEYS, readStorage, writeStorage } from '../utils/storage'
import type { BusinessSettings, Customer, InventoryItem, Order, Product } from '../types'

const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Cookie de chocolate',
    description: 'Cookie artesanal com gotas de chocolate.',
    category: 'Cookies',
    price: 16,
    cost: 7,
    unit: 'un',
    status: 'active',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Biscoito amanteigado',
    description: 'Clássico amanteigado.',
    category: 'Biscoitos amanteigados',
    price: 18,
    cost: 8,
    unit: 'un',
    status: 'active',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
]

const initialCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Maria Souza',
    phone: '+55 11 99123-4567',
    email: 'maria@exemplo.com',
    notes: 'Cliente recorrente.',
    createdAt: '2026-10-01T08:00:00.000Z',
    totalPurchased: 310,
    lastPurchaseAt: '2026-10-15T12:00:00.000Z',
  },
]

const initialInventory: InventoryItem[] = [
  { id: 'i1', name: 'Farinha', category: 'Ingredientes', unit: 'kg', quantity: 5, minimumStock: 2, unitCost: 7, supplier: 'Fornecedor A', updatedAt: '2026-10-20T08:00:00.000Z' },
  { id: 'i2', name: 'Manteiga', category: 'Ingredientes', unit: 'kg', quantity: 1.1, minimumStock: 1, unitCost: 18, supplier: 'Fornecedor B', updatedAt: '2026-10-20T08:00:00.000Z' },
  { id: 'i3', name: 'Embalagem premium', category: 'Materiais', unit: 'un', quantity: 25, minimumStock: 10, unitCost: 2.5, supplier: 'Fornecedor C', updatedAt: '2026-10-20T08:00:00.000Z' },
]

const initialOrders: Order[] = [
  {
    id: 'o1',
    number: 'LUN-1001',
    customerId: 'c1',
    customerName: 'Maria Souza',
    createdAt: '2026-10-20T11:00:00.000Z',
    deliveryDate: '2026-10-22T00:00:00.000Z',
    items: [
      { id: 'oi1', productId: 'p1', productName: 'Cookie de chocolate', quantity: 2, unitPrice: 16, discount: 0, total: 32 },
      { id: 'oi2', productId: 'p2', productName: 'Biscoito amanteigado', quantity: 1, unitPrice: 18, discount: 0, total: 18 },
    ],
    discount: 0,
    deliveryFee: 8,
    total: 58,
    paymentMethod: 'Pix',
    paymentStatus: 'Pago',
    status: 'Entregue',
    notes: 'Entrega na empresa.',
  },
]

const initialSettings: BusinessSettings = {
  companyName: 'Lunaris Gestão',
  phone: '+55 11 3333-8888',
  email: 'contato@lunarisgestao.com.br',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  firstDayOfWeek: 1,
}

export function useLocalData() {
  const [referenceDate] = useState(() => new Date())
  const [products, setProducts] = useState<Product[]>(() => readStorage(STORAGE_KEYS.products, initialProducts))
  const [customers, setCustomers] = useState<Customer[]>(() => readStorage(STORAGE_KEYS.customers, initialCustomers))
  const [orders, setOrders] = useState<Order[]>(() => readStorage(STORAGE_KEYS.orders, initialOrders))
  const [inventory, setInventory] = useState<InventoryItem[]>(() => readStorage(STORAGE_KEYS.inventory, initialInventory))
  const [settings, setSettings] = useState<BusinessSettings>(() => readStorage(STORAGE_KEYS.settings, initialSettings))

  useEffect(() => {
    writeStorage(STORAGE_KEYS.products, products)
  }, [products])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.customers, customers)
  }, [customers])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.orders, orders)
  }, [orders])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.inventory, inventory)
  }, [inventory])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.settings, settings)
  }, [settings])

  const summary = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== 'Cancelado')
    const today = startOfDay(referenceDate)
    const nextWeek = addDays(today, 7)
    const productSales = new Map<string, number>()

    activeOrders.forEach((order) => order.items.forEach((item) => {
      productSales.set(item.productName, (productSales.get(item.productName) ?? 0) + item.total)
    }))

    return {
      revenue: activeOrders.reduce((total, order) => total + order.total, 0),
      received: activeOrders.filter((order) => order.paymentStatus === 'Pago').reduce((total, order) => total + order.total, 0),
      expenses: inventory.reduce((total, item) => total + item.unitCost * item.quantity, 0),
      estimatedResult: activeOrders.reduce((total, order) => total + order.total, 0) - activeOrders.reduce((total, order) => total + order.items.reduce((cost, item) => {
        const product = products.find((candidate) => candidate.id === item.productId)
        return cost + (product?.cost ?? 0) * item.quantity
      }, 0), 0),
      ordersReceived: orders.length,
      ongoingOrders: activeOrders.filter((order) => order.status !== 'Entregue').length,
      overdueOrders: activeOrders.filter((order) => order.status !== 'Entregue' && isBefore(parseISO(order.deliveryDate), today)).length,
      upcomingDeliveries: activeOrders.filter((order) => order.status !== 'Entregue' && isWithinInterval(parseISO(order.deliveryDate), { start: today, end: nextWeek })).length,
      topProducts: [...productSales.entries()].sort((left, right) => right[1] - left[1]).slice(0, 3).map(([name, sales]) => ({ name, sales })),
      lowStock: inventory.filter((item) => item.quantity <= item.minimumStock).map((item) => ({ name: item.name, quantity: item.quantity, minimumStock: item.minimumStock })),
    }
  }, [inventory, orders, products, referenceDate])

  return {
    products,
    customers,
    orders,
    inventory,
    settings,
    setProducts,
    setCustomers,
    setOrders,
    setInventory,
    setSettings,
    summary,
  }
}
