/**
 * Constantes para regiones, comunas y ciudades de Chile
 * Sistema de direcciones en cascada para checkout
 */

// Regiones de Chile (código ISO 3166-2:CL)
export const REGIONES = [
  { codigo: 'AP', nombre: 'Arica y Parinacota' },
  { codigo: 'TA', nombre: 'Tarapacá' },
  { codigo: 'AN', nombre: 'Antofagasta' },
  { codigo: 'AT', nombre: 'Atacama' },
  { codigo: 'CO', nombre: 'Coquimbo' },
  { codigo: 'VA', nombre: 'Valparaíso' },
  { codigo: 'RM', nombre: 'Región Metropolitana de Santiago' },
  { codigo: 'LI', nombre: 'Libertador General Bernardo O\'Higgins' },
  { codigo: 'ML', nombre: 'Maule' },
  { codigo: 'NB', nombre: 'Ñuble' },
  { codigo: 'BI', nombre: 'Biobío' },
  { codigo: 'AR', nombre: 'La Araucanía' },
  { codigo: 'LR', nombre: 'Los Ríos' },
  { codigo: 'LL', nombre: 'Los Lagos' },
  { codigo: 'AI', nombre: 'Aisén del General Carlos Ibáñez del Campo' },
  { codigo: 'MA', nombre: 'Magallanes y de la Antártica Chilena' }
];

// Comunas por región (solo las principales para demo)
export const COMUNAS_POR_REGION = {
  RM: [
    'Santiago',
    'Providencia',
    'Las Condes',
    'Vitacura',
    'Lo Barnechea',
    'Ñuñoa',
    'La Reina',
    'Peñalolén',
    'Macul',
    'La Florida',
    'San Miguel',
    'La Cisterna',
    'El Bosque',
    'San Joaquín',
    'Pedro Aguirre Cerda',
    'Lo Espejo',
    'Estación Central',
    'Cerrillos',
    'Maipú',
    'Quinta Normal',
    'Lo Prado',
    'Pudahuel',
    'Cerro Navia',
    'Renca',
    'Quilicura',
    'Huechuraba',
    'Conchalí',
    'Recoleta',
    'Independencia',
    'San Ramón',
    'La Granja',
    'La Pintana',
    'San Bernardo',
    'Puente Alto',
    'Pirque',
    'San José de Maipo',
    'Colina',
    'Lampa',
    'Til Til',
    'Peñaflor',
    'Talagante',
    'El Monte',
    'Isla de Maipo',
    'Padre Hurtado',
    'Melipilla',
    'Alhué',
    'Curacaví',
    'María Pinto',
    'San Pedro',
    'Buin',
    'Paine',
    'Calera de Tango'
  ],
  VA: [
    'Valparaíso',
    'Viña del Mar',
    'Concón',
    'Quintero',
    'Puchuncaví',
    'Casablanca',
    'Quilpué',
    'Villa Alemana',
    'San Antonio',
    'Cartagena',
    'El Quisco',
    'El Tabo',
    'Algarrobo',
    'Santo Domingo',
    'Los Andes',
    'San Felipe',
    'Quillota',
    'La Calera',
    'Limache',
    'Olmué'
  ],
  BI: [
    'Concepción',
    'Talcahuano',
    'Hualpén',
    'Chiguayante',
    'San Pedro de la Paz',
    'Penco',
    'Tomé',
    'Coronel',
    'Lota',
    'Los Ángeles',
    'Cabrero',
    'Chillán',
    'Chillán Viejo'
  ],
  CO: [
    'La Serena',
    'Coquimbo',
    'Ovalle',
    'Vicuña',
    'Andacollo',
    'Monte Patria',
    'Illapel',
    'Salamanca'
  ],
  ML: [
    'Talca',
    'Curicó',
    'Linares',
    'Constitución',
    'Cauquenes',
    'Parral',
    'Molina'
  ],
  AR: [
    'Temuco',
    'Padre Las Casas',
    'Villarrica',
    'Pucón',
    'Angol',
    'Victoria',
    'Lautaro',
    'Nueva Imperial'
  ],
  LL: [
    'Puerto Montt',
    'Puerto Varas',
    'Osorno',
    'Castro',
    'Ancud',
    'Quellón'
  ],
  LR: [
    'Valdivia',
    'La Unión',
    'Río Bueno',
    'Panguipulli'
  ],
  AN: [
    'Antofagasta',
    'Calama',
    'Tocopilla',
    'Mejillones',
    'Taltal'
  ],
  AT: [
    'Copiapó',
    'Vallenar',
    'Caldera',
    'Chañaral',
    'Diego de Almagro'
  ],
  TA: [
    'Iquique',
    'Alto Hospicio',
    'Pozo Almonte',
    'Pica'
  ],
  AP: [
    'Arica',
    'Putre',
    'Camarones'
  ],
  MA: [
    'Punta Arenas',
    'Puerto Natales',
    'Porvenir',
    'Puerto Williams'
  ],
  AI: [
    'Coyhaique',
    'Puerto Aysén',
    'Chile Chico'
  ],
  NB: [
    'Chillán',
    'Chillán Viejo',
    'San Carlos',
    'Bulnes',
    'Quirihue'
  ],
  LI: [
    'Rancagua',
    'Machalí',
    'San Fernando',
    'Rengo',
    'Santa Cruz',
    'Pichilemu',
    'Graneros'
  ]
};

/**
 * Helpers para obtener datos
 */
export function getRegionByCode(codigo) {
  return REGIONES.find(r => r.codigo === codigo);
}

export function getComunasByRegion(codigoRegion) {
  return COMUNAS_POR_REGION[codigoRegion] || [];
}

export function normalizeRegionName(nombre) {
  // Normaliza nombres de regiones para evitar inconsistencias
  const normalizaciones = {
    'RM': 'Región Metropolitana de Santiago',
    'Region Metropolitana': 'Región Metropolitana de Santiago',
    'Metropolitana': 'Región Metropolitana de Santiago',
    'Santiago': 'Región Metropolitana de Santiago'
  };
  
  return normalizaciones[nombre] || nombre;
}

export function getRegionCodeByName(nombre) {
  const nombreNormalizado = normalizeRegionName(nombre);
  const region = REGIONES.find(r => r.nombre === nombreNormalizado);
  return region?.codigo || null;
}

/**
 * Validaciones
 */
export function isValidRegion(codigo) {
  return REGIONES.some(r => r.codigo === codigo);
}

export function isValidComuna(codigoRegion, comuna) {
  const comunas = getComunasByRegion(codigoRegion);
  return comunas.includes(comuna);
}

/**
 * Labels para direcciones
 */
export const TIPOS_DIRECCION = {
  CASA: 'Casa',
  OFICINA: 'Oficina',
  TRABAJO: 'Trabajo',
  OTRO: 'Otro'
};

export const TIPOS_DIRECCION_OPTIONS = Object.entries(TIPOS_DIRECCION).map(([key, label]) => ({
  value: key.toLowerCase(),
  label
}));
