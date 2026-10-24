import { useEffect, useMemo, useState } from 'react'
import { addDays, isBefore, isWithinInterval, parseISO, startOfDay } from 'date-fns'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { STORAGE_KEYS, readStorage, writeStorage } from '../utils/storage'
import type { BusinessSettings, Customer, InventoryItem, Order, Product } from '../types'

type DbRow = Record<string, unknown>

function mapProduct(row: DbRow): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ''),
    category: String(row.category ?? 'Outros'),
    price: Number(row.price),
    cost: Number(row.cost),
    unit: String(row.unit ?? 'un'),
    status: row.status === 'inactive' ? 'inactive' : 'active',
    imageUrl: typeof row.image_url === 'string' ? row.image_url : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function mapCustomer(row: DbRow): Customer {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone ?? ''),
    email: typeof row.email === 'string' ? row.email : undefined,
    notes: typeof row.notes === 'string' ? row.notes : undefined,
    createdAt: String(row.created_at),
    totalPurchased: Number(row.total_purchased ?? 0),
    lastPurchaseAt: typeof row.last_purchase_at === 'string' ? row.last_purchase_at : undefined,
  }
}

function mapInventoryItem(row: DbRow): InventoryItem {
  return {
    id: String(row.id),
    name: String(row.name),
    category: String(row.category ?? 'Ingredientes'),
    unit: String(row.unit ?? 'kg') as InventoryItem['unit'],
    quantity: Number(row.quantity),
    minimumStock: Number(row.minimum_stock),
    unitCost: Number(row.unit_cost),
    supplier: typeof row.supplier === 'string' ? row.supplier : undefined,
    updatedAt: String(row.updated_at),
  }
}

function mapOrder(row: DbRow, itemRows: DbRow[]): Order {
  return {
    id: String(row.id),
    number: String(row.number),
    customerId: String(row.customer_id ?? ''),
    customerName: String(row.customer_name),
    createdAt: String(row.created_at),
    deliveryDate: String(row.delivery_date),
    items: itemRows.filter((item) => item.order_id === row.id).map((item) => ({
      id: String(item.id),
      productId: String(item.product_id ?? ''),
      productName: String(item.product_name),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      discount: Number(item.discount),
      total: Number(item.total),
    })),
    discount: Number(row.discount ?? 0),
    deliveryFee: Number(row.delivery_fee ?? 0),
    total: Number(row.total ?? 0),
    paymentMethod: String(row.payment_method ?? 'Pix'),
    paymentStatus: String(row.payment_status ?? 'Pendente') as Order['paymentStatus'],
    status: String(row.status ?? 'Pendente de confirmação') as Order['status'],
    notes: typeof row.notes === 'string' ? row.notes : undefined,
  }
}

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

