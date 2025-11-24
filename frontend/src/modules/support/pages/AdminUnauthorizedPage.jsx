import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button.jsx";
import { API_PATHS } from "@/config/api-paths.js";

const MESSAGES = {
  auth: {
    title: "Acceso protegido",
    description:
      "Debes iniciar sesión con una cuenta de administrador para ver esta área.",
    actionLabel: "Ir al login",
    actionTo: API_PATHS.auth.login,
  },
  role: {
    title: "Sin permisos",
    description:
      "Tu sesión no tiene privilegios administrativos. Si crees que esto es un error, contacta al soporte.",
    actionLabel: "Volver al inicio",
    actionTo: API_PATHS.home.landing,
  },
};

export default function AdminUnauthorizedPage({ type = "auth", state }) {
  const message = MESSAGES[type] ?? MESSAGES.auth;

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-neutral1) px-4 py-16">
      <section className="w-full max-w-2xl rounded-3xl border border-(--color-border) bg-white p-10 text-center shadow-[var(--shadow-high)]">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--text-muted)">Acceso restringido</p>
        <h1 className="mt-3 text-3xl font-semibold text-(--text-strong)">{message.title}</h1>
        <p className="mt-4 text-base text-(--text-secondary1) leading-relaxed">
          {message.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            as={Link}
            to={message.actionTo}
            state={state}
            appearance="solid"
            intent="primary"
            className="!px-6"
          >
            {message.actionLabel}
          </Button>
          {type === "auth" && (
            <Button as={Link} to={API_PATHS.home.landing} appearance="ghost" intent="neutral" className="!px-6">
              Volver al sitio
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
