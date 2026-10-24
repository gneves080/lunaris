import type { InventoryItem, Order } from '../types'
import { formatCurrency } from '../utils/finance'

export function FinancePage({ orders, inventory }: { orders: Order[]; inventory: InventoryItem[] }) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const expenseTotal = inventory.reduce((sum, item) => sum + item.unitCost * item.quantity, 0)

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="card p-5 xl:col-span-1">
        <h2 className="text-xl font-bold">Indicadores financeiros</h2>
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-[#F4E7DE] p-4">
            <p className="text-sm text-[#6B7280]">Receitas</p>
            <p className="mt-2 text-2xl font-bold text-[#292524]">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-2xl bg-[#F9EAEA] p-4">
            <p className="text-sm text-[#6B7280]">Despesas</p>
            <p className="mt-2 text-2xl font-bold text-[#292524]">{formatCurrency(expenseTotal)}</p>
          </div>
          <div className="rounded-2xl bg-[#EAF6EE] p-4">
            <p className="text-sm text-[#6B7280]">Resultado estimado</p>
            <p className="mt-2 text-2xl font-bold text-[#292524]">{formatCurrency(totalRevenue - expenseTotal)}</p>
          </div>
        </div>
      </div>

      <div className="card p-5 xl:col-span-2">
        <h2 className="text-xl font-bold">Últimos lançamentos</h2>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-2xl border border-[#E7DED4] p-4">
              <div>
                <p className="font-semibold">{order.number}</p>
                <p className="text-sm text-[#6B7280]">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#292524]">{formatCurrency(order.total)}</p>
                <p className="text-xs text-[#6B7280]">{order.paymentStatus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
