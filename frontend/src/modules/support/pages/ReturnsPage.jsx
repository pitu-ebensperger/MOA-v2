import { Package, RotateCcw, Clock, CheckCircle2 } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-serif text-4xl font-light text-secondary1">
        Cambios y Devoluciones
      </h1>
      <p className="mt-4 text-lg text-neutral-600">
        En MOA queremos que estés completamente satisfecho con tu compra. Si necesitas realizar un cambio o devolución, aquí te explicamos cómo hacerlo.
      </p>

      <div className="mt-12 space-y-8">
        {/* Política de devoluciones */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="h-6 w-6 text-primary1" />
            <h2 className="text-2xl font-semibold text-neutral-800">Política de Devoluciones</h2>
          </div>
          <div className="space-y-3 text-neutral-600">
            <p>
              Aceptamos devoluciones dentro de los <strong>30 días</strong> posteriores a la recepción de tu pedido.
            </p>
            <p>
              Los productos deben estar en su estado original, sin usar, con todas sus etiquetas y en su embalaje original.
            </p>
            <p>
              Para iniciar una devolución, contáctanos a través de nuestro correo{" "}
              <a href="mailto:devoluciones@moa.cl" className="text-primary1 hover:underline">
                devoluciones@moa.cl
              </a>{" "}
              con tu número de orden.
            </p>
          </div>
        </section>

        {/* Proceso de devolución */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-primary1" />
            <h2 className="text-2xl font-semibold text-neutral-800">Proceso de Devolución</h2>
          </div>
          <ol className="space-y-4 text-neutral-600">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary1 text-xs font-bold text-white">
                1
              </span>
              <div>
                <strong>Solicita tu devolución:</strong> Envíanos un correo con tu número de orden y los productos que deseas devolver.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary1 text-xs font-bold text-white">
                2
              </span>
              <div>
                <strong>Prepara el paquete:</strong> Empaca los productos en su embalaje original junto con la factura.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary1 text-xs font-bold text-white">
                3
              </span>
              <div>
                <strong>Envía el paquete:</strong> Puedes dejarlo en nuestro showroom o coordinamos la recolección sin costo.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary1 text-xs font-bold text-white">
                4
              </span>
              <div>
                <strong>Reembolso:</strong> Una vez recibido y verificado el producto, procesaremos tu reembolso en 5-7 días hábiles.
              </div>
            </li>
          </ol>
        </section>

        {/* Cambios */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-6 w-6 text-primary1" />
            <h2 className="text-2xl font-semibold text-neutral-800">Cambios de Producto</h2>
          </div>
          <div className="space-y-3 text-neutral-600">
            <p>
              Si deseas cambiar un producto por otro, contáctanos y te ayudaremos con el proceso.
            </p>
            <p>
              Los cambios están sujetos a disponibilidad de stock. En caso de diferencia de precio, se aplicará el ajuste correspondiente.
            </p>
          </div>
        </section>

        {/* Plazos */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-primary1" />
            <h2 className="text-2xl font-semibold text-neutral-800">Plazos de Reembolso</h2>
          </div>
          <div className="space-y-3 text-neutral-600">
            <p>
              Los reembolsos se procesan al método de pago original dentro de 5-7 días hábiles después de recibir el producto.
            </p>
            <p>
              El tiempo que tarda en reflejarse en tu cuenta depende de tu institución financiera (puede tomar hasta 10 días adicionales).
            </p>
          </div>
        </section>

        {/* Excepciones */}
        <section className="rounded-lg bg-neutral-50 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-3">Productos No Retornables</h3>
          <ul className="list-disc list-inside space-y-2 text-neutral-600">
            <li>Productos personalizados o hechos a medida</li>
            <li>Artículos en oferta o liquidación (salvo defecto de fábrica)</li>
            <li>Productos dañados por mal uso o manipulación inadecuada</li>
          </ul>
        </section>

        {/* Contacto */}
        <section className="border-t border-neutral-200 pt-8">
          <h3 className="text-lg font-semibold text-neutral-800 mb-3">¿Necesitas ayuda?</h3>
          <p className="text-neutral-600">
            Si tienes dudas sobre cambios o devoluciones, contáctanos:
          </p>
          <div className="mt-4 space-y-2 text-neutral-600">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:devoluciones@moa.cl" className="text-primary1 hover:underline">
                devoluciones@moa.cl
              </a>
            </p>
            <p>
              <strong>Teléfono:</strong>{" "}
              <a href="tel:+56912345678" className="text-primary1 hover:underline">
                +569 1234 5678
              </a>
            </p>
            <p>
              <strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hrs
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
