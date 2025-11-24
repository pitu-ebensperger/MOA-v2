import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock } from "lucide-react"
import { resetPassword } from '@/services/auth.api.js'
import { API_PATHS } from '@/config/api-paths.js'
import { toast, confirm } from '@/components/ui'
import { validatePassword, validatePasswordMatch } from '@/utils/validation';

export default function ResetPasswordPage(){
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') // cambiar a useParams()???

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Link inválido o incompleto', { title: 'Token faltante' })
      setTimeout(() => navigate(API_PATHS.auth.forgot), 2000)
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    // Validaciones usando utilidades centralizadas
    const passwordValidation = validatePassword(password, { minLength: 8 });
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.error, { title: 'Contraseña inválida' });
      return;
    }
    
    const matchValidation = validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.valid) {
      toast.error(matchValidation.error, { title: 'No coincide' });
      return;
    }

    setLoading(true)
    try {
      await resetPassword({ token, password })
      await confirm.info(
        'Contraseña restablecida',
        'Ahora puedes iniciar sesión con tu nueva contraseña.'
      )
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Intenta nuevamente', { title: 'No se pudo restablecer' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] grid place-items-center px-6 py-12 bg-linear-to-br from-(--color-light-beige,#f6efe7) to-(--color-beige,#e9dccb)">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-center text-3xl font-semibold text-(--color-text-primary,#1f1f1f)">
            Restablecer contraseña
          </h1>
          <p className="mt-1 text-center text-sm text-(--color-text-muted,#6b7280)">
            Crea una nueva contraseña para tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {/* Nueva contraseña */}
            <div className="grid gap-2">
              <label htmlFor="password" className="inline-flex items-center gap-2 text-sm font-medium">
                <Lock size={18} /> Nueva contraseña
              </label>
              <input
                id="password" name="password" type="password"
                value={password} onChange={(e)=>setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full rounded-md border border-(--color-border,#e5e7eb) px-3 py-2 outline-none focus:border-(--color-primary1,#6B5444) focus:ring-2 focus:ring-[rgba(68,49,20,0.15)]"
              />
              <p className="text-xs text-(--color-text-secondary,#4b5563)">Mínimo 8 caracteres.</p>
            </div>

            {/* Confirmación */}
            <div className="grid gap-2">
              <label htmlFor="confirm" className="inline-flex items-center gap-2 text-sm font-medium">
                <Lock size={18} /> Confirmar contraseña
              </label>
              <input
                id="confirm" name="confirm" type="password"
                value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full rounded-md border border-(--color-border,#e5e7eb) px-3 py-2 outline-none focus:border-(--color-primary1,#6B5444) focus:ring-2 focus:ring-[rgba(68,49,20,0.15)]"
              />
            </div>

            <button
              type="submit" disabled={loading || !token}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-(--color-primary1,#6B5444) px-4 py-2 font-semibold text-white shadow-sm transition hover:brightness-105 hover:-translate-y-0.5 active:translate-y-px disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
