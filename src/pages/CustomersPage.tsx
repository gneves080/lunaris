import { useState } from 'react'
import type { Customer } from '../types'

export function CustomersPage({ customers, setCustomers }: { customers: Customer[]; setCustomers: (customers: Customer[]) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })

  function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim()) return
    const customer: Customer = {
      id: crypto.randomUUID(),
      name: form.name,
      phone: form.phone.replace(/\D/g, ''),
      email: form.email,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      totalPurchased: 0,
    }
    setCustomers([customer, ...customers])
    setForm({ name: '', phone: '', email: '', notes: '' })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-5">
        <h2 className="text-xl font-bold">Cadastrar cliente</h2>
        <div className="mt-4 space-y-3">
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome" className="w-full rounded-xl border border-[#E7DED4] p-3" />
          <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Telefone" className="w-full rounded-xl border border-[#E7DED4] p-3" />
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="E-mail" className="w-full rounded-xl border border-[#E7DED4] p-3" />
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Observações" className="w-full rounded-xl border border-[#E7DED4] p-3" />
          <button type="button" onClick={handleSubmit} className="tool-button w-full bg-[#6F4E37] text-white hover:bg-[#5c3d2d]">Salvar cliente</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-bold">Clientes cadastrados</h2>
        <div className="mt-4 space-y-3">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-2xl border border-[#E7DED4] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{customer.name}</p>
                  <p className="text-sm text-[#6B7280]">{customer.phone}</p>
                </div>
                <span className="rounded-full bg-[#EAF6EE] px-2 py-1 text-xs font-medium text-[#3F805B]">{customer.totalPurchased > 0 ? 'Ativo' : 'Novo'}</span>
              </div>
              <p className="mt-2 text-sm text-[#6B7280]">{customer.email || 'Sem e-mail registrado'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
