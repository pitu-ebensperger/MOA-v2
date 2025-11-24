import { useStoreConfig } from "@/hooks/useStoreConfig.js";

const ReturnsAndExchangesPage = () => {
  const { config } = useStoreConfig();
  const storeName = config?.nombre_tienda || "MOA";
  const contactEmail = config?.email || "hola@moastudio.cl";
  const phone = config?.telefono || "+56 2 2345 6789";
  const address = config?.direccion || "Providencia 1234, Santiago, Chile";

  return (
    <main className="bg-[#E6E0D8] min-h-screen px-8 py-50 text-[#453F34]">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#443114] mb-6 text-center">
          Política de Cambios, Devoluciones y Garantías
        </h1>

        <p className="text-sm text-[#A69F91] mb-8 text-center">
          Fecha de última actualización: 15 de noviembre de 2025
        </p>

        <p className="mb-6 leading-relaxed">
          En <span className="font-semibold text-[#443114]">{storeName}</span> queremos que disfrutes tus productos con total tranquilidad. 
          Esta política se aplica a las compras realizadas en nuestros canales digitales y complementa los derechos que reconoce la Ley 19.496 
          del Consumidor, la normativa sobre comercio electrónico y las garantías legales vigentes en Chile.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          1. Plazos disponibles
        </h2>
        <ul className="list-disc list-inside mb-6 space-y-2 ml-4 leading-relaxed">
          <li><strong>Satisfacción garantizada:</strong> 30 días corridos desde la entrega para solicitar cambios o devoluciones voluntarias.</li>
          <li><strong>Derecho a retracto:</strong> 10 días corridos para compras a distancia, siempre que el producto no haya sido usado.</li>
          <li><strong>Garantía legal:</strong> 6 meses por fallas de fabricación, con opción de cambio, reparación o devolución del dinero.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          2. Productos elegibles y excepciones
        </h2>
        <p className="mb-4 leading-relaxed">
          Puedes solicitar cambios o devoluciones para la mayoría de los artículos, salvo:
        </p>
        <ul className="list-disc list-inside mb-6 space-y-2 ml-4 leading-relaxed">
          <li>Productos personalizados, hechos a medida o intervenidos a solicitud del cliente.</li>
          <li>Artículos con uso evidente, sin empaque original o faltantes de accesorios/manuales.</li>
          <li>Productos de higiene personal o textiles que hayan sido utilizados.</li>
          <li>Ítems adquiridos en liquidación final, salvo defecto de fábrica.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          3. Condiciones del producto
        </h2>
        <p className="mb-6 leading-relaxed">
          El artículo debe llegar limpio, sin daños, con etiquetas adheridas y dentro de su embalaje original reforzado para el traslado. 
          Si el embalaje sufrió deterioro al abrirlo, utiliza otro que asegure la protección en el retorno.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          4. Cómo iniciar un cambio o devolución
        </h2>
        <ol className="list-decimal list-inside mb-6 space-y-3 ml-4 leading-relaxed">
          <li>Escríbenos a <span className="font-medium text-[#443114]">{contactEmail}</span> o llámanos al {phone} indicando tu número de pedido.</li>
          <li>Cuéntanos el motivo y adjunta fotografías si detectaste daños o fallas.</li>
          <li>Recibirás instrucciones, etiqueta de retorno (cuando aplique) y un número de caso.</li>
          <li>Empaca el producto y entrégalo al operador logístico o en nuestro punto de recepción de {address}.</li>
          <li>Te confirmaremos la recepción y estado del producto antes de cerrar el caso.</li>
        </ol>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          5. Opciones disponibles
        </h2>
        <div className="space-y-3 mb-6 leading-relaxed">
          <p><strong>Cambio:</strong> por el mismo producto (talla/color) o uno distinto pagando/abonando la diferencia.</p>
          <p><strong>Nota de crédito:</strong> saldo digital válido por 12 meses para nuevas compras.</p>
          <p><strong>Reembolso:</strong> en el mismo medio de pago utilizado originalmente, dentro de 5 a 10 días hábiles desde la aprobación.</p>
        </div>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          6. Costos y logística
        </h2>
        <p className="mb-6 leading-relaxed">
          Los gastos de retiro y reenvío corren por cuenta del cliente, excepto cuando exista error en el despacho, 
          defecto de fabricación o daño imputable a {storeName}; en esos casos nosotros asumimos el transporte. 
          Si decides enviar por un courier distinto al sugerido, eres responsable de su contratación y seguimiento.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          7. Garantía legal y productos defectuosos
        </h2>
        <p className="mb-6 leading-relaxed">
          Ante fallas de origen puedes optar por reparación gratuita, cambio inmediato o devolución del dinero durante los primeros 6 meses. 
          Necesitaremos fotografías o inspeccionar el producto para emitir un informe técnico. 
          Si el daño se debe a un mal uso o instalación incorrecta, la garantía no aplicará y te informaremos los pasos a seguir.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          8. Documentación y tiempos
        </h2>
        <p className="mb-6 leading-relaxed">
          Conserva tu boleta o comprobante digital. Cada caso se resuelve en un plazo máximo de 10 días hábiles desde que recibimos el producto. 
          Para devoluciones internacionales el plazo puede ampliarse hasta 20 días hábiles debido a procesos aduaneros.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          9. Contacto
        </h2>
        <p className="leading-relaxed">
          ¿Necesitas asistencia? Escríbenos a <span className="font-medium text-[#443114]">{contactEmail}</span>, 
          llámanos al {phone} o visita nuestro showroom en {address}. 
          Nuestro horario de atención es de lunes a viernes, 09:00 a 18:00 horas.
        </p>
      </section>
    </main>
  );
};

export default ReturnsAndExchangesPage;
