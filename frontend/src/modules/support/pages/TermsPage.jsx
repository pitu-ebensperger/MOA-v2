import { Link } from "react-router-dom";
import { API_PATHS } from "@/config/api-paths.js";
import { useStoreConfig } from "@/hooks/useStoreConfig.js";

const TermsPage = () => {
  const { config } = useStoreConfig();
  const storeName = config?.nombre_tienda || "MOA";
  const contactEmail = config?.email || "hola@moastudio.cl";
  const phone = config?.telefono || "+56 2 2345 6789";
  const address = config?.direccion || "Providencia 1234, Santiago, Chile";

  return (
    <main className="bg-[#E6E0D8] min-h-screen px-8 py-50 text-[#453F34]">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#443114] mb-6 text-center">
          Términos y Condiciones de Uso
        </h1>

        <p className="text-sm text-[#A69F91] mb-8 text-center">
          Fecha de última actualización: 15 de noviembre de 2025
        </p>

        <p className="mb-6 leading-relaxed">
          Bienvenido a <span className="font-semibold text-[#443114]">{storeName}</span>. 
          Estos Términos y Condiciones (“<strong>T&C</strong>”) regulan el acceso y uso del sitio web, 
          los canales digitales y los servicios de venta ofrecidos por {storeName}. 
          Al navegar, registrarte o comprar aceptas íntegramente estos T&C y declaras que tienes capacidad legal para contratar.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          1. Definiciones y alcance
        </h2>
        <p className="mb-6 leading-relaxed">
          “Sitio” corresponde a todos los dominios y aplicaciones gestionados por {storeName}. 
          “Usuario” es toda persona que navega o se registra. “Cliente” es el usuario que concreta una compra. 
          Estos T&C aplican a todas las operaciones realizadas en Chile o desde el extranjero con destino al país, 
          sin perjuicio de normas imperativas como la Ley N.º 19.496 de Protección de los Derechos de los Consumidores.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          2. Registro, cuenta y seguridad
        </h2>
        <p className="mb-6 leading-relaxed">
          Para comprar no es obligatorio crear una cuenta, pero al hacerlo te comprometes a entregar información auténtica, 
          actualizada y completa. Debes resguardar tus credenciales y notificarnos de inmediato ante usos no autorizados. 
          {storeName} puede suspender cuentas cuando detecte uso fraudulento o contrario a estos T&C.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          3. Proceso de compra y formación del consentimiento
        </h2>
        <p className="mb-6 leading-relaxed">
          La compra se considera perfeccionada cuando recibes el correo de confirmación donde se indica que el pedido fue 
          validado y se encuentra en preparación. Nos reservamos el derecho de rechazar pedidos ante falta de stock, 
          sospecha de fraude, errores manifiestos de precio/información o incumplimientos previos del cliente. 
          En dichos casos te informaremos y devolveremos los pagos recibidos.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          4. Precios, promociones y medios de pago
        </h2>
        <p className="mb-6 leading-relaxed">
          Todos los precios están expresados en pesos chilenos (CLP) e incluyen impuestos, salvo que se indique lo contrario. 
          Las promociones y cupones tienen vigencia, restricciones y cupos limitados publicados en cada campaña. 
          Aceptamos los medios de pago informados en el checkout y procesados por proveedores certificados. 
          Podremos actualizar precios en cualquier momento, respetando los que ya hayan sido confirmados al cliente.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          5. Despacho, entrega y transferencia del riesgo
        </h2>
        <p className="mb-6 leading-relaxed">
          Realizamos envíos mediante operadores logísticos certificados o entregas coordinadas en nuestro showroom. 
          Los plazos indicados son estimados y pueden variar por causas externas (clima, contingencias, fuerza mayor). 
          El riesgo se transfiere al cliente al momento de la entrega en la dirección indicada o al retirar el producto. 
          Ante retrasos relevantes te mantendremos informado y podrás solicitar alternativas o desistir del pedido con reembolso.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          6. Cambios, devoluciones y garantías legales
        </h2>
        <p className="mb-4 leading-relaxed">
          Contamos con una política de satisfacción de 30 días y además respetamos la garantía legal de 6 meses por fallas de fabricación. 
          Los requisitos, pasos y excepciones se describen en detalle en la{" "}
          <Link to={API_PATHS.support.returns} className="text-[#8B5E3C] underline underline-offset-4">
            sección de Cambios y Devoluciones
          </Link>. 
          Ninguna disposición limita los derechos que otorga la Ley 19.496, incluido el derecho a retracto cuando corresponda.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          7. Propiedad intelectual y uso aceptable
        </h2>
        <p className="mb-6 leading-relaxed">
          Todos los textos, fotografías, diseños, logotipos, íconos, código y demás contenido del sitio pertenecen a {storeName} 
          o a sus licenciantes y se encuentran protegidos por la normativa de propiedad intelectual aplicable. 
          No puedes copiar, distribuir, modificar o explotar comercialmente dichos contenidos sin autorización previa y escrita.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          8. Limitación de responsabilidad
        </h2>
        <p className="mb-6 leading-relaxed">
          {storeName} no será responsable por daños indirectos, lucro cesante o pérdida de datos derivados del uso del sitio. 
          Nuestra responsabilidad total frente al cliente no excederá el monto efectivamente pagado por la compra que origina el reclamo, 
          salvo disposición legal imperativa distinta o dolo por parte de la empresa.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          9. Fuerza mayor
        </h2>
        <p className="mb-6 leading-relaxed">
          No seremos responsables por incumplimientos ocasionados por hechos de fuerza mayor o caso fortuito, 
          tales como desastres naturales, actos de autoridad, cortes masivos de servicios, conflictos laborales o incidentes de ciberseguridad. 
          Retomaremos el cumplimiento apenas cesen dichas circunstancias.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          10. Protección de datos y comunicaciones
        </h2>
        <p className="mb-6 leading-relaxed">
          El tratamiento de tus datos personales se rige por nuestra{" "}
          <Link to={API_PATHS.support.privacy} className="text-[#8B5E3C] underline underline-offset-4">
            Política de Privacidad
          </Link>. 
          Al aceptar estos T&C autorizas el envío de comunicaciones relacionadas con tus pedidos y, si te suscribes, contenido comercial. 
          Puedes darte de baja en cualquier momento desde los enlaces incluidos en cada mensaje.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          11. Legislación aplicable y resolución de conflictos
        </h2>
        <p className="mb-6 leading-relaxed">
          Estos T&C se interpretan conforme a las leyes de la República de Chile. 
          Cualquier controversia se someterá a los tribunales competentes de Santiago, sin perjuicio de los mecanismos administrativos 
          disponibles ante el SERNAC u otras autoridades de protección al consumidor.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          12. Contacto
        </h2>
        <p className="leading-relaxed">
          Para consultas, reclamos o solicitudes relacionadas con estos T&C puedes escribirnos a{" "}
          <span className="font-medium text-[#443114]">{contactEmail}</span>, 
          llamar al <span className="font-medium text-[#443114]">{phone}</span> 
          o visitarnos en <span className="font-medium text-[#443114]">{address}</span>.
        </p>
      </section>
    </main>
  );
};

export default TermsPage;
