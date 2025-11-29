import { useState } from 'react';
import { REGIONES, getComunasByRegion } from '../../../../shared/constants/ubicaciones.js';

export function CascadingRegionComuna({
  regionValue = '',
  comunaValue = '',
  onRegionChange,
  onComunaChange,
  disabled = false,
  required = true,
  errors = {},
}) {
  const [selectedRegion, setSelectedRegion] = useState(regionValue);
  
  const comunas = selectedRegion ? getComunasByRegion(selectedRegion) : [];

  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    const region = REGIONES.find((r) => r.codigo === regionCode);
    
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
          disabled={disabled}
          required={required}
          className={`
            mt-1 block w-full rounded-md border px-3 py-2 shadow-sm
            focus:border-indigo-500 focus:outline-none focus:ring-indigo-500
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${errors?.region ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <option value="">Selecciona una región</option>
          {REGIONES.map((region) => (
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
          disabled={disabled || !selectedRegion}
          required={required}
          className={`
            mt-1 block w-full rounded-md border px-3 py-2 shadow-sm
            focus:border-indigo-500 focus:outline-none focus:ring-indigo-500
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${errors?.comuna ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <option value="">
            {!selectedRegion ? 'Primero selecciona una región' : 'Selecciona una comuna'}
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
