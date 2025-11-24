import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context'
import { AddressContext } from './address-context-state.js'
import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from '@/services/address.api';

export const AddressProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddressState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar direcciones desde el backend
   */
  const loadAddresses = useCallback(async () => {
    if (!user || !token) {
      setAddresses([]);
      setDefaultAddressState(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getAddresses();
      setAddresses(data);
      
      // Encontrar dirección predeterminada
      const defaultAddr = data.find(addr => addr.predeterminada);
      setDefaultAddressState(defaultAddr || null);
    } catch (err) {
      console.error('Error cargando direcciones:', err);
      setError(err.response?.data?.message || 'Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  /**
   * Agregar nueva dirección
   */
  const addAddress = async (addressData) => {
    setError(null);

    try {
      const newAddress = await createAddress(addressData);
      
      // Si es la primera dirección o está marcada como predeterminada
      if (addresses.length === 0 || addressData.predeterminada) {
        setDefaultAddressState(newAddress);
        // Si hay otras direcciones, desmarcamos como predeterminadas en el estado local
        setAddresses(prev => [
          ...prev.map(addr => ({ ...addr, predeterminada: false })),
          newAddress
        ]);
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }

      return newAddress;
    } catch (err) {
      console.error('Error agregando dirección:', err);
      setError(err.response?.data?.message || 'Error al agregar dirección');
      throw err;
    }
  };

  /**
   * Actualizar dirección existente
   */
  const updateExistingAddress = async (direccionId, addressData) => {
    setError(null);

    try {
      const updatedAddress = await updateAddress(direccionId, addressData);
      
      setAddresses(prev => 
        prev.map(addr => 
          addr.direccion_id === direccionId ? updatedAddress : addr
        )
      );

      // Si esta era la dirección predeterminada, actualizarla
      if (defaultAddress?.direccion_id === direccionId) {
        setDefaultAddressState(updatedAddress);
      }

      return updatedAddress;
    } catch (err) {
      console.error('Error actualizando dirección:', err);
      setError(err.response?.data?.message || 'Error al actualizar dirección');
      throw err;
    }
  };

  /**
   * Marcar dirección como predeterminada
   */
  const setDefault = async (direccionId) => {
    setError(null);

    try {
      await setDefaultAddress(direccionId);
      
      // Actualizar estado local
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          predeterminada: addr.direccion_id === direccionId
        }))
      );

      const newDefault = addresses.find(addr => addr.direccion_id === direccionId);
      setDefaultAddressState(newDefault || null);

      return newDefault;
    } catch (err) {
      console.error('Error estableciendo dirección predeterminada:', err);
      setError(err.response?.data?.message || 'Error al establecer dirección predeterminada');
      throw err;
    }
  };

  /**
   * Eliminar dirección
   */
  const removeAddress = async (direccionId) => {
    setError(null);

    try {
      await deleteAddress(direccionId);
      
      // Si eliminamos la dirección predeterminada, el backend asignará otra automáticamente
      // Recargar todas las direcciones para obtener el nuevo estado
      await loadAddresses();
    } catch (err) {
      console.error('Error eliminando dirección:', err);
      setError(err.response?.data?.message || 'Error al eliminar dirección');
      throw err;
    }
  };

  /**
   * Obtener dirección formateada como string
   */
  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [
      address.calle,
      address.departamento,
      address.comuna,
      address.ciudad,
      address.region
    ].filter(Boolean);

    return parts.join(', ');
  };

  // Cargar direcciones cuando el usuario se autentica
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const value = {
    // Estado
    addresses,
    defaultAddress,
    loading,
    error,

    // Métodos
    loadAddresses,
    addAddress,
    updateAddress: updateExistingAddress,
    setDefault,
    removeAddress,
    formatAddress,

    // Helpers
    hasAddresses: addresses.length > 0,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};
