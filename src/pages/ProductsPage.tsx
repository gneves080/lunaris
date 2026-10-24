import { useState } from 'react'
import type { Product } from '../types'
import { formatCurrency } from '../utils/finance'

export function ProductsPage({ products, setProducts }: { products: Product[]; setProducts: (products: Product[]) => void }) {
  const [form, setForm] = useState({ name: '', description: '', category: 'Cookies', price: 0, cost: 0, unit: 'un', status: 'active' as Product['status'] })

  function handleSubmit() {
    if (!form.name.trim()) return
    const product: Product = {
      id: crypto.randomUUID(),
      name: form.name,
      description: form.description,
      category: form.category,
      price: form.price,
      cost: form.cost,
      unit: form.unit,
      status: form.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProducts([product, ...products])
    setForm({ name: '', description: '', category: 'Cookies', price: 0, cost: 0, unit: 'un', status: 'active' })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-5">
        <h2 className="text-xl font-bold">Cadastrar produto</h2>
        <div className="mt-4 space-y-3">
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome" className="w-full rounded-xl border border-[#E7DED4] p-3" />
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descrição" className="w-full rounded-xl border border-[#E7DED4] p-3" />
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-[#E7DED4] p-3">
            <option>Biscoitos amanteigados</option>
            <option>Cookies</option>
            <option>Biscoitos recheados</option>
            <option>Kits e presentes</option>
            <option>Outros</option>
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} placeholder="Preço" className="rounded-xl border border-[#E7DED4] p-3" />
            <input type="number" value={form.cost} onChange={(event) => setForm({ ...form, cost: Number(event.target.value) })} placeholder="Custo" className="rounded-xl border border-[#E7DED4] p-3" />
          </div>
          <div className="flex gap-3">
            <select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className="flex-1 rounded-xl border border-[#E7DED4] p-3">
              <option value="un">Unidade</option>
              <option value="kg">Quilograma</option>
              <option value="g">Grama</option>
            </select>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Product['status'] })} className="flex-1 rounded-xl border border-[#E7DED4] p-3">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          <button type="button" onClick={handleSubmit} className="tool-button w-full bg-[#6F4E37] text-white hover:bg-[#5c3d2d]">Salvar produto</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-bold">Produtos cadastrados</h2>
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E7DED4] p-4 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{product.name}</p>
                  <span className="rounded-full bg-[#F4E7DE] px-2 py-0.5 text-xs text-[#6F4E37]">{product.status}</span>
                </div>
                <p className="text-sm text-[#6B7280]">{product.category}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#292524]">{formatCurrency(product.price)}</p>
                <p className="text-xs text-[#6B7280]">Custo: {formatCurrency(product.cost)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
