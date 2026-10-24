import type { Customer, InventoryItem, Order, Product } from '../types'
import { formatCurrency } from '../utils/finance'

export function ReportsPage({ products, orders, inventory, customers }: { products: Product[]; orders: Order[]; inventory: InventoryItem[]; customers: Customer[] }) {
  function exportCsv() {
    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`
    const rows = [
      ['Tipo', 'Descrição', 'Valor'],
      ...orders.map((order) => ['Pedido', order.number, order.total.toString()]),
      ...products.map((product) => ['Produto', product.name, product.price.toString()]),
    ]
    const csv = rows.map((row) => row.map(escapeCsv).join(';')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'lunaris-relatorio.csv'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Relatórios</h2>
          <button type="button" onClick={exportCsv} className="tool-button bg-[#3F805B] text-white hover:bg-[#2f6348]">Exportar CSV</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5"><p className="text-sm text-[#6B7280]">Produtos</p><p className="mt-2 text-3xl font-bold">{products.length}</p></div>
        <div className="card p-5"><p className="text-sm text-[#6B7280]">Pedidos</p><p className="mt-2 text-3xl font-bold">{orders.length}</p></div>
        <div className="card p-5"><p className="text-sm text-[#6B7280]">Itens em estoque</p><p className="mt-2 text-3xl font-bold">{inventory.length}</p></div>
        <div className="card p-5"><p className="text-sm text-[#6B7280]">Clientes</p><p className="mt-2 text-3xl font-bold">{customers.length}</p></div>
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-semibold">Faturamento por pedido</h3>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-2xl border border-[#E7DED4] p-4">
              <span>{order.number}</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
