import { Link, useLocation } from "react-router-dom";
import { API_PATHS } from "@/config/api-paths.js";

const navItems = [
  { label: "Dashboard", to: API_PATHS.admin.dashboard },
  { label: "Pedidos", to: API_PATHS.admin.orders },
  { label: "Productos", to: API_PATHS.admin.products },
  { label: "Categorías", to: API_PATHS.admin.categories },
  { label: "Clientes", to: API_PATHS.admin.customers },
  { label: "Configuraciones", to: API_PATHS.admin.settings },
];

// Sidebar de navegación para dashboard admin
export default function AdminSidebar() {
  const location = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-moa-neutral-100 p-6 flex flex-col border-r border-moa-neutral-200 overflow-y-auto">
      <h2 className="text-xl font-bold mb-8 text-moa-primary">Admin Panel</h2>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`text-moa-neutral-700 font-medium transition hover:text-moa-primary ${
              location.pathname.startsWith(item.to) ? "text-moa-primary" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
