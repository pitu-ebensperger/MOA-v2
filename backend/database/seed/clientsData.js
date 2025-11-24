/**
 * USUARIOS DEMO - Simulación de registro natural durante 2 años
 * 
 * Representa usuarios que descubrieron MOA en diferentes momentos y han interactuado
 * con la plataforma de forma orgánica (compras, wishlists, navegación).
 * 
 * Timeline simulado:
 * - Early adopters (2023): Primeros usuarios, múltiples compras
 * - Mid-term users (2024): Usuarios consolidados, compras regulares  
 * - Recent users (2025): Nuevos usuarios, primeras compras o explorando
 */

// Generador de fechas relativo a "hoy" para mantener consistencia temporal
const now = new Date();

function monthsAgoDate(minMonthsAgo, maxMonthsAgo) {
  const min = minMonthsAgo * 30 * 24 * 60 * 60 * 1000;
  const max = maxMonthsAgo * 30 * 24 * 60 * 60 * 1000;
  const delta = Math.floor(Math.random() * (max - min + 1));
  return new Date(now.getTime() - (min + delta));
}

// Rango de meses para cada grupo (todos dentro de los últimos 24 meses)
// early: 18-24, mid: 12-18, regular: 6-12, recent: 1-6, new: 0-1
export const CLIENTS = [
  // === EARLY ADOPTERS (18-24 months ago) ===
  {
    nombre: "Camila Abarca",
    email: "camila.abarca@mail.cl",
    telefono: "+56912341001",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(18, 24),
  },
  {
    nombre: "Martín Calvo",
    email: "martin.calvo@mail.cl",
    telefono: "+56922332002",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(18, 24),
  },
  {
    nombre: "Valentina Cruz",
    email: "valentina.cruz@mail.cl",
    telefono: "+56933443003",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(18, 24),
  },
  {
    nombre: "Lucas Herrera",
    email: "lucas.herrera@mail.cl",
    telefono: "+56944554004",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(18, 24),
  },

  // === MID-TERM USERS (12-18 months) ===
  {
    nombre: "Isidora Vega",
    email: "isidora.vega@mail.cl",
    telefono: "+56955665005",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(12, 18),
  },
  {
    nombre: "Diego Morales",
    email: "diego.morales@mail.cl",
    telefono: "+56966776006",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(12, 18),
  },
  {
    nombre: "Fernanda Lagos",
    email: "fernanda.lagos@mail.cl",
    telefono: "+56977887007",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(12, 18),
  },
  {
    nombre: "Julián Ríos",
    email: "julian.rios@mail.cl",
    telefono: "+56988998008",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(12, 18),
  },

  // === REGULAR USERS (6-12 months) ===
  {
    nombre: "Camilo Saavedra",
    email: "camilo.saavedra@mail.cl",
    telefono: "+56999009009",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(6, 12),
  },
  {
    nombre: "Renata Fuentes",
    email: "renata.fuentes@mail.cl",
    telefono: "+56910101010",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(6, 12),
  },
  {
    nombre: "Paula Méndez",
    email: "paula.mendez@mail.cl",
    telefono: "+56911112011",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(6, 12),
  },

  // === RECENT USERS (1-6 months) ===
  {
    nombre: "Sebastián Torres",
    email: "sebastian.torres@mail.cl",
    telefono: "+56922223012",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(1, 6),
  },
  {
    nombre: "Carolina Pinto",
    email: "carolina.pinto@mail.cl",
    telefono: "+56933334013",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(1, 6),
  },

  // === NEW USERS (0-1 months) ===
  {
    nombre: "Ignacio Ruiz",
    email: "ignacio.ruiz@mail.cl",
    telefono: "+56944445014",
    rol_code: "CLIENT",
    creado_en: monthsAgoDate(0, 1),
  },
];
