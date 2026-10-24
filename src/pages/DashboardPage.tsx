import { Activity, AlertTriangle, Package, PackageCheck, TrendingUp } from 'lucide-react'
import { format, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardSummary, Order, Product } from '../types'
import { formatCurrency } from '../utils/finance'

export function DashboardPage({ summary, products, orders }: { summary: DashboardSummary; products: Product[]; orders: Order[] }) {
  const [referenceDate] = useState(() => new Date())
  const chartData = Array.from({ length: 6 }, (_, offset) => {
    const month = subMonths(startOfMonth(referenceDate), 5 - offset)
    const monthOrders = orders.filter((order) => {
      return isSameMonth(parseISO(order.createdAt), month) && order.status !== 'Cancelado'
    })
    const monthSales = monthOrders.reduce((total, order) => total + order.total, 0)
    const monthCosts = monthOrders.reduce((total, order) => total + order.items.reduce((cost, item) => {
      const product = products.find((candidate) => candidate.id === item.productId)
      return cost + (product?.cost ?? 0) * item.quantity
    }, 0), 0)

    return { name: format(month, 'MMM', { locale: ptBR }), vendas: monthSales, despesas: monthCosts }
  })
  const cards = [
    { label: 'Faturamento', value: formatCurrency(summary.revenue), icon: TrendingUp, tone: 'bg-[#F4E7DE]' },
    { label: 'Recebimentos', value: formatCurrency(summary.received), icon: Package, tone: 'bg-[#EAF6EE]' },
    { label: 'Despesas', value: formatCurrency(summary.expenses), icon: Activity, tone: 'bg-[#F9EAEA]' },
    { label: 'Resultado estimado', value: formatCurrency(summary.estimatedResult), icon: PackageCheck, tone: 'bg-[#FDF7D9]' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">{label}</p>
                <h3 className="mt-2 text-2xl font-bold text-[#292524]">{value}</h3>
              </div>
              <div className={`${tone} flex h-12 w-12 items-center justify-center rounded-2xl`}>
                <Icon className="text-[#6F4E37]" size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="card min-w-0 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Vendas e despesas</h3>
            <span className="text-sm text-[#6B7280]">Últimos 6 meses</span>
          </div>
          <div className="h-64 min-w-0 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#C58B52" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#C58B52" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#3F805B" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#3F805B" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3b3028" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#d8cbb5', fontSize: 12 }} />
                <YAxis width={42} tickLine={false} axisLine={false} tick={{ fill: '#d8cbb5', fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="vendas" stroke="#C58B52" fill="url(#colorVendas)" strokeWidth={2} />
                <Area type="monotone" dataKey="despesas" stroke="#3F805B" fill="url(#colorDespesas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-lg font-semibold">Resumo operacional</h3>
            <div className="mt-4 space-y-4 text-sm text-[#6B7280]">
              <div className="flex items-center justify-between"><span>Pedidos recebidos</span><strong className="text-[#292524]">{summary.ordersReceived}</strong></div>
              <div className="flex items-center justify-between"><span>Em andamento</span><strong className="text-[#292524]">{summary.ongoingOrders}</strong></div>
              <div className="flex items-center justify-between"><span>Entregas próximas</span><strong className="text-[#292524]">{summary.upcomingDeliveries}</strong></div>
              <div className="flex items-center justify-between"><span>Atrasados</span><strong className="text-[#292524]">{summary.overdueOrders}</strong></div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-lg font-semibold">Produtos mais vendidos</h3>
            <div className="mt-4 space-y-3">
              {summary.topProducts.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl bg-[#F8F3F0] p-3">
                  <span>{item.name}</span>
                  <span className="font-semibold text-[#6F4E37]">{item.sales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-semibold">Estoques baixos</h3>
          <div className="mt-4 space-y-3">
            {summary.lowStock.length ? summary.lowStock.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl border border-[#E7DED4] p-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#C94C4C]" />
                  <span>{item.name}</span>
                </div>
                <span>{item.quantity} / {item.minimumStock}</span>
              </div>
            )) : <p className="text-sm text-[#6B7280]">Nenhum item em risco de queda de estoque no momento.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold">Pedidos por status</h3>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Pendentes', quantity: orders.filter((o) => o.status === 'Pendente de confirmação').length },
                { name: 'Produção', quantity: orders.filter((o) => o.status === 'Em produção').length },
                { name: 'Prontos', quantity: orders.filter((o) => o.status === 'Pronto').length },
                { name: 'Entregues', quantity: orders.filter((o) => o.status === 'Entregue').length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3b3028" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#d8cbb5', fontSize: 11 }} />
                <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} tick={{ fill: '#d8cbb5', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#6F4E37" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
