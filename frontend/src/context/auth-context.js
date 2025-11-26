import { createStrictContext } from "@/context/createStrictContext.js"

// Context aislado de componentes para cumplir la regla react-refresh/only-export-components
// Hook generado por createStrictContext que valida que el hook se use dentro del provider
export const [AuthContext, useAuth] = createStrictContext("Auth", {
  displayName: "AuthContext",
  errorMessage: "useAuth debe usarse dentro de AuthProvider",
});

const normalizeRoleValue = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : ""

const ADMIN_ROLE_ALIASES = new Set(["admin", "administrador"])
const DEMO_ADMIN_EMAILS = new Set(["demo@moa.cl", "demo@moal.cl"]);

// Design bypass: emails que pueden forzar acceso admin + vista cliente sin relogin
// Se leen de variable Vite `VITE_DESIGN_BYPASS_EMAILS` (coma separada)
let DESIGN_BYPASS_EMAILS = new Set();
try {
  const raw = import.meta.env?.VITE_DESIGN_BYPASS_EMAILS;
  if (raw && typeof raw === 'string') {
    DESIGN_BYPASS_EMAILS = new Set(raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean));
  }
} catch {
  // Silenciar errores de acceso a import.meta.env en tests
}

// Utilidad: detectar rol admin con campo estandarizado
export const isAdminRole = (user) => {
  if (!user) return false;
  const emailValue = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
  if (emailValue && (DEMO_ADMIN_EMAILS.has(emailValue) || DESIGN_BYPASS_EMAILS.has(emailValue))) {
    return true;
  }
  // Leer solo del campo estandarizado rol_code
  const roleValue = normalizeRoleValue(user?.rol_code ?? user?.role_code ?? "");
  return ADMIN_ROLE_ALIASES.has(roleValue);
};

// Flag derivado adicional para vistas: usuario con bypass de diseño
export const isDesignBypassUser = (user) => {
  if (!user) return false;
  const emailValue = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  return emailValue && DESIGN_BYPASS_EMAILS.has(emailValue);
};
