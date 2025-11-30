import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone } from "lucide-react";
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from "@/components/ui";
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validatePhone, 
  validatePasswordMatch 
} from '@/utils/validation';

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  // estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // control de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validaciones usando utilidades centralizadas
    const nextErrors = {};
    
    // Validar nombre
    const nameValidation = validateName(formData.name, 3);
    if (!nameValidation.valid) {
      nextErrors.name = nameValidation.error;
    }
    
    // Validar email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      nextErrors.email = emailValidation.error;
    }
    
    // Validar teléfono
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      nextErrors.phone = phoneValidation.error;
    }
    
    // Validar password con requisitos de letras y números
    const passwordValidation = validatePassword(formData.password, {
      minLength: 6,
      requireLetters: true,
      requireNumbers: true
    });
    if (!passwordValidation.valid) {
      nextErrors.password = passwordValidation.error;
    }
    
    // Validar confirmación
    const matchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!matchValidation.valid) {
      nextErrors.confirmPassword = matchValidation.error;
    }
    
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      if (typeof onRegister === 'function') {
        // callback externo para. tests, mocks
        await onRegister(formData);
      } else if (registerUser) {
        // usar register del AuthContext
        await registerUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
      }
      // redirigir al login con estado de registro exitoso
      navigate('/login', { state: { registered: true, userName: formData.name } });
    } catch (err) {
      setError(err?.message || 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="min-h-[calc(100vh-100px)] grid place-items-center px-6 py-12  animate-[fade-in_var(--transition-base,300ms)_both]">
        <div className="w-full max-w-md">
          <div className="bg-white/75 rounded-xl shadow-sm p-8 animate-[slide-up_var(--transition-slow,500ms)_both]">
            <h1 className="text-center text-3xl font-semibold text-(--color-primary1) font-[var(--font-display,inherit)]">
              Crear Cuenta
            </h1>
            <p className="mt-1 text-center text-sm text-muted font-[var(--font-secondary,inherit)]">
               
            </p>

            {/* Error simple */}
            {error && (
              <div className="mt-4 rounded-md border border-[#cc5f49] bg-[#cc5f49]/10 px-3 py-2 text-sm text-[#cc5f49]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              {/* Nombre */}
              <div className="grid gap-2">
                <label htmlFor="name" className="inline-flex items-center gap-2 text-sm font-medium text-(--color-primary1)">
                  <UserIcon size={18} />
                  Nombre Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    handleChange(e);
                    if (fieldErrors.name) setFieldErrors(prev => ({...prev, name: ''}));
                  }}
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  className={`w-full rounded-md border px-3 py-2 text-(--color-primary1) outline-none transition focus:ring-2 ${
                    fieldErrors.name
                      ? 'border-[#cc5f49] focus:border-[#cc5f49] focus:ring-[#cc5f49]/20'
                      : 'border-[var(--color-border,#e5e7eb)] focus:border-[var(--color-primary1,#6B5444)] focus:ring-[rgba(68,49,20,0.15)]'
                  }`}
                />
                {fieldErrors.name && (
                  <p id="name-error" className="text-sm text-[#cc5f49] mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <label htmlFor="email" className="inline-flex items-center gap-2 text-sm font-medium text-(--color-primary1)">
                  <Mail size={18} />
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleChange(e);
                    if (fieldErrors.email) setFieldErrors(prev => ({...prev, email: ''}));
                  }}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className={`w-full rounded-md border px-3 py-2 text-(--color-primary1) outline-none transition focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-[#cc5f49] focus:border-[#cc5f49] focus:ring-[#cc5f49]/20'
                      : 'border-[var(--color-border,#e5e7eb)] focus:border-[var(--color-primary1,#6B5444)] focus:ring-[rgba(68,49,20,0.15)]'
                  }`}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="text-sm text-[#cc5f49] mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="grid gap-2">
                <label htmlFor="phone" className="inline-flex items-center gap-2 text-sm font-medium text-(--color-primary1)">
                  <Phone size={18} />
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    handleChange(e);
                    if (fieldErrors.phone) setFieldErrors(prev => ({...prev, phone: ''}));
                  }}
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                  className={`w-full rounded-md border px-3 py-2 text-(--color-primary1) outline-none transition focus:ring-2 ${
                    fieldErrors.phone
                      ? 'border-[#cc5f49] focus:border-[#cc5f49] focus:ring-[#cc5f49]/20'
                      : 'border-[var(--color-border,#e5e7eb)] focus:border-[var(--color-primary1,#6B5444)] focus:ring-[rgba(68,49,20,0.15)]'
                  }`}
                />
                {fieldErrors.phone && (
                  <p id="phone-error" className="text-sm text-[#cc5f49] mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <label htmlFor="password" className="inline-flex items-center gap-2 text-sm font-medium text-(--color-primary1)">
                  <Lock size={18} />
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    handleChange(e);
                    if (fieldErrors.password) setFieldErrors(prev => ({...prev, password: ''}));
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  className={`w-full rounded-md border px-3 py-2 text-(--color-primary1) outline-none transition focus:ring-2 ${
                    fieldErrors.password
                      ? 'border-[#cc5f49] focus:border-[#cc5f49] focus:ring-[#cc5f49]/20'
                      : 'border-[var(--color-border,#e5e7eb)] focus:border-[var(--color-primary1,#6B5444)] focus:ring-[rgba(68,49,20,0.15)]'
                  }`}
                />
                {fieldErrors.password && (
                  <p id="password-error" className="text-sm text-[#cc5f49] mt-1">{fieldErrors.password}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">Mínimo 6 caracteres, debe incluir letras y números</p>
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <label htmlFor="confirmPassword" className="inline-flex items-center gap-2 text-sm font-medium text-(--color-primary1)">
                  <Lock size={18} />
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    handleChange(e);
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({...prev, confirmPassword: ''}));
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  className={`w-full rounded-md border px-3 py-2 text-(--color-primary1) outline-none transition focus:ring-2 ${
                    fieldErrors.confirmPassword
                      ? 'border-[#cc5f49] focus:border-[#cc5f49] focus:ring-[#cc5f49]/20'
                      : 'border-[var(--color-border,#e5e7eb)] focus:border-[var(--color-primary1,#6B5444)] focus:ring-[rgba(68,49,20,0.15)]'
                  }`}
                />
                {fieldErrors.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-[#cc5f49] mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Botón */}
              <div className='flex flex-col items-center justify-center w-full'>
                <Button
                  type="submit"
                  shape="pill"
                  motion="lift"
                  className="font-regular px-5 mt-2 mb-0 mx-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Creando cuenta…' : 'Registrarse'}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 border-t border-[var(--color-border-light,#f0f2f5)] pt-6 text-center">
              <p className="text-sm text-[var(--color-text-secondary,#4b5563)]">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
          className="font-semibold underline text-[var(--color-primary1,#6B5444)] hover:opacity-90"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
