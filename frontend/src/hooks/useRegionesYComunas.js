import { useQuery } from '@/lib/react-query-lite';
import { useState } from 'react';

/**
 * Hook para manejar regiones y comunas de Chile con TanStack Query
 * ✅ Caché automático (regiones no cambian frecuentemente)
 * ✅ Sin useState/useEffect innecesarios
 * ✅ Mejor manejo de errores
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Función para fetch de regiones
const fetchRegiones = async () => {
  const response = await fetch(`${API_BASE}/api/regiones`);
  if (!response.ok) throw new Error('Error al cargar regiones');
  const data = await response.json();
  return data.data || [];
};

// Función para fetch de comunas
const fetchComunas = async (regionCode) => {
  const response = await fetch(`${API_BASE}/api/regiones/${regionCode}/comunas`);
  if (!response.ok) throw new Error('Error al cargar comunas');
  const data = await response.json();
  return data.data?.comunas || [];
};

export function useRegionesYComunas() {
  const [selectedRegion, setSelectedRegion] = useState('');

  // Query de regiones (caché de 1 hora - datos estáticos)
  const regionesQuery = useQuery({
    queryKey: ['regiones'],
    queryFn: fetchRegiones,
    staleTime: 60 * 60 * 1000, // 1 hora - regiones no cambian
    cacheTime: 24 * 60 * 60 * 1000, // 24 horas en memoria
  });

  // Query de comunas (solo si hay región seleccionada)
  const comunasQuery = useQuery({
    queryKey: ['comunas', selectedRegion],
    queryFn: () => fetchComunas(selectedRegion),
    enabled: Boolean(selectedRegion), // Solo fetch si hay región
    staleTime: 30 * 60 * 1000, // 30 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
  });

  return {
    // Regiones
    regiones: regionesQuery.data ?? [],
    loadingRegiones: regionesQuery.isLoading,
    
    // Comunas
    comunas: comunasQuery.data ?? [],
    loadingComunas: comunasQuery.isLoading,
    
    // Control de región
    selectedRegion,
    setSelectedRegion,
    
    // Estados combinados
    error: regionesQuery.error || comunasQuery.error,
    isLoading: regionesQuery.isLoading || comunasQuery.isLoading,
  };
}
