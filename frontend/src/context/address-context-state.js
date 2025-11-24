import { createStrictContext } from '@/context/createStrictContext'

const [AddressContext, useAddressesStrict] = createStrictContext('Address', {
  displayName: 'AddressContext',
  errorMessage: 'useAddresses debe usarse dentro de AddressProvider',
});

export { AddressContext, useAddressesStrict };
