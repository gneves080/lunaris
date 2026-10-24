import { useState } from 'react'
import type { BusinessSettings } from '../types'

export function SettingsPage({ settings, setSettings }: { settings: BusinessSettings; setSettings: (settings: BusinessSettings) => void }) {
  const [form, setForm] = useState(settings)

  function save() {
    setSettings(form)
  }

  return (
    <div className="card p-5">
      <h2 className="text-xl font-bold">Configurações</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} placeholder="Nome do negócio" className="rounded-xl border border-[#E7DED4] p-3" />
        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Telefone comercial" className="rounded-xl border border-[#E7DED4] p-3" />
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="E-mail" className="rounded-xl border border-[#E7DED4] p-3" />
        <input value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} placeholder="America/Sao_Paulo" className="rounded-xl border border-[#E7DED4] p-3" />
      </div>
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={save} className="tool-button bg-[#6F4E37] text-white hover:bg-[#5c3d2c]">Salvar configurações</button>
      </div>
    </div>
  )
}
