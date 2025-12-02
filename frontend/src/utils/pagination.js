/**
 * Pagina una colección de elementos
 * @param {Array} collection - La colección a paginar
 * @param {Object} options - Opciones de paginación
 * @param {number} options.page - Número de página (1-indexed)
 * @param {number} options.limit - Cantidad de elementos por página
 * @returns {Array} Elementos de la página solicitada
 */
export function paginate(collection, { page = 1, limit = 10 }) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return collection.slice(startIndex, endIndex);
}
