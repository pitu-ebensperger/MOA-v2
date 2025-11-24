import { useState, useEffect } from "react";
import { getStoreConfig } from "@/services/config.api.js";

const DEFAULT_CONFIG = {
  nombre_tienda: 'MOA',
  descripcion: 'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.',
  direccion: 'Providencia 1234, Santiago, Chile',
  telefono: '+56 2 2345 6789',
  email: 'hola@moastudio.cl',
  instagram_url: 'https://instagram.com/moastudio',
  facebook_url: 'https://facebook.com/moastudio',
  twitter_url: 'https://twitter.com/moastudio'
};

export const useStoreConfig = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await getStoreConfig();
        const payload = response?.data ?? response;
        if (payload) setConfig(payload);
      } catch (error) {
        console.error('Error al cargar configuración de la tienda:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  return { config, isLoading };
};
