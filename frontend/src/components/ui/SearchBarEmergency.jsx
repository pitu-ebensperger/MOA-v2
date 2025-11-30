// SEARCHBAR DE EMERGENCIA - SIN OVERLAY
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui"

export function SearchBarEmergency({
  isOpen,
  value,
  onChange,
  onSubmit,
  onClose,
  placeholder = '¿Qué estás buscando hoy?',
  buttonLabel = 'Buscar',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-50 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border p-4">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-neutral-400" />
          <form onSubmit={onSubmit} className="flex-1 flex gap-3">
            <input
              type="search"
              placeholder={placeholder}
              className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-base text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={onChange}
              autoFocus
            />
            <Button type="submit" size="sm">
              {buttonLabel}
            </Button>
          </form>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100"
            aria-label="Cerrar buscador"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}