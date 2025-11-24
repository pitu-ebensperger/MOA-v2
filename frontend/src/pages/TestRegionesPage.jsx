import { CascadingRegionComuna } from '@/components/forms/CascadingRegionComuna';
import { useState } from 'react';

/**
 * Página de prueba para verificar migración de useRegionesYComunas
 * 🎯 Prueba esto:
 * 1. Abre DevTools (icono flotante)
 * 2. Navega a /test-regiones
 * 3. Deberías ver query ['regiones'] en DevTools
 * 4. Selecciona una región
 * 5. Deberías ver query ['comunas', 'RM'] (o el código que selecciones)
 * 6. Refresca la página - debería cargar instantáneo (usa caché)
 */
export default function TestRegionesPage() {
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [regionName, setRegionName] = useState('');

  const handleRegionChange = (code, name) => {
    setRegion(code);
    setRegionName(name);
    console.log('✅ Región seleccionada:', { code, name });
  };

  const handleComunaChange = (name) => {
    setComuna(name);
    console.log('✅ Comuna seleccionada:', name);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">
            🧪 Test: TanStack Query - Regiones y Comunas
          </h1>
          
          <div className="mb-8 rounded-lg bg-blue-50 p-4">
            <h2 className="mb-2 font-semibold text-blue-900">
              📊 Cómo verificar que funciona:
            </h2>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-blue-800">
              <li>Abre el <strong>DevTools de React Query</strong> (icono flotante abajo a la derecha)</li>
              <li>Deberías ver la query <code className="rounded bg-blue-100 px-1">[&quot;regiones&quot;]</code></li>
              <li>Selecciona una región abajo</li>
              <li>Aparecerá query <code className="rounded bg-blue-100 px-1">[&quot;comunas&quot;, &quot;XX&quot;]</code></li>
              <li>Refresca la página (F5) - debería cargar <strong>instantáneo</strong> (usa caché)</li>
              <li>Mira la consola para ver logs de selección</li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">
              Formulario de Prueba
            </h3>
            
            <CascadingRegionComuna
              regionValue={region}
              comunaValue={comuna}
              onRegionChange={handleRegionChange}
              onComunaChange={handleComunaChange}
              required={true}
            />
          </div>

          {(region || comuna) && (
            <div className="rounded-lg bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">
                ✅ Valores seleccionados:
              </h3>
              <div className="space-y-1 text-sm text-green-800">
                {region && (
                  <p>
                    <strong>Región:</strong> {regionName} ({region})
                  </p>
                )}
                {comuna && (
                  <p>
                    <strong>Comuna:</strong> {comuna}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              🔧 Detalles Técnicos
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>
                <strong>Hook migrado:</strong> <code>useRegionesYComunas</code>
              </p>
              <p>
                <strong>Caché de regiones:</strong> 1 hora (datos estáticos)
              </p>
              <p>
                <strong>Caché de comunas:</strong> 30 minutos
              </p>
              <p>
                <strong>Query condicional:</strong> Comunas solo fetch si hay región seleccionada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
