import { useStoreConfig } from "@/hooks/useStoreConfig.js";

const PrivacyPage = () => {
  const { config } = useStoreConfig();
  const storeName = config?.nombre_tienda || "MOA";
  const contactEmail = config?.email || "hola@moastudio.cl";
  const phone = config?.telefono || "+56 2 2345 6789";
  const address = config?.direccion || "Providencia 1234, Santiago, Chile";

  return (
    <main className="bg-[#E6E0D8] min-h-screen px-8 py-50 text-[#453F34]">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#443114] mb-6 text-center">
          Política de Privacidad y Protección de Datos
        </h1>

        <p className="text-sm text-[#A69F91] mb-8 text-center">
          Fecha de última actualización: 15 de noviembre de 2025
        </p>

        <p className="mb-6 leading-relaxed">
          En <span className="font-semibold text-[#443114]">{storeName}</span> cuidamos tu información conforme a la Ley 19.628 de Protección de Datos Personales, 
          la Ley 19.496 de Protección al Consumidor y, cuando corresponda, el Reglamento (UE) 2016/679 (GDPR). 
          Esta política explica qué datos tratamos, con qué finalidad, en qué períodos y cómo puedes ejercer tus derechos.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          1. Responsable del tratamiento
        </h2>
        <p className="mb-6 leading-relaxed">
          El responsable del tratamiento es <span className="font-medium text-[#443114]">{storeName}</span>, con domicilio en {address}, 
          teléfono {phone} y correo <span className="font-medium text-[#443114]">{contactEmail}</span>. 
          Este canal también funciona como punto de contacto para ejercer tus derechos.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          2. Datos que recopilamos
        </h2>
        <ul className="list-disc list-inside mb-6 space-y-2 ml-4 leading-relaxed">
          <li>Datos identificatorios y de contacto: nombre, RUT, dirección, teléfono y correo electrónico.</li>
          <li>Datos transaccionales: historial de pedidos, métodos de pago utilizados (nunca almacenamos datos completos de tarjetas), preferencias y tickets de servicio.</li>
          <li>Datos técnicos: dirección IP, navegador, dispositivo y cookies necesarias para el funcionamiento y la analítica del sitio.</li>
          <li>Datos comerciales: suscripciones a newsletters, encuestas y eventos.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          3. Finalidades y bases legales
        </h2>
        <p className="mb-4 leading-relaxed">
          Tratamos tus datos únicamente para las finalidades descritas a continuación y con fundamento en las bases legales aplicables:
        </p>
        <ul className="list-disc list-inside mb-6 space-y-2 ml-4 leading-relaxed">
          <li><strong>Ejecución de contrato:</strong> procesar compras, coordinar envíos, gestionar garantías y responder solicitudes.</li>
          <li><strong>Cumplimiento legal:</strong> emitir boletas/facturas, atender requerimientos de autoridades y mantener registros contables.</li>
          <li><strong>Interés legítimo:</strong> mejorar la experiencia del sitio, prevenir fraudes y realizar estadísticas agregadas.</li>
          <li><strong>Consentimiento:</strong> enviar comunicaciones comerciales, instalar cookies no esenciales o recolectar testimonios.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          4. Conservación de datos
        </h2>
        <p className="mb-6 leading-relaxed">
          Conservamos la información solo durante el tiempo necesario para cumplir la finalidad que motivó su recolección y los plazos legales aplicables. 
          Datos asociados a compras se guardan por un máximo de 7 años para fines tributarios; los registros de marketing se eliminan cuando revocas tu consentimiento 
          o transcurren 24 meses sin interacción.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          5. Destinatarios y transferencias
        </h2>
        <p className="mb-6 leading-relaxed">
          Compartimos datos solo con proveedores que actúan por cuenta de {storeName} (operadores logísticos, medios de pago, soporte tecnológico, servicios de emailing). 
          Todos están sujetos a obligaciones de confidencialidad y encargos de tratamiento.  
          Si llegáramos a transferir información fuera de Chile, aseguramos un nivel de protección equivalente o las salvaguardas exigidas por el GDPR.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          6. Cookies y tecnologías similares
        </h2>
        <p className="mb-6 leading-relaxed">
          Utilizamos cookies necesarias para el funcionamiento del sitio y cookies opcionales para analítica y personalización. 
          Puedes configurar tu navegador para rechazarlas o borrar el historial en cualquier momento, aunque algunas funciones podrían verse limitadas. 
          El banner inicial y el Centro de Preferencias permiten gestionar las cookies no esenciales.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          7. Derechos de los titulares
        </h2>
        <p className="mb-4 leading-relaxed">
          Puedes ejercer gratuitamente los siguientes derechos:
        </p>
        <ul className="list-disc list-inside mb-6 space-y-2 ml-4 leading-relaxed">
          <li><strong>Acceso:</strong> conocer qué datos tratamos y obtener copia.</li>
          <li><strong>Rectificación:</strong> actualizar o corregir información incompleta o inexacta.</li>
          <li><strong>Cancelación/Eliminación:</strong> solicitar la supresión cuando los datos ya no sean necesarios o revoques tu consentimiento.</li>
          <li><strong>Oposición:</strong> negarte al tratamiento basado en intereses legítimos o marketing directo.</li>
          <li><strong>Portabilidad y limitación:</strong> aplicables en contextos regulados por el GDPR.</li>
        </ul>
        <p className="mb-6 leading-relaxed">
          Para ejercerlos escribe a <span className="font-medium text-[#443114]">{contactEmail}</span>. 
          Deberás acompañar un medio que permita acreditar tu identidad. Responderemos dentro de 10 días hábiles en Chile 
          o 30 días cuando sea aplicable el GDPR. También puedes reclamar ante el SERNAC o la autoridad de protección de datos competente.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          8. Tratamiento de menores
        </h2>
        <p className="mb-6 leading-relaxed">
          Nuestros productos están dirigidos a mayores de 18 años. 
          Si detectamos el tratamiento de datos de menores sin autorización del padre, madre o tutor, los eliminaremos de inmediato.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          9. Seguridad de la información
        </h2>
        <p className="mb-6 leading-relaxed">
          Implementamos controles administrativos, técnicos y físicos para proteger tus datos (cifrado TLS, controles de acceso, backups y monitoreo). 
          A pesar de ello, ningún sistema es infalible; por eso te recomendamos resguardar tus credenciales y notificarnos ante cualquier sospecha de vulneración.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          10. Actualizaciones de esta política
        </h2>
        <p className="mb-6 leading-relaxed">
          Podemos modificar la presente Política para reflejar cambios legales o internos. 
          Publicaremos la versión actualizada con su respectiva fecha y, si los cambios son sustanciales, te los notificaremos mediante correo o banner destacado.
        </p>

        <h2 className="text-2xl font-semibold text-[#443114] mb-3 mt-10">
          11. Contacto
        </h2>
        <p className="leading-relaxed">
          Si tienes preguntas, deseas ejercer un derecho o reportar un incidente de seguridad, contáctanos en{" "}
          <span className="font-medium text-[#443114]">{contactEmail}</span> o al teléfono {phone}. 
          También puedes visitarnos en {address}.
        </p>
      </section>
    </main>
  );
};

export default PrivacyPage;
