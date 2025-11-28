import { useState } from "react";
import { METODOS_DESPACHO } from "@/utils/orderTracking.js"
import { Price } from "@/components/data-display/Price.jsx"
import { Label } from "@/components/ui/primitives";
import { Card } from "@/components/ui/primitives";
import { Check } from "lucide-react";

/**
 * Selector de método de despacho para checkout
 * Muestra opciones con precios, iconos y descripciones
 */
export default function ShippingMethodSelector({ 
  value, 
  onChange, 
  className = "" 
}) {
  const [selectedMethod, setSelectedMethod] = useState(value || 'standard');

  const handleChange = (newValue) => {
    setSelectedMethod(newValue);
    if (onChange) {
      const metodo = METODOS_DESPACHO[newValue];
      onChange(newValue, metodo);
    }
  };

  return (
    <div className={className}>
      <Label required className="mb-3 block normal-case tracking-normal text-sm font-medium text-(--color-primary2)">
        Método de despacho*
      </Label>
      
      <div className="space-y-3">
        {Object.values(METODOS_DESPACHO).map((metodo) => {
          const IconComponent = metodo.icono;
          const isSelected = selectedMethod === metodo.value;
          const isFree = metodo.precio === 0;

          return (
            <Card
              key={metodo.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-2 border-(--color-primary1) shadow-md ring-2 ring-(--color-primary1)/20' 
                  : 'border border-(--border)'
              }`}
              onClick={() => handleChange(metodo.value)}
            >
              <div className="flex items-start gap-4 p-4">
                {/* Radio button */}
                <input 
                  type="radio"
                  value={metodo.value} 
                  id={metodo.value}
                  name="metodo_despacho"
                  checked={isSelected}
                  onChange={() => handleChange(metodo.value)}
                  className="mt-1 w-4 h-4 cursor-pointer"
                />
                  
                  {/* Ícono */}
                  <div className={`rounded-full p-3 ${
                    isSelected 
                      ? 'bg-(--color-primary1)/10 text-(--color-primary1)' 
                      : 'bg-(--color-lightest) text-(--color-text-muted)'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <label 
                          htmlFor={metodo.value}
                          className="cursor-pointer font-semibold text-(--color-primary2)"
                        >
                          {metodo.label}
                        </label>
                        <p className="mt-1 text-sm text-(--color-text-secondary)">
                          {metodo.descripcion}
                        </p>
                      </div>
                      
                      {/* Precio */}
                      <div className="text-right">
                        {isFree ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary4) px-2 py-1 text-xs font-semibold text-(--color-primary1)">
                            <Check className="h-3 w-3" />
                            Gratis
                          </span>
                        ) : (
                          <Price 
                            value={metodo.precio} 
                            className="text-base font-semibold text-(--color-primary1)"
                          />
                        )}
                      </div>
                    </div>

                    {/* Información adicional para retiro */}
                    {metodo.value === 'retiro' && isSelected && (
                      <div className="mt-3 rounded-lg bg-(--color-lightest) p-3 text-sm border border-(--border)">
                        <p className="font-medium text-(--color-primary2)">
                          📍 {metodo.direccion}
                        </p>
                        <p className="mt-1 text-(--color-text-secondary)">
                          🕐 {metodo.horario}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
          );
        })}
      </div>
      
      {/* Información adicional */}
      <div className="mt-4 rounded-lg bg-(--color-text-secondary) p-4 text-sm text-white">
        <p>
          <strong>Nota:</strong> Los tiempos de entrega son estimados en días hábiles 
          (no incluyen fines de semana). Te notificaremos por email y WhatsApp 
          cuando tu pedido esté listo.
        </p>
      </div>
    </div>
  );
}
