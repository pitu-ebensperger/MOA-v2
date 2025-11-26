import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "@components/ui/Button.jsx";
import { TooltipNeutral } from "@components/ui/Tooltip.jsx";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  Settings,
  Layers,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_PATHS } from "@config/api-paths.js";

const navItems = [
  { label: "Resumen", to: API_PATHS.admin.dashboard, icon: LayoutDashboard },
  { label: "Pedidos", to: API_PATHS.admin.orders, icon: Package },
  { label: "Productos", to: API_PATHS.admin.products, icon: Warehouse },
  { label: "Categorías", to: API_PATHS.admin.categories, icon: Layers },
  { label: "Clientes", to: API_PATHS.admin.customers, icon: Users },
  { label: "Ajustes", to: API_PATHS.admin.settings, icon: Settings },
];


export default function EntornoAdmin({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isExpanded, setIsExpanded] = useState(true);
  const handleLogout = () => {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      globalThis.localStorage.removeItem("moa.accessToken");
      globalThis.localStorage.removeItem("moa.user");
      globalThis.location.href = API_PATHS.auth.login;
    }
  };

  // Cargar preferencia desde localStorage
  useEffect(() => {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      const raw = globalThis.localStorage.getItem("moa.admin.sidebarExpanded");
      if (raw != null) setIsExpanded(raw === "true");
    }
  }, []);

  // Persistir preferencia
  useEffect(() => {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      globalThis.localStorage.setItem("moa.admin.sidebarExpanded", String(isExpanded));
    }
  }, [isExpanded]);

  // Importar estilos de admin
  useEffect(() => {
    import("../../../styles/admin.css");
  }, []);

  return (
    <div className="admin-shell admin-page min-h-screen max-h-screen overflow-hidden bg-(--background) text-body" data-admin-context>
      <header className="h-0" />

      <div className="flex min-h-screen max-h-screen relative items-stretch h-full">
        <aside
          className={`${isExpanded ? "w-56" : "w-20"} sticky top-0 self-start flex flex-col items-center h-full min-h-screen bg-white border-r border-neutral-100 py-5 px-2.5 transition-[width,padding] duration-400 ease-in-out`}
        >
          <div className="mb-5 w-full grid grid-cols-3 items-center">
            <div />

            <a href={API_PATHS.admin.dashboard} className="justify-self-center flex items-center gap-2" title="MOA Admin">
              {isExpanded ? (
                <>
                  <span className="title-serif text-primary text-xl font-semibold tracking-tight">MOA</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-secondary">Admin</span>
                </>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center title-serif text-primary text-xl font-semibold tracking-tight">
                  M
                </span>
              )}
            </a>

            {isExpanded && (
              <div className="justify-self-end">
                <Button
                  appearance="ghost"
                  size="sm"
                  onClick={() => setIsExpanded((v) => !v)}
                  className="h-8 w-8 rounded-full p-0 hover:bg-neutral-100 transition-colors flex items-center justify-center"
                  aria-label="Contraer"
                >
                  <ChevronLeft className="h-4 w-4 text-secondary" />
                </Button>
              </div>
            )}
          </div>

          {/* Botón toggle fuera del sidebar en modo compacto */}
          {!isExpanded && (
            <div className="absolute top-5 -right-3 z-10">
              <TooltipNeutral label="Expandir" position="right">
                <Button
                  appearance="ghost"
                  size="sm"
                  onClick={() => setIsExpanded((v) => !v)}
                  className="rounded-full p-1.5 bg-white border border-neutral-200 shadow-md hover:bg-neutral-100 hover:border-primary transition-colors"
                  aria-label="Expandir"
                >
                  <ChevronRight className="h-4 w-4 text-primary" />
                </Button>
              </TooltipNeutral>
            </div>
          )}

          {/* Contenedor scrollable de navegación */}
          <div className="flex-1 flex flex-col w-full">
            <div className="flex-1 w-full overflow-y-auto overflow-x-visible">
              {/* Navegación principal */}
              <nav className="flex flex-col gap-2 mb-4 items-stretch w-full">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isDashboard = item.to === API_PATHS.admin.dashboard;
                  const isActive = isDashboard ? currentPath === item.to : currentPath.startsWith(item.to);
                  const linkNode = (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`sidebar-link rounded-lg flex items-center ${isExpanded ? "w-full pl-3 pr-2 py-2.5" : "w-full px-2.5 py-2.5 justify-center"} text-xs font-medium transition-colors duration-200 ${isActive ? "bg-neutral-100 text-primary border-r-4 border-primary" : "text-neutral-700 hover:text-primary hover:bg-neutral-50"}`}
                      aria-label={!isExpanded ? item.label : undefined}
                    >
                      {isExpanded ? (
                        <span className="flex items-center gap-2">
                          {Icon && (
                            <span className="flex items-center justify-center w-5 shrink-0">
                              <Icon className="h-5 w-5 stroke-[1.5] text-primary" aria-hidden />
                            </span>
                          )}
                          <span className="text-xs text-left">{item.label}</span>
                        </span>
                      ) : (
                        Icon && (
                          <span className="flex items-center justify-center w-5">
                            <Icon className="h-5 w-5 stroke-[1.5] text-primary" aria-hidden />
                          </span>
                        )
                      )}
                    </Link>
                  );

                  return isExpanded ? (
                    linkNode
                  ) : (
                    <TooltipNeutral key={item.to} label={item.label} position="right">
                      {linkNode}
                    </TooltipNeutral>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-neutral-200 px-2.5 py-4 flex flex-col gap-3">
              {isExpanded ? (
                <Link
                  to={API_PATHS.home.landing}
                  className="sidebar-link rounded-lg flex items-center w-full pl-3 pr-2 py-2.5 text-xs font-medium transition-colors duration-200 text-neutral-700 hover:text-primary hover:bg-neutral-50"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 shrink-0">
                      <Store className="h-5 w-5 stroke-[1.5] text-primary" aria-hidden />
                    </span>
                    <span className="text-xs text-left">Visitar tienda</span>
                  </span>
                </Link>
              ) : (
                <TooltipNeutral label="Visitar tienda" position="right">
                  <Link
                    to={API_PATHS.home.landing}
                    className="sidebar-link rounded-lg flex items-center justify-center w-full px-2.5 py-2.5 text-xs font-medium transition-colors duration-200 text-neutral-700 hover:text-primary hover:bg-neutral-50"
                    aria-label="Visitar tienda"
                  >
                    <span className="flex items-center justify-center w-5">
                      <Store className="h-5 w-5 stroke-[1.5] text-primary" aria-hidden />
                    </span>
                  </Link>
                </TooltipNeutral>
              )}

              {isExpanded ? (
                <button
                  type="button"
                  className="sidebar-link rounded-lg flex items-center w-full pl-3 pr-2 py-2.5 text-xs font-medium transition-colors duration-200 text-neutral-700 hover:text-primary hover:bg-neutral-50"
                  onClick={handleLogout}
                >
                  <span className="btn-label flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 shrink-0">
                      <LogOut className="h-5 w-5 stroke-[1.5] text-primary" aria-hidden />
                    </span>
                    <span className="text-xs text-left">Cerrar sesión</span>
                  </span>
                </button>
              ) : (
                <TooltipNeutral label="Cerrar sesión" position="right">
                  <button
                    type="button"
                    className="sidebar-link rounded-lg flex items-center justify-center w-full px-2.5 py-2.5 text-xs font-medium transition-colors duration-200 text-neutral-700 hover:text-primary hover:bg-neutral-50"
                    aria-label="Cerrar sesión"
                    onClick={handleLogout}
                  >
                    <span className="flex items-center justify-center w-5">
                      <LogOut className="h-5 w-5 stroke-[1.5] text-primary" aria-hidden />
                    </span>
                  </button>
                </TooltipNeutral>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-8 bg-(--background) max-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

EntornoAdmin.propTypes = {
  children: PropTypes.node,
};
