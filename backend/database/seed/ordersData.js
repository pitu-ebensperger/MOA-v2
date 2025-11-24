/**
 * HISTORIAL DE ÓRDENES - Simulación de comportamiento natural de compras durante 2 años
 * 
 * Patrones simulados:
 * - Early adopters: Múltiples compras (3-5 órdenes)
 * - Mid-term users: 1-3 compras
 * - Recent users: 1-2 compras o sin compras (solo explorando)
 * - Variedad de estados: entregado (antiguas), en_transito (recientes), preparacion (muy recientes)
 * - Métodos de pago variados: tarjeta crédito/débito, transferencia, mercadopago
 * - Notas de cliente realistas
 */

export const ORDER_HISTORY = [
  // ========================================
  // CAMILA ABARCA - Early adopter (5 compras en 18 meses)
  // ========================================
  {
    order_code: "MOA-20230720-0001",
    email: "camila.abarca@mail.cl",
    created_at: "2023-07-20T14:30:00Z", // Primera compra 1 mes después del registro
    metodo_pago: "transferencia",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2023-07-20T15:10:00Z",
    fecha_envio: "2023-07-21T09:00:00Z",
    fecha_entrega_real: "2023-07-23T16:20:00Z",
    numero_seguimiento: "CHLX-001237",
    empresa_envio: "chilexpress",
    notas_cliente: "Primera compra, muy emocionada!",
    shipping_cents: 4900,
    items: [
      { slug: "lampara-colgante-globo-opal", quantity: 1 },
      { slug: "velador-rustico", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20231115-0002",
    email: "camila.abarca@mail.cl",
    created_at: "2023-11-15T10:15:00Z",
    metodo_pago: "webpay",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2023-11-15T10:18:00Z",
    fecha_envio: "2023-11-15T15:30:00Z",
    fecha_entrega_real: "2023-11-16T18:45:00Z",
    numero_seguimiento: "CHLX-002891",
    empresa_envio: "chilexpress",
    notas_cliente: "Favor dejar en conserjería si no hay nadie.",
    shipping_cents: 6900,
    items: [
      { slug: "sofa-modular-arena", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20240312-0003",
    email: "camila.abarca@mail.cl",
    created_at: "2024-03-12T16:45:00Z",
    metodo_pago: "tarjeta_credito",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-03-12T16:48:00Z",
    fecha_envio: "2024-03-13T08:20:00Z",
    fecha_entrega_real: "2024-03-14T11:30:00Z",
    numero_seguimiento: "STAR-445566",
    empresa_envio: "starken",
    shipping_cents: 4900,
    items: [
      { slug: "mesa-centro-roble-natural", quantity: 1 },
      { slug: "set-decorativo-monocromo", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20240718-0004",
    email: "camila.abarca@mail.cl",
    created_at: "2024-07-18T11:20:00Z",
    metodo_pago: "webpay",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2024-07-18T11:25:00Z",
    fecha_envio: "2024-07-18T17:00:00Z",
    fecha_entrega_real: "2024-07-19T15:40:00Z",
    numero_seguimiento: "CHLX-334455",
    empresa_envio: "chilexpress",
    shipping_cents: 6900,
    items: [
      { slug: "aplique-mural-dorado-cepillado", quantity: 2 },
    ],
  },
  {
    order_code: "MOA-20241105-0005",
    email: "camila.abarca@mail.cl",
    created_at: "2024-11-05T09:10:00Z", // Compra reciente
    metodo_pago: "tarjeta_debito",
    estado_pago: "pagado",
    estado_envio: "en_transito",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-11-05T09:12:00Z",
    fecha_envio: "2024-11-06T08:00:00Z",
    numero_seguimiento: "BLUE-778899",
    empresa_envio: "blue_express",
    notas_cliente: "Espero que llegue antes del fin de semana",
    shipping_cents: 4900,
    items: [
      { slug: "duo-macetas-follaje-verde", quantity: 1 },
    ],
  },

  // ========================================
  // MARTÍN CALVO - Early adopter (4 compras)
  // ========================================
  {
    order_code: "MOA-20230825-0006",
    email: "martin.calvo@mail.cl",
    created_at: "2023-08-25T13:40:00Z",
    metodo_pago: "transferencia",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2023-08-25T14:15:00Z",
    fecha_envio: "2023-08-26T09:30:00Z",
    fecha_entrega_real: "2023-08-28T17:10:00Z",
    numero_seguimiento: "STAR-998877",
    empresa_envio: "starken",
    shipping_cents: 4900,
    items: [
      { slug: "escritorio-fresno", quantity: 1 },
      { slug: "silla-oficina-cuero-caramelo", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20240202-0007",
    email: "martin.calvo@mail.cl",
    created_at: "2024-02-02T10:25:00Z",
    metodo_pago: "webpay",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2024-02-02T10:28:00Z",
    fecha_envio: "2024-02-02T16:00:00Z",
    fecha_entrega_real: "2024-02-03T14:20:00Z",
    numero_seguimiento: "CHLX-556677",
    empresa_envio: "chilexpress",
    notas_cliente: "Llamar antes de entregar",
    shipping_cents: 6900,
    items: [
      { slug: "lampara-pie-cobre-envejecido", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20240608-0008",
    email: "martin.calvo@mail.cl",
    created_at: "2024-06-08T11:15:00Z",
    metodo_pago: "transferencia",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-06-08T11:18:00Z",
    fecha_envio: "2024-06-09T09:10:00Z",
    fecha_entrega_real: "2024-06-10T16:30:00Z",
    numero_seguimiento: "STAR-112233",
    empresa_envio: "starken",
    shipping_cents: 4900,
    items: [
      { slug: "librero-abierto-madera-clara", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20241018-0009",
    email: "martin.calvo@mail.cl",
    created_at: "2024-10-18T15:50:00Z",
    metodo_pago: "tarjeta_credito",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-10-18T15:52:00Z",
    fecha_envio: "2024-10-19T08:45:00Z",
    fecha_entrega_real: "2024-10-21T12:15:00Z",
    numero_seguimiento: "BLUE-445566",
    empresa_envio: "blue_express",
    shipping_cents: 4900,
    items: [
      { slug: "velador-rustico", quantity: 2 },
    ],
  },

  // ========================================
  // VALENTINA CRUZ - Mid-term user (3 compras)
  // ========================================
  {
    order_code: "MOA-20231120-0010",
    email: "valentina.cruz@mail.cl",
    created_at: "2023-11-20T12:05:00Z",
    metodo_pago: "webpay",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2023-11-20T12:10:00Z",
    fecha_envio: "2023-11-21T08:30:00Z",
    fecha_entrega_real: "2023-11-22T16:00:00Z",
    numero_seguimiento: "CHLX-667788",
    empresa_envio: "chilexpress",
    shipping_cents: 4900,
    items: [
      { slug: "lampara-colgante-globo-opal", quantity: 1 },
      { slug: "velador-rustico", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20240515-0011",
    email: "valentina.cruz@mail.cl",
    created_at: "2024-05-15T14:30:00Z",
    metodo_pago: "transferencia",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2024-05-15T14:55:00Z",
    fecha_envio: "2024-05-15T18:00:00Z",
    fecha_entrega_real: "2024-05-16T11:20:00Z",
    numero_seguimiento: "CHLX-889900",
    empresa_envio: "chilexpress",
    notas_cliente: "Regalo para amiga, favor envolver bonito",
    shipping_cents: 6900,
    items: [
      { slug: "duo-macetas-follaje-verde", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20240922-0012",
    email: "valentina.cruz@mail.cl",
    created_at: "2024-09-22T10:15:00Z",
    metodo_pago: "tarjeta_debito",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-09-22T10:18:00Z",
    fecha_envio: "2024-09-23T09:00:00Z",
    fecha_entrega_real: "2024-09-24T15:30:00Z",
    numero_seguimiento: "STAR-223344",
    empresa_envio: "starken",
    shipping_cents: 4900,
    items: [
      { slug: "mesa-redonda-escandinava", quantity: 1 },
    ],
  },

  // ========================================
  // LUCAS HERRERA - Mid-term user (2 compras)
  // ========================================
  {
    order_code: "MOA-20240110-0013",
    email: "lucas.herrera@mail.cl",
    created_at: "2024-01-10T16:20:00Z",
    metodo_pago: "webpay",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-01-10T16:23:00Z",
    fecha_envio: "2024-01-11T08:15:00Z",
    fecha_entrega_real: "2024-01-12T14:40:00Z",
    numero_seguimiento: "CHLX-334455",
    empresa_envio: "chilexpress",
    shipping_cents: 4900,
    items: [
      { slug: "escritorio-fresno", quantity: 1 },
      { slug: "lampara-pie-cobre-envejecido", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20240805-0014",
    email: "lucas.herrera@mail.cl",
    created_at: "2024-08-05T11:45:00Z",
    metodo_pago: "tarjeta_credito",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2024-08-05T11:48:00Z",
    fecha_envio: "2024-08-05T17:30:00Z",
    fecha_entrega_real: "2024-08-06T13:20:00Z",
    numero_seguimiento: "CHLX-998877",
    empresa_envio: "chilexpress",
    shipping_cents: 6900,
    items: [
      { slug: "sofa-modular-arena", quantity: 1 },
    ],
  },

  // ========================================
  // FERNANDA LAGOS - Mid-term user (2 compras)
  // ========================================
  {
    order_code: "MOA-20240320-0015",
    email: "fernanda.lagos@mail.cl",
    created_at: "2024-03-20T14:40:00Z",
    metodo_pago: "tarjeta_debito",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2024-03-20T14:45:00Z",
    fecha_envio: "2024-03-20T18:00:00Z",
    fecha_entrega_real: "2024-03-21T16:30:00Z",
    numero_seguimiento: "CHLX-445566",
    empresa_envio: "chilexpress",
    notas_cliente: "Llamar antes de entregar.",
    shipping_cents: 6900,
    items: [
      { slug: "mesa-redonda-escandinava", quantity: 1 },
      { slug: "silla-oficina-cuero-caramelo", quantity: 1 },
    ],
  },
  {
    order_code: "MOA-20240910-0016",
    email: "fernanda.lagos@mail.cl",
    created_at: "2024-09-10T10:20:00Z",
    metodo_pago: "transferencia",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-09-10T10:45:00Z",
    fecha_envio: "2024-09-11T09:00:00Z",
    fecha_entrega_real: "2024-09-12T15:10:00Z",
    numero_seguimiento: "BLUE-667788",
    empresa_envio: "blue_express",
    shipping_cents: 4900,
    items: [
      { slug: "cama-tapizada-lino-beige", quantity: 1 },
    ],
  },

  // ========================================
  // RENATA FUENTES - Regular user (2 compras)
  // ========================================
  {
    order_code: "MOA-20240715-0017",
    email: "renata.fuentes@mail.cl",
    created_at: "2024-07-15T09:20:00Z",
    metodo_pago: "tarjeta_credito",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-07-15T09:25:00Z",
    fecha_envio: "2024-07-16T07:50:00Z",
    fecha_entrega_real: "2024-07-17T14:30:00Z",
    numero_seguimiento: "STAR-330011",
    empresa_envio: "starken",
    shipping_cents: 4900,
    items: [
      { slug: "duo-macetas-follaje-verde", quantity: 1 },
      { slug: "aplique-mural-dorado-cepillado", quantity: 2 },
    ],
  },
  {
    order_code: "MOA-20241025-0018",
    email: "renata.fuentes@mail.cl",
    created_at: "2024-10-25T13:15:00Z",
    metodo_pago: "webpay",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2024-10-25T13:18:00Z",
    fecha_envio: "2024-10-25T17:00:00Z",
    fecha_entrega_real: "2024-10-26T11:45:00Z",
    numero_seguimiento: "CHLX-112233",
    empresa_envio: "chilexpress",
    shipping_cents: 6900,
    items: [
      { slug: "librero-metalico-negro-minimal", quantity: 1 },
    ],
  },

  // ========================================
  // PAULA MÉNDEZ - Recent user (1 compra reciente)
  // ========================================
  {
    order_code: "MOA-20241101-0019",
    email: "paula.mendez@mail.cl",
    created_at: "2024-11-01T13:10:00Z",
    metodo_pago: "tarjeta_credito",
    estado_pago: "pagado",
    estado_envio: "en_transito",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2024-11-01T13:12:00Z",
    fecha_envio: "2024-11-01T17:00:00Z",
    numero_seguimiento: "CHLX-258741",
    empresa_envio: "chilexpress",
    shipping_cents: 6900,
    items: [
      { slug: "silla-oficina-cuero-caramelo", quantity: 1 },
      { slug: "lampara-pie-cobre-envejecido", quantity: 1 },
    ],
  },

  // ========================================
  // SEBASTIÁN TORRES - Recent user (1 compra)
  // ========================================
  {
    order_code: "MOA-20241012-0020",
    email: "sebastian.torres@mail.cl",
    created_at: "2024-10-12T10:40:00Z",
    metodo_pago: "tarjeta_debito",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-10-12T10:42:00Z",
    fecha_envio: "2024-10-13T08:15:00Z",
    fecha_entrega_real: "2024-10-14T15:30:00Z",
    numero_seguimiento: "STAR-778899",
    empresa_envio: "starken",
    shipping_cents: 4900,
    items: [
      { slug: "mesa-centro-roble-natural", quantity: 1 },
      { slug: "set-decorativo-monocromo", quantity: 1 },
    ],
  },

  // ========================================
  // CAROLINA PINTO - Recent user (1 compra)
  // ========================================
  {
    order_code: "MOA-20241028-0021",
    email: "carolina.pinto@mail.cl",
    created_at: "2024-10-28T19:20:00Z",
    metodo_pago: "transferencia",
    estado_pago: "pagado",
    estado_envio: "entregado",
    estado_orden: "confirmado",
    metodo_despacho: "express",
    fecha_pago: "2024-10-28T19:50:00Z",
    fecha_envio: "2024-10-29T09:20:00Z",
    fecha_entrega_real: "2024-10-30T17:10:00Z",
    numero_seguimiento: "CHLX-440022",
    empresa_envio: "chilexpress",
    notas_cliente: "Favor llamar antes, mascota en casa.",
    shipping_cents: 6900,
    items: [
      { slug: "cama-tapizada-lino-beige", quantity: 1 },
      { slug: "lampara-colgante-cobre-satinado", quantity: 1 },
    ],
  },

  // ========================================
  // IGNACIO RUIZ - New user (1 compra muy reciente, aún en preparación)
  // ========================================
  {
    order_code: "MOA-20241118-0022",
    email: "ignacio.ruiz@mail.cl",
    created_at: "2024-11-18T08:25:00Z",
    metodo_pago: "webpay",
    estado_pago: "pagado",
    estado_envio: "preparacion",
    estado_orden: "confirmado",
    metodo_despacho: "standard",
    fecha_pago: "2024-11-18T08:26:00Z",
    numero_seguimiento: "PENDIENTE_ASIGNAR",
    empresa_envio: "por_asignar",
    notas_cliente: "Primera compra, espero que todo salga bien!",
    shipping_cents: 4900,
    items: [
      { slug: "librero-abierto-madera-clara", quantity: 1 },
      { slug: "velador-rustico", quantity: 1 },
    ],
  },
];
