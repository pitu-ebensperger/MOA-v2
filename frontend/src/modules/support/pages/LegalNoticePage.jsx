import { Link } from "react-router-dom";
import { API_PATHS } from "@/config/app.routes.js";
import { useStoreConfig } from "@/hooks/useStoreConfig.js";

const LegalNoticePage = () => {
  const { config } = useStoreConfig();
  const storeName = config?.nombre_tienda || "MOA";
  const contactEmail = config?.email || "hola@moastudio.cl";
  const phone = config?.telefono || "+56 2 2345 6789";
  const address = config?.direccion || "Providencia 1234, Santiago, Chile";

  return (
    <main className="bg-[#E6E0D8] min-h-screen px-8 py-50 text-[#453F34]">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#443114] mb-6 text-center">
          Aviso Legal y Cumplimiento GDPR
        </h1>

        <p className="text-sm text-[#A69F91] mb-8 text-center">
          Fecha de última actualización: 15 de noviembre de 2025
        </p>

        <p className="mb-6 leading-relaxed">
          Este Aviso Legal regula el acceso y uso del sitio web operado por <span className="font-semibold text-[#443114]">{storeName}</span>. 
          Complementa los <Link to={API_PATHS.support.terms} className="text-[#8B5E3C] underline underline-offset-4">Términos y Condiciones</Link> 
          y la <Link to={API_PATHS.support.privacy} className="text-[#8B5E3C] underline underline-offset-4">Política de Privacidad</Link>, 
          documentos que toda persona usuaria debe revisar previamente.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          1. Titular e información de contacto
        </h2>
        <p className="mb-6 leading-relaxed">
          {storeName} es responsable del contenido publicado en este sitio. 
          Domicilio comercial: {address}. Teléfono: {phone}. Correo:{" "}
          <span className="font-medium text-[#443114]">{contactEmail}</span>. 
          Para cualquier consulta legal o requerimiento de autoridades administrativas utiliza estos mismos canales.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          2. Uso del sitio y responsabilidades
        </h2>
        <p className="mb-6 leading-relaxed">
          El usuario se compromete a utilizar el sitio de forma lícita, respetuosa y conforme a los fines descritos. 
          Queda prohibido introducir software malicioso, realizar ingeniería inversa o recopilar datos con fines no autorizados. 
          {storeName} no garantiza la disponibilidad ininterrumpida del servicio y podrá suspenderlo temporalmente para mantenciones o contingencias.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          3. Propiedad intelectual e industrial
        </h2>
        <p className="mb-6 leading-relaxed">
          Todos los contenidos (marcas, logotipos, textos, fotografías, diseños, vídeos, códigos y bases de datos) 
          pertenecen a {storeName} o a terceros que autorizaron su uso. 
          Su reproducción o distribución sin permiso escrito está estrictamente prohibida y puede derivar en acciones legales.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          4. Información comercial y exactitud
        </h2>
        <p className="mb-6 leading-relaxed">
          Nos esforzamos por mantener contenidos actualizados. Sin embargo, pueden existir diferencias mínimas en tonalidades, texturas 
          u otros detalles propios de procesos artesanales. Ante errores evidentes de precio o descripción, lo informaremos al usuario antes de concretar la compra.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          5. Protección de datos y GDPR
        </h2>
        <p className="mb-6 leading-relaxed">
          {storeName} actúa como responsable del tratamiento y cumple con los principios del GDPR: licitud, lealtad, transparencia, minimización, integridad y responsabilidad proactiva. 
          Los usuarios pueden ejercer sus derechos de acceso, rectificación, cancelación, oposición, portabilidad y limitación enviando una solicitud a {contactEmail}. 
          Si la solicitud proviene desde la Unión Europea, se aplicarán los plazos y controles adicionales previstos en dicho reglamento.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          6. Cookies y tecnologías de seguimiento
        </h2>
        <p className="mb-6 leading-relaxed">
          El sitio utiliza cookies técnicas, de preferencias y de analítica. Puedes gestionar tu consentimiento mediante el banner inicial o configurando tu navegador. 
          Más información está disponible en la sección de privacidad y en las configuraciones de cookies habilitadas en el sitio.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          7. Enlaces externos
        </h2>
        <p className="mb-6 leading-relaxed">
          El sitio puede incluir enlaces a terceros. {storeName} no se responsabiliza por el contenido, seguridad ni prácticas de privacidad de dichos sitios. 
          Te recomendamos revisar sus avisos legales antes de proporcionar cualquier información personal.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          8. Reclamaciones y autoridades
        </h2>
        <p className="mb-6 leading-relaxed">
          Puedes presentar reclamos directamente ante nosotros a través del formulario de contacto o escribiendo a {contactEmail}. 
          En Chile también puedes recurrir al SERNAC. Si te encuentras en la Unión Europea, tienes derecho a acudir a tu autoridad local de control en materia de protección de datos.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          9. Actualizaciones del aviso
        </h2>
        <p className="leading-relaxed">
          Nos reservamos el derecho de modificar este Aviso Legal para reflejar cambios normativos o de operación. 
          La versión vigente siempre estará disponible en esta página junto a su fecha de actualización.
        </p>
      </section>
    </main>
  );
};

export default LegalNoticePage;
