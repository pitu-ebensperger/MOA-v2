import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { API_PATHS } from "@/config/app.routes.js";
import { useStoreConfig } from "@/hooks/useStoreConfig.js";

const HELP_LINKS = [
  { label: "Contacto", href: API_PATHS.support.contact },
  { label: "Preguntas frecuentes", href: API_PATHS.support.faq },
  { label: "Cambios y devoluciones", href: API_PATHS.support.returns },
];

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: API_PATHS.support.privacy },
  { label: "Términos y condiciones", href: API_PATHS.support.terms },
  { label: "Aviso legal", href: API_PATHS.support.legalNotice },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { config: storeConfig } = useStoreConfig();

  const SOCIAL_LINKS = [
    { label: "Instagram", href: storeConfig.instagram_url, icon: Instagram },
    { label: "Facebook", href: storeConfig.facebook_url, icon: Facebook },
    { label: "Twitter", href: storeConfig.twitter_url, icon: Twitter },
  ].filter(link => link.href); // Filtrar links vacíos

  const renderColumn = (title, links = []) => (
    <div className="space-y-4">
      <h4 className="text-base font-semibold text-neutral-800 mb-2">{title}</h4>
      <ul className="space-y-3">
        {links.map(({ label, href, external }) => (
          <li key={label}>
            {href ? (
              external ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-600 transition hover:text-primary1 hover:underline text-sm"
                >
                  {label}
                </a>
              ) : (
                <Link 
                  to={href} 
                  className="text-neutral-600 transition hover:text-primary1 hover:underline text-sm"
                >
                  {label}
                </Link>
              )
            ) : (
              <span className="text-neutral-400 text-sm">{label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-linear-to-b from-white via-neutral-50/50 to-neutral-100 text-sm text-neutral-600 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to={API_PATHS.home.landing} aria-label="Ir al inicio" className="inline-flex">
              <span className="text-xl font-serif tracking-tight text-primary1 mb-0">{storeConfig.nombre_tienda}</span>
            </Link>
            
            <p className="text-neutral-600 leading-relaxed">
              {storeConfig.descripcion}
            </p>

            {/* Social Links */}
            <div>
              <h4 className="text-base font-semibold text-neutral-800 mb-3">Síguenos</h4>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ label, href, icon }) => {
                  const IconComponent = icon;
                  return (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="group rounded-full border border-neutral-300 p-3 text-neutral-500 transition hover:border-primary1 hover:text-primary1 hover:bg-primary4/20"
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Empty Column */}
          <div></div>

          {/* Contact Section */}
          <div>
            <h4 className="text-base font-semibold text-neutral-800 mb-4">
              Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-neutral-600">
                <MapPin className="h-4 w-4 text-primary1 mt-0.5 shrink-0" />
                <span>{storeConfig.direccion}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-600">
                <Phone className="h-4 w-4 text-primary1 shrink-0" />
                <span>{storeConfig.telefono}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-600">
                <Mail className="h-4 w-4 text-primary1 shrink-0" />
                <span>{storeConfig.email}</span>
              </div>
            </div>
          </div>

          {/* Help Column */}
          <div>
            {renderColumn("Ayuda", HELP_LINKS)}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-neutral-200 flex flex-col gap-4 pt-8 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link key={label} to={href} className="hover:text-primary1 hover:underline">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <p>
              © {currentYear}{" "}
              <Link to="/" className="text-current font-medium hover:underline">
                {storeConfig.nombre_tienda} Studio
              </Link>{" "}
              · Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
