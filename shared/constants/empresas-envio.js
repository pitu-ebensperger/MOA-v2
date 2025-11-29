export const EMPRESAS_ENVIO = {
  CHILEXPRESS: 'chilexpress',
  BLUE_EXPRESS: 'blue_express',
  STARKEN: 'starken',
  CORREOS_CHILE: 'correos_chile',
  POR_ASIGNAR: 'por_asignar'
};

export const EMPRESAS_ENVIO_VALIDOS = Object.values(EMPRESAS_ENVIO);

export const EMPRESAS_ENVIO_OPTIONS = [
  { value: EMPRESAS_ENVIO.CHILEXPRESS, label: "Chilexpress" },
  { value: EMPRESAS_ENVIO.BLUE_EXPRESS, label: "Blue Express" },
  { value: EMPRESAS_ENVIO.STARKEN, label: "Starken" },
  { value: EMPRESAS_ENVIO.CORREOS_CHILE, label: "Correos de Chile" },
  { value: EMPRESAS_ENVIO.POR_ASIGNAR, label: "Retiro en tienda" },
];

export function isValidEmpresaEnvio(empresaEnvio) {
  return EMPRESAS_ENVIO_VALIDOS.includes(empresaEnvio);
}

export function getEmpresaEnvioLabel(empresaEnvio) {
  const option = EMPRESAS_ENVIO_OPTIONS.find(o => o.value === empresaEnvio);
  return option?.label || empresaEnvio;
}
