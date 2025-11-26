import { useState, useEffect, useCallback } from 'react';
import { createStrictContext } from '@/context/createStrictContext'
import { useAuth } from '@/context/AuthContext.jsx'
import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from '@/services/address.api';

// ============================================
// CONTEXTO Y HOOK
// ============================================

const [AddressContext, useAddressesStrict] = createStrictContext('Address', {
  displayName: 'AddressContext',
  errorMessage: 'useAddresses debe usarse dentro de AddressProvider',
});

export { AddressContext, useAddressesStrict as useAddresses };

// ============================================
// PROVIDER
// ============================================

export const AddressProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddressState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      
      const defaultAddr = data.find(addr => addr.predeterminada);
      setDefaultAddressState(defaultAddr || null);
    } catch (err) {
      console.error('Error cargando direcciones:', err);
      setError(err.response?.data?.message || 'Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const addAddress = async (addressData) => {
    setError(null);

    try {
      const newAddress = await createAddress(addressData);
      
      if (addresses.length === 0 || addressData.predeterminada) {
        setDefaultAddressState(newAddress);
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

  const updateExistingAddress = async (direccionId, addressData) => {
    setError(null);

    try {
      const updatedAddress = await updateAddress(direccionId, addressData);
      
      setAddresses(prev => 
        prev.map(addr => 
          addr.direccion_id === direccionId ? updatedAddress : addr
        )
      );

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

  const setDefault = async (direccionId) => {
    setError(null);

    try {
      await setDefaultAddress(direccionId);
      
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

  const removeAddress = async (direccionId) => {
    setError(null);

    try {
      await deleteAddress(direccionId);
      await loadAddresses();
    } catch (err) {
      console.error('Error eliminando dirección:', err);
      setError(err.response?.data?.message || 'Error al eliminar dirección');
      throw err;
    }
  };

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

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const value = {
    addresses,
    defaultAddress,
    loading,
    error,
    loadAddresses,
    addAddress,
    updateAddress: updateExistingAddress,
    setDefault,
    removeAddress,
    formatAddress,
    hasAddresses: addresses.length > 0,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};
