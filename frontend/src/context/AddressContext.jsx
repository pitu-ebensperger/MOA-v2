/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext.jsx'
import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from '@/services/address.api';

// Contexto estricto inline
const CONTEXT_NOT_SET = Symbol("STRICT_CONTEXT_NOT_SET");

const createStrictContext = (
  label = "Context",
  { displayName = `${label}Context`, errorMessage } = {},
) => {
  const Context = createContext(CONTEXT_NOT_SET);
  Context.displayName = displayName;

  const useStrictContext = () => {
    const ctx = useContext(Context);
    if (ctx === CONTEXT_NOT_SET) {
      throw new Error(errorMessage ?? `use${label} debe usarse dentro de ${label}Provider`);
    }
    return ctx;
  };

  return [Context, useStrictContext];
};

// Contexto y Hook
const [AddressContext, useAddressesStrict] = createStrictContext('Address', {
  displayName: 'AddressContext',
  errorMessage: 'useAddresses debe usarse dentro de AddressProvider',
});

export { AddressContext, useAddressesStrict as useAddresses };

// Provider
const getAddressId = (address) => address?.direccion_id ?? address?.id ?? address?.address_id ?? null;
const isDefaultAddress = (address) => Boolean(address?.predeterminada ?? address?.es_predeterminada ?? address?.isDefault);
const isSameAddress = (address, id) => {
  const currentId = getAddressId(address);
  if (currentId === null || currentId === undefined || id === null || id === undefined) {
    return false;
  }
  return String(currentId) === String(id);
};

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

      const defaultAddr = data.find((addr) => isDefaultAddress(addr));
      setDefaultAddressState(defaultAddr || null);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error cargando direcciones:', err);
      setError(err.response?.data?.message || 'Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const addAddress = async (addressData) => {
    setError(null);

    try {
      const newAddress = await createAddress(addressData);
      
      setAddresses(prev => {
        const newAddressId = getAddressId(newAddress);
        const shouldBeDefault = isDefaultAddress(newAddress) || prev.length === 0 || addressData?.predeterminada || addressData?.es_predeterminada;
        const sanitized = shouldBeDefault
          ? prev.map(addr => ({ ...addr, predeterminada: false, es_predeterminada: false, isDefault: false }))
          : prev;

        const withoutDuplicate = sanitized.filter(addr => !isSameAddress(addr, newAddressId));
        const nextAddresses = [...withoutDuplicate, newAddress];

        if (shouldBeDefault) {
          setDefaultAddressState(newAddress);
        }

        return nextAddresses;
      });

      return newAddress;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error agregando dirección:', err);
      setError(err.response?.data?.message || 'Error al agregar dirección');
      throw err;
    }
  };

  const updateExistingAddress = async (direccionId, addressData) => {
    setError(null);

    try {
      const updatedAddress = await updateAddress(direccionId, addressData);
      
      setAddresses(prev => {
        const next = prev.map(addr =>
          isSameAddress(addr, direccionId) ? updatedAddress : addr
        );

        if (defaultAddress && isSameAddress(defaultAddress, direccionId)) {
          setDefaultAddressState(updatedAddress);
        }

        return next;
      });

      return updatedAddress;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error actualizando dirección:', err);
      setError(err.response?.data?.message || 'Error al actualizar dirección');
      throw err;
    }
  };

  const setDefault = async (direccionId) => {
    setError(null);

    try {
      const newDefault = await setDefaultAddress(direccionId);

      setAddresses(prev =>
        prev.map(addr => {
          const isTarget = isSameAddress(addr, direccionId);
          return {
            ...addr,
            predeterminada: isTarget,
            es_predeterminada: isTarget,
            isDefault: isTarget,
          };
        })
      );

      setDefaultAddressState(newDefault || null);

      return newDefault;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error estableciendo dirección predeterminada:', err);
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
      if (import.meta.env.DEV) console.error('Error eliminando dirección:', err);
      setError(err.response?.data?.message || 'Error al eliminar dirección');
      throw err;
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [
      [address.calle, address.numero].filter(Boolean).join(' ').trim(),
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
