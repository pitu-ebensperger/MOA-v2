// IDs deben coincidir exactamente con el CHECK constraint de base de datos
export const SHIPPING_COMPANIES = Object.freeze([
  { id: "chilexpress", dbId: "chilexpress", label: "Chilexpress" },
  { id: "blue-express", dbId: "blue_express", label: "Blue Express" },
  { id: "starken", dbId: "starken", label: "Starken" },
  { id: "correos-de-chile", dbId: "correos_chile", label: "Correos de Chile" },
  { id: "retiro-en-tienda", dbId: "por_asignar", label: "Retiro en tienda" },
]);

export const SHIPPING_COMPANY_LABELS = SHIPPING_COMPANIES.map(({ label }) => label);

// Mapa que permite buscar por ID, dbId o label (case-insensitive) y devuelve dbId
const SHIPPING_COMPANY_LOOKUP = new Map(
  SHIPPING_COMPANIES.flatMap(({ id, dbId, label }) => {
    const normalizedLabel = label.toLowerCase();
    const normalizedId = id.toLowerCase();
    return [
      [id, dbId],
      [normalizedId, dbId],
      [dbId, dbId],
      [label, dbId],
      [normalizedLabel, dbId],
    ];
  }),
);

export const normalizeShippingCompany = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalizedKey = trimmed.toLowerCase().replace(/[\s-]/g, "_");
  if (SHIPPING_COMPANY_LOOKUP.has(normalizedKey)) {
    return SHIPPING_COMPANY_LOOKUP.get(normalizedKey);
  }

  // Intentar búsqueda directa
  if (SHIPPING_COMPANY_LOOKUP.has(trimmed)) {
    return SHIPPING_COMPANY_LOOKUP.get(trimmed);
  }

  return null;
};

export const isValidShippingCompany = (value) => Boolean(normalizeShippingCompany(value));
