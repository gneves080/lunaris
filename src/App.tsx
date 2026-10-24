import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
} from 'lucide-react'
import { useLocalData } from './hooks/useLocalData'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { readStorage, STORAGE_KEYS, writeStorage } from './utils/storage'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((module) => ({ default: module.OrdersPage })))
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((module) => ({ default: module.ProductsPage })))
const CustomersPage = lazy(() => import('./pages/CustomersPage').then((module) => ({ default: module.CustomersPage })))
const InventoryPage = lazy(() => import('./pages/InventoryPage').then((module) => ({ default: module.InventoryPage })))
const FinancePage = lazy(() => import('./pages/FinancePage').then((module) => ({ default: module.FinancePage })))
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/estoque', label: 'Estoque', icon: Warehouse },
  { to: '/financeiro', label: 'Financeiro', icon: CreditCard },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

function AppShell() {
  const [authed, setAuthed] = useState<boolean>(() => !isSupabaseConfigured && readStorage(STORAGE_KEYS.auth, false))
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const { products, customers, orders, inventory, settings, setProducts, setCustomers, setOrders, setInventory, setSettings, summary, dataReady, canUseData, syncError, retrySync } = useLocalData(authed, sessionUserId)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setAuthed(Boolean(data.session))
        setSessionUserId(data.session?.user.id ?? null)
        setAuthReady(true)
      }
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session))
      setSessionUserId(session?.user.id ?? null)
      setAuthReady(true)
    })
    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (authReady && !authed && location.pathname !== '/login') {
      navigate('/login', { replace: true })
    }
  }, [authReady, authed, location.pathname, navigate])

  const activeTitle = navItems.find((nav) => nav.to === location.pathname)?.label ?? 'Dashboard'

  async function onLogout() {
    if (supabase) await supabase.auth.signOut()
    writeStorage(STORAGE_KEYS.auth, false)
    setAuthed(false)
    navigate('/login', { replace: true })
  }

  const container = (
    <div className="min-h-screen bg-[#070707] text-[#f5efe7]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-[#2a211b] bg-[#0e0d0d] p-6 lg:flex lg:flex-col">
          <div className="mb-8 flex items-center justify-center">
            <img src="/lunaris-logo.jpg" alt="Lunaris logo" className="h-20 w-auto object-contain drop-shadow-[0_0_18px_rgba(212,175,102,0.35)]" />
          </div>
          <nav aria-label="Navegação principal" className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-[#1a1412] text-[#f3d7a1]' : 'text-[#d8cbb5] hover:bg-[#171311] hover:text-[#f3d7a1]'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-[#2a211b] bg-[#120f0d] p-4 shadow-[0_0_0_1px_rgba(212,175,102,0.15)]">
            <div className="text-xs uppercase tracking-[0.12em] text-[#c9b79b]">Negócio</div>
            <div className="mt-2 font-semibold text-[#f5efe7]">{settings.companyName}</div>
            <div className="mt-1 text-sm text-[#d8cbb5]">{settings.phone}</div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-[#2a211b] bg-[#0d0c0c]/90 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#d8cbb5]">Lunaris Gestão</p>
                <h1 className="brand-display mt-1 text-xl font-bold md:text-2xl">{activeTitle}</h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-[#3d3026] bg-[#17120f] px-3 py-2 text-sm font-medium text-[#f3d7a1] md:block">
                  Proprietária
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#3d3026] bg-[#17120f] px-3 py-2 text-sm font-medium text-[#f3d7a1]"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">
            {!dataReady && <div className="card mb-4 p-4 text-sm text-[#d8cbb5]" role="status">Conectando ao banco de dados...</div>}
            {syncError && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#6b3434] bg-[#251616] p-4 text-sm text-[#ffd0d0]" role="alert"><span>Falha na sincronização: {syncError}</span><button type="button" onClick={retrySync} className="rounded-lg border border-[#8f5555] px-3 py-2 font-medium hover:bg-[#351c1c]">Tentar novamente</button></div>}
            {dataReady && canUseData && <Suspense fallback={<div className="card p-5 text-sm text-[#d8cbb5]" role="status">Carregando...</div>}>
              <Routes>
                <Route path="/" element={<DashboardPage summary={summary} products={products} orders={orders} />} />
                <Route path="/pedidos" element={<OrdersPage orders={orders} customers={customers} products={products} setOrders={setOrders} />} />
                <Route path="/produtos" element={<ProductsPage products={products} setProducts={setProducts} />} />
                <Route path="/clientes" element={<CustomersPage customers={customers} setCustomers={setCustomers} />} />
                <Route path="/estoque" element={<InventoryPage inventory={inventory} setInventory={setInventory} />} />
                <Route path="/financeiro" element={<FinancePage orders={orders} inventory={inventory} />} />
                <Route path="/relatorios" element={<ReportsPage products={products} orders={orders} inventory={inventory} customers={customers} />} />
                <Route path="/configuracoes" element={<SettingsPage settings={settings} setSettings={setSettings} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>}
          </main>
          <nav aria-label="Navegação mobile" className="mobile-nav fixed inset-x-0 bottom-0 z-50 flex w-full max-w-[100vw] overflow-x-auto border-t border-[#2a211b] bg-[#0e0d0d]/95 px-2 pt-2 backdrop-blur-lg lg:hidden">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `flex w-[72px] flex-none flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium ${isActive ? 'text-[#f3d7a1]' : 'text-[#d8cbb5]'}`}
              >
                <Icon size={19} aria-hidden="true" />
                <span className="whitespace-nowrap">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )

  if (!authReady) return <div className="min-h-screen bg-[#070707]" role="status" aria-label="Verificando sessão" />
  return authed ? container : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<div className="min-h-screen bg-[#070707]" />}><LoginPage onLogin={() => writeStorage(STORAGE_KEYS.auth, true)} /></Suspense>} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  )
}
