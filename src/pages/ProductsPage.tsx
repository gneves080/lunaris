import { Pencil, X } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../types'
import { formatCurrency } from '../utils/finance'

export function ProductsPage({ products, setProducts }: { products: Product[]; setProducts: (products: Product[]) => void }) {
  const [form, setForm] = useState({ name: '', description: '', category: 'Cookies', price: 0, cost: 0, unit: 'un', status: 'active' as Product['status'] })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  function resetForm() {
    setForm({ name: '', description: '', category: 'Cookies', price: 0, cost: 0, unit: 'un', status: 'active' })
    setEditingProductId(null)
  }

  function startEditing(product: Product) {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      cost: product.cost,
      unit: product.unit,
      status: product.status,
    })
    setEditingProductId(product.id)
  }

  function handleSubmit() {
    if (!form.name.trim() || !Number.isFinite(form.price) || form.price < 0 || !Number.isFinite(form.cost) || form.cost < 0) return
    const now = new Date().toISOString()
    if (editingProductId) {
      setProducts(products.map((product) => product.id === editingProductId
        ? { ...product, ...form, name: form.name.trim(), updatedAt: now }
        : product))
      resetForm()
      return
    }

    const product: Product = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description,
      category: form.category,
      price: form.price,
      cost: form.cost,
      unit: form.unit,
      status: form.status,
      createdAt: now,
      updatedAt: now,
    }
    setProducts([product, ...products])
    resetForm()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-5">
        <h2 className="text-xl font-bold">{editingProductId ? 'Editar produto' : 'Cadastrar produto'}</h2>
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
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={handleSubmit} className="tool-button w-full bg-[#6F4E37] text-white hover:bg-[#5c3d2d]">{editingProductId ? 'Salvar alterações' : 'Salvar produto'}</button>
            {editingProductId && <button type="button" onClick={resetForm} className="tool-button w-full border border-[#3d3026] text-[#f3d7a1] hover:bg-[#17120f]"><X size={16} /> Cancelar</button>}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-bold">Produtos cadastrados</h2>
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E7DED4] p-4 md:flex-row md:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{product.name}</p>
                  <span className="rounded-full bg-[#F4E7DE] px-2 py-0.5 text-xs text-[#6F4E37]">{product.status}</span>
                </div>
                <p className="text-sm text-[#6B7280]">{product.category}</p>
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="text-left md:text-right">
                  <p className="font-bold text-[#292524]">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-[#6B7280]">Custo: {formatCurrency(product.cost)}</p>
                </div>
                <button type="button" onClick={() => startEditing(product)} aria-label={`Editar ${product.name}`} className="tool-button min-h-10 gap-2 border border-[#3d3026] px-3 text-sm text-[#f3d7a1] hover:bg-[#17120f]">
                  <Pencil size={16} />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
