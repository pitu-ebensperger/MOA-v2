import PropTypes from "prop-types";

//PRODUCTO
export const ProductShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  slug: PropTypes.string,
  name: PropTypes.string,
  nombre: PropTypes.string,
  price: PropTypes.number,
  precio: PropTypes.number,
  description: PropTypes.string,
  descripcion: PropTypes.string,
  stock: PropTypes.number,
  imgUrl: PropTypes.string,
  image: PropTypes.string,
  gallery: PropTypes.arrayOf(PropTypes.string),
  categoria_id: PropTypes.number,
  category_id: PropTypes.number,
  categoria_nombre: PropTypes.string,
  active: PropTypes.bool,
  activo: PropTypes.bool,
});

//ORDENES
export const OrderShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pedido_id: PropTypes.number,
  order_code: PropTypes.string,
  codigo_pedido: PropTypes.string,
  usuario_id: PropTypes.number,
  customer_id: PropTypes.number,
  total: PropTypes.number,
  subtotal: PropTypes.number,
  status: PropTypes.string,
  estado: PropTypes.string,
  payment_status: PropTypes.string,
  estado_pago: PropTypes.string,
  shipment_status: PropTypes.string,
  estado_envio: PropTypes.string,
  created_at: PropTypes.string,
  fecha_creacion: PropTypes.string,
  updated_at: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
});

//DIRECCIONES
export const AddressShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  direccion_id: PropTypes.number,
  usuario_id: PropTypes.number,
  alias: PropTypes.string,
  calle: PropTypes.string,
  street: PropTypes.string,
  numero: PropTypes.string,
  number: PropTypes.string,
  depto: PropTypes.string,
  apartment: PropTypes.string,
  comuna: PropTypes.string,
  city: PropTypes.string,
  region: PropTypes.string,
  codigo_postal: PropTypes.string,
  postal_code: PropTypes.string,
  telefono: PropTypes.string,
  phone: PropTypes.string,
  es_predeterminada: PropTypes.bool,
  is_default: PropTypes.bool,
});

//USER
export const UserShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  usuario_id: PropTypes.number,
  nombre: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string.isRequired,
  telefono: PropTypes.string,
  phone: PropTypes.string,
  role_code: PropTypes.string,
  role: PropTypes.string,
  rol_code: PropTypes.string,
});

//CATEGORIA
export const CategoryShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  categoria_id: PropTypes.number,
  nombre: PropTypes.string,
  name: PropTypes.string,
  descripcion: PropTypes.string,
  description: PropTypes.string,
  slug: PropTypes.string,
  activa: PropTypes.bool,
  active: PropTypes.bool,
});

//ITEMS
export const CartItemShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  producto_id: PropTypes.number,
  product_id: PropTypes.number,
  name: PropTypes.string,
  nombre: PropTypes.string,
  price: PropTypes.number,
  precio: PropTypes.number,
  quantity: PropTypes.number,
  cantidad: PropTypes.number,
  imgUrl: PropTypes.string,
  image: PropTypes.string,
  subtotal: PropTypes.number,
});
