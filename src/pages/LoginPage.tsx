import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loginSchema, type LoginFormValues } from '../schemas/auth'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { STORAGE_KEYS, writeStorage } from '../utils/storage'

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: isSupabaseConfigured
      ? { email: '', password: '' }
      : { email: 'admin@lunaris.com.br', password: 'lunaris123' },
  })

  async function onSubmit(values: LoginFormValues) {
    setAuthError('')
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password })
      if (error) {
        const message = error.message.toLowerCase()
        if (message.includes('email not confirmed')) {
          setAuthError('O e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou confirme o usuário em Supabase > Authentication > Users.')
        } else if (message.includes('invalid login credentials')) {
          setAuthError('E-mail ou senha não conferem. Use exatamente os dados do usuário criado em Supabase > Authentication > Users. Se acabou de criar a conta, confirme o e-mail antes de entrar.')
        } else if (message.includes('invalid api key') || message.includes('apikey')) {
          setAuthError('A chave pública configurada na Vercel parece inválida. Confira VITE_SUPABASE_ANON_KEY e faça um novo deploy.')
        } else if (message.includes('failed to fetch') || message.includes('network')) {
          setAuthError('Não foi possível conectar ao Supabase. Confira VITE_SUPABASE_URL, as configurações de rede e faça um novo deploy na Vercel.')
        } else {
          setAuthError(`Falha ao entrar: ${error.message}`)
        }
        return
      }
    } else if (values.email !== 'admin@lunaris.com.br' || values.password !== 'lunaris123') {
      setAuthError('No modo de demonstração, use admin@lunaris.com.br e lunaris123.')
      return
    }

    writeStorage(STORAGE_KEYS.auth, true)
    onLogin()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070707] p-3 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#2a211b] bg-[#0f0d0c] shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:rounded-[32px] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(212,175,102,0.2),transparent_40%)] p-5 sm:p-8 md:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,102,0.08),transparent_45%,rgba(255,255,255,0.02))]" />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#3d3026] bg-[#140f0d] px-3 py-1.5 text-sm font-medium text-[#f3d7a1]">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3d7a1] text-xs font-bold text-[#0d0c0c]">L</span>
              Lunaris Gestão
            </div>
            <img src="/lunaris-logo.jpg" alt="Lunaris logo" decoding="async" className="mx-auto w-full max-w-xl drop-shadow-[0_0_26px_rgba(212,175,102,0.35)]" />
            <h1 className="brand-display mt-6 text-center text-3xl font-bold text-[#f4e6cc] sm:mt-8 sm:text-4xl md:text-5xl">
              Seu negócio organizado, seu crescimento em movimento.
            </h1>
            <p className="mt-4 text-center text-base text-[#d8cbb5]">
              Centralize pedidos, estoque, produção, financeiro e entregas em uma operação simples e profissional.
            </p>
          </div>
        </div>

        <div className="bg-[#120f0d] p-5 sm:p-8 md:p-10">
          <h2 className="brand-display text-3xl font-bold text-[#f3d7a1]">Acessar painel</h2>
          <p className="mt-2 text-sm text-[#d8cbb5]">Entre com suas credenciais autorizadas.</p>
          {!isSupabaseConfigured && <p className="mt-3 rounded-lg border border-[#3d3026] bg-[#17120f] p-3 text-xs text-[#d8cbb5]">Modo demonstração local: admin@lunaris.com.br / lunaris123</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#f4e6cc]">E-mail</label>
              <div className="flex items-center gap-3 rounded-xl border border-[#3d3026] bg-[#17120f] px-3 py-2.5">
                <Mail size={18} className="text-[#f3d7a1]" />
                <input {...register('email')} className="w-full border-0 bg-transparent text-[#f8f3ee] outline-none placeholder:text-[#b8a995]" placeholder="admin@lunaris.com.br" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-[#ff9d9d]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#f4e6cc]">Senha</label>
              <div className="flex items-center gap-3 rounded-xl border border-[#3d3026] bg-[#17120f] px-3 py-2.5">
                <Lock size={18} className="text-[#f3d7a1]" />
                <input type="password" {...register('password')} className="w-full border-0 bg-transparent text-[#f8f3ee] outline-none placeholder:text-[#b8a995]" placeholder="••••••••" />
              </div>
              {errors.password && <p className="mt-1 text-sm text-[#ff9d9d]">{errors.password.message}</p>}
            </div>

            {authError && <p className="text-sm text-[#ff9d9d]" role="alert">{authError}</p>}

            <button type="submit" disabled={isSubmitting} className="tool-button w-full bg-[#f3d7a1] text-[#120f0d] hover:bg-[#e9c986] disabled:opacity-70">
              Entrar
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
