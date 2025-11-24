import { useRegionesYComunas } from '@/hooks/useRegionesYComunas';

/**
 * @param {Object} props
 * @param {string} props.regionValue - Código de región seleccionado
 * @param {string} props.comunaValue - Nombre de comuna seleccionada
 * @param {function} props.onRegionChange - Callback cuando cambia región (regionCode, regionName)
 * @param {function} props.onComunaChange - Callback cuando cambia comuna (comunaName)
 * @param {boolean} props.disabled - Deshabilitar los selects
 * @param {boolean} props.required - Marcar campos como requeridos
 * @param {Object} props.errors - Errores de validación { region, comuna }
 */
export function CascadingRegionComuna({
  regionValue = '',
  comunaValue = '',
  onRegionChange,
  onComunaChange,
  disabled = false,
  required = true,
  errors = {},
}) {
  const {
    regiones,
    comunas,
    selectedRegion,
    setSelectedRegion,
    loadingRegiones,
    loadingComunas,
    error,
  } = useRegionesYComunas();

  // Sincronizar región interna con prop externa
  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    const region = regiones.find((r) => r.codigo === regionCode);
    
    setSelectedRegion(regionCode);
    
    if (onRegionChange) {
      onRegionChange(regionCode, region?.nombre || '');
    }
    
    // Reset comuna cuando cambia región
    if (onComunaChange) {
      onComunaChange('');
    }
  };

  const handleComunaChange = (e) => {
    const comunaName = e.target.value;
    
    if (onComunaChange) {
      onComunaChange(comunaName);
    }
  };

  // Sincronizar con valor externo al montar
  if (regionValue && regionValue !== selectedRegion) {
    setSelectedRegion(regionValue);
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Error cargando datos de ubicación: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Select de Región */}
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700">
          Región {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="region"
          name="region"
          value={regionValue || selectedRegion}
          onChange={handleRegionChange}
          disabled={disabled || loadingRegiones}
          required={required}
          className={`
            mt-1 block w-full rounded-md border px-3 py-2 shadow-sm
            focus:border-indigo-500 focus:outline-none focus:ring-indigo-500
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${errors?.region ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <option value="">
            {loadingRegiones ? 'Cargando regiones...' : 'Selecciona una región'}
          </option>
          {regiones.map((region) => (
            <option key={region.codigo} value={region.codigo}>
              {region.nombre}
            </option>
          ))}
        </select>
        {errors?.region && (
          <p className="mt-1 text-sm text-red-600">{errors.region}</p>
        )}
      </div>

      {/* Select de Comuna (deshabilitado si no hay región) */}
      <div>
        <label htmlFor="comuna" className="block text-sm font-medium text-gray-700">
          Comuna {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="comuna"
          name="comuna"
          value={comunaValue}
          onChange={handleComunaChange}
          disabled={disabled || !selectedRegion || loadingComunas}
          required={required}
          className={`
            mt-1 block w-full rounded-md border px-3 py-2 shadow-sm
            focus:border-indigo-500 focus:outline-none focus:ring-indigo-500
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${errors?.comuna ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <option value="">
            {!selectedRegion
              ? 'Primero selecciona una región'
              : loadingComunas
              ? 'Cargando comunas...'
              : 'Selecciona una comuna'}
          </option>
          {comunas.map((comuna) => (
            <option key={comuna} value={comuna}>
              {comuna}
            </option>
          ))}
        </select>
        {errors?.comuna && (
          <p className="mt-1 text-sm text-red-600">{errors.comuna}</p>
        )}
      </div>
    </div>
  );
}
