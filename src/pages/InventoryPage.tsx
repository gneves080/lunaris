import { useState } from 'react'
import type { InventoryItem } from '../types'

export function InventoryPage({ inventory, setInventory }: { inventory: InventoryItem[]; setInventory: (inventory: InventoryItem[]) => void }) {
  const [form, setForm] = useState({ name: '', category: 'Ingredientes', unit: 'kg', quantity: 0, minimumStock: 0, unitCost: 0, supplier: '' })

  function handleSubmit() {
    if (!form.name.trim()) return
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      name: form.name,
      category: form.category,
      unit: form.unit as InventoryItem['unit'],
      quantity: form.quantity,
      minimumStock: form.minimumStock,
      unitCost: form.unitCost,
      supplier: form.supplier,
      updatedAt: new Date().toISOString(),
    }
    setInventory([item, ...inventory])
    setForm({ name: '', category: 'Ingredientes', unit: 'kg', quantity: 0, minimumStock: 0, unitCost: 0, supplier: '' })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-5">
        <h2 className="text-xl font-bold">Registrar ingrediente</h2>
        <div className="mt-4 space-y-3">
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome" className="w-full rounded-xl border border-[#E7DED4] p-3" />
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-[#E7DED4] p-3">
            <option>Ingredientes</option>
            <option>Materiais</option>
            <option>Embalagens</option>
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className="rounded-xl border border-[#E7DED4] p-3">
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">l</option>
              <option value="ml">ml</option>
              <option value="un">un</option>
            </select>
            <input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} placeholder="Quantidade" className="rounded-xl border border-[#E7DED4] p-3" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="number" value={form.minimumStock} onChange={(event) => setForm({ ...form, minimumStock: Number(event.target.value) })} placeholder="Estoque mínimo" className="rounded-xl border border-[#E7DED4] p-3" />
            <input type="number" value={form.unitCost} onChange={(event) => setForm({ ...form, unitCost: Number(event.target.value) })} placeholder="Custo unitário" className="rounded-xl border border-[#E7DED4] p-3" />
          </div>
          <input value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} placeholder="Fornecedor" className="w-full rounded-xl border border-[#E7DED4] p-3" />
          <button type="button" onClick={handleSubmit} className="tool-button w-full bg-[#6F4E37] text-white hover:bg-[#5c3d2d]">Salvar estoque</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-bold">Resumo do estoque</h2>
        <div className="mt-4 space-y-3">
          {inventory.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[#E7DED4] p-4">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-[#6B7280]">{item.quantity} {item.unit}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.quantity <= item.minimumStock ? 'bg-[#F9EAEA] text-[#C94C4C]' : 'bg-[#EAF6EE] text-[#3F805B]'}`}>
                {item.quantity <= item.minimumStock ? 'Baixo' : 'OK'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
