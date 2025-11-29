import { useCallback, useRef } from 'react'

export const usePrefetch = () => {
  const prefetchedModulesRef = useRef(new Set())

  const prefetch = useCallback((importFn) => {
    const moduleKey = importFn.toString()
    const prefetchedModules = prefetchedModulesRef.current
    
    // Evitar cargar el mismo módulo múltiples veces
    if (prefetchedModules.has(moduleKey)) {
      return
    }

    prefetchedModules.add(moduleKey)
    
    // Precargar el módulo
    importFn().catch((error) => {
      console.warn('Error precargando módulo:', error)
      prefetchedModules.delete(moduleKey)
    })
  }, [prefetchedModulesRef])

  return prefetch
}