export function useLocalData(enabled = true, sessionUserId: string | null = null) {
  const [referenceDate] = useState(() => new Date())
  const [products, setProductsState] = useState<Product[]>(() => isSupabaseConfigured ? [] : readStorage(STORAGE_KEYS.products, initialProducts))
  const [customers, setCustomersState] = useState<Customer[]>(() => isSupabaseConfigured ? [] : readStorage(STORAGE_KEYS.customers, initialCustomers))
  const [orders, setOrdersState] = useState<Order[]>(() => isSupabaseConfigured ? [] : readStorage(STORAGE_KEYS.orders, initialOrders))
  const [inventory, setInventoryState] = useState<InventoryItem[]>(() => isSupabaseConfigured ? [] : readStorage(STORAGE_KEYS.inventory, initialInventory))
  const [settings, setSettingsState] = useState<BusinessSettings>(() => isSupabaseConfigured ? initialSettings : readStorage(STORAGE_KEYS.settings, initialSettings))
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [syncError, setSyncError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [dirty, setDirty] = useState({ products: false, customers: false, orders: false, inventory: false, settings: false })

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    if (!enabled || !sessionUserId) return

    let active = true
    const client = supabase

    async function loadRemoteData() {
      try {
        const { data: { session }, error: sessionError } = await client.auth.getSession()
        if (sessionError) throw sessionError
        if (!session || session.user.id !== sessionUserId) throw new Error('Sessão expirada. Entre novamente para carregar os dados.')

        const { data: profile, error: profileError } = await client
          .from('profiles')
          .select('business_id')
          .eq('user_id', session.user.id)
          .single()
        if (profileError) throw profileError

        const id = String(profile.business_id)
        const [businessResult, productsResult, customersResult, ordersResult, itemsResult, inventoryResult] = await Promise.all([
          client.from('businesses').select('*').eq('id', id).single(),
          client.from('products').select('*').eq('business_id', id).order('created_at', { ascending: false }),
          client.from('customers').select('*').eq('business_id', id).order('created_at', { ascending: false }),
          client.from('orders').select('*').eq('business_id', id).order('created_at', { ascending: false }),
          client.from('order_items').select('*').eq('business_id', id),
          client.from('inventory_items').select('*').eq('business_id', id).order('name'),
        ])
        const results = [businessResult, productsResult, customersResult, ordersResult, itemsResult, inventoryResult]
        const failed = results.find((result) => result.error)
        if (failed?.error) throw failed.error
        if (!active) return

        setBusinessId(id)
        setSettingsState({
          companyName: String(businessResult.data.name),
          phone: String(businessResult.data.phone ?? ''),
          email: String(businessResult.data.email ?? ''),
          currency: String(businessResult.data.currency ?? 'BRL'),
          timezone: String(businessResult.data.timezone ?? 'America/Sao_Paulo'),
          logoUrl: typeof businessResult.data.logo_url === 'string' ? businessResult.data.logo_url : undefined,
          firstDayOfWeek: Number(businessResult.data.first_day_of_week ?? 1),
        })
        setProductsState((productsResult.data ?? []).map((row) => mapProduct(row as DbRow)))
        setCustomersState((customersResult.data ?? []).map((row) => mapCustomer(row as DbRow)))
        const itemRows = (itemsResult.data ?? []) as DbRow[]
        setOrdersState((ordersResult.data ?? []).map((row) => mapOrder(row as DbRow, itemRows)))
        setInventoryState((inventoryResult.data ?? []).map((row) => mapInventoryItem(row as DbRow)))
        setDirty({ products: false, customers: false, orders: false, inventory: false, settings: false })
      } catch (error) {
        if (active) setSyncError(error instanceof Error ? error.message : 'Não foi possível carregar os dados do Supabase.')
      } finally {
        if (active) setLoadedUserId(sessionUserId)
      }
    }

    void loadRemoteData()
    return () => { active = false }
  }, [enabled, retryCount, sessionUserId])

  const remoteReady = !isSupabaseConfigured || (enabled && Boolean(sessionUserId) && loadedUserId === sessionUserId)
  const canUseData = !isSupabaseConfigured || Boolean(businessId && remoteReady)

  function markDirty(key: keyof typeof dirty) {
    setDirty((current) => ({ ...current, [key]: true }))
  }

  function setProducts(value: Product[]) {
    setProductsState(value)
    if (isSupabaseConfigured) markDirty('products')
  }

  function setCustomers(value: Customer[]) {
    setCustomersState(value)
    if (isSupabaseConfigured) markDirty('customers')
  }

  function setOrders(value: Order[]) {
    setOrdersState(value)
    if (isSupabaseConfigured) markDirty('orders')
  }

  function setInventory(value: InventoryItem[]) {
    setInventoryState(value)
    if (isSupabaseConfigured) markDirty('inventory')
  }

  function setSettings(value: BusinessSettings) {
    setSettingsState(value)
    if (isSupabaseConfigured) markDirty('settings')
  }

  function retrySync() {
    setLoadedUserId(null)
    setBusinessId(null)
    setRetryCount((count) => count + 1)
  }

  useEffect(() => {
    if (isSupabaseConfigured) return
    writeStorage(STORAGE_KEYS.products, products)
  }, [products])

  useEffect(() => {
    if (isSupabaseConfigured) return
    writeStorage(STORAGE_KEYS.customers, customers)
  }, [customers])

  useEffect(() => {
    if (isSupabaseConfigured) return
    writeStorage(STORAGE_KEYS.orders, orders)
  }, [orders])

  useEffect(() => {
    if (isSupabaseConfigured) return
    writeStorage(STORAGE_KEYS.inventory, inventory)
  }, [inventory])

  useEffect(() => {
    if (isSupabaseConfigured) return
    writeStorage(STORAGE_KEYS.settings, settings)
  }, [settings])

  useEffect(() => {
    if (!remoteReady || !businessId || !dirty.products || !supabase) return
    const rows = products.map((product) => ({
      id: product.id, business_id: businessId, name: product.name, description: product.description,
      category: product.category, price: product.price, cost: product.cost, unit: product.unit,
      status: product.status, image_url: product.imageUrl ?? null, created_at: product.createdAt, updated_at: product.updatedAt,
    }))
    void supabase.from('products').upsert(rows).then(({ error }) => {
      if (error) setSyncError(`Falha ao salvar produtos: ${error.message}`)
      else { setSyncError(''); setDirty((current) => ({ ...current, products: false })) }
    })
  }, [businessId, dirty.products, products, remoteReady])

  useEffect(() => {
    if (!remoteReady || !businessId || !dirty.customers || !supabase) return
    const rows = customers.map((customer) => ({
      id: customer.id, business_id: businessId, name: customer.name, phone: customer.phone,
      email: customer.email ?? null, notes: customer.notes ?? null, total_purchased: customer.totalPurchased,
      last_purchase_at: customer.lastPurchaseAt ?? null, created_at: customer.createdAt,
    }))
    void supabase.from('customers').upsert(rows).then(({ error }) => {
      if (error) setSyncError(`Falha ao salvar clientes: ${error.message}`)
      else { setSyncError(''); setDirty((current) => ({ ...current, customers: false })) }
    })
  }, [businessId, customers, dirty.customers, remoteReady])

  useEffect(() => {
    if (!remoteReady || !businessId || !dirty.orders || !supabase) return
    const orderRows = orders.map((order) => ({
      id: order.id, business_id: businessId, number: order.number, customer_id: order.customerId || null,
      customer_name: order.customerName, created_at: order.createdAt, delivery_date: order.deliveryDate,
      discount: order.discount, delivery_fee: order.deliveryFee, total: order.total, payment_method: order.paymentMethod,
      payment_status: order.paymentStatus, status: order.status, notes: order.notes ?? null,
    }))
    const itemRows = orders.flatMap((order) => order.items.map((item) => ({
      id: item.id, business_id: businessId, order_id: order.id, product_id: item.productId || null,
      product_name: item.productName, quantity: item.quantity, unit_price: item.unitPrice,
      discount: item.discount, total: item.total,
    })))
    void (async () => {
      const { error: orderError } = await supabase.from('orders').upsert(orderRows)
      if (orderError) { setSyncError(`Falha ao salvar pedidos: ${orderError.message}`); return }
      const { error: itemError } = await supabase.from('order_items').upsert(itemRows)
      if (itemError) { setSyncError(`Falha ao salvar itens dos pedidos: ${itemError.message}`); return }
      setSyncError('')
      setDirty((current) => ({ ...current, orders: false }))
    })()
  }, [businessId, dirty.orders, orders, remoteReady])

  useEffect(() => {
    if (!remoteReady || !businessId || !dirty.inventory || !supabase) return
    const rows = inventory.map((item) => ({
      id: item.id, business_id: businessId, name: item.name, category: item.category,
      unit: item.unit, quantity: item.quantity, minimum_stock: item.minimumStock,
      unit_cost: item.unitCost, supplier: item.supplier ?? null, updated_at: item.updatedAt,
    }))
    void supabase.from('inventory_items').upsert(rows).then(({ error }) => {
      if (error) setSyncError(`Falha ao salvar estoque: ${error.message}`)
      else { setSyncError(''); setDirty((current) => ({ ...current, inventory: false })) }
    })
  }, [businessId, dirty.inventory, inventory, remoteReady])

  useEffect(() => {
    if (!remoteReady || !businessId || !dirty.settings || !supabase) return
    void supabase.from('businesses').update({
      name: settings.companyName, phone: settings.phone, email: settings.email,
      currency: settings.currency, timezone: settings.timezone,
      first_day_of_week: settings.firstDayOfWeek, logo_url: settings.logoUrl ?? null,
    }).eq('id', businessId).then(({ error }) => {
      if (error) setSyncError(`Falha ao salvar configurações: ${error.message}`)
      else { setSyncError(''); setDirty((current) => ({ ...current, settings: false })) }
    })
  }, [businessId, dirty.settings, remoteReady, settings])

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
    dataReady: remoteReady,
    canUseData,
    syncError,
    retrySync,
  }
}
