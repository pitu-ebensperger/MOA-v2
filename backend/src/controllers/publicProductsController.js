import { productsModel } from "../models/productsModel.js";
import { AppError } from "../utils/error.utils.js";

export const productsController = {
  async getProducts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        categoryId,
        status,
        minPrice,
        maxPrice,
        onlyLowStock,
        sortBy,
        sortOrder
      } = req.query;

      const offsetParam = req.query.offset ?? null;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offsetNum = offsetParam !== null ? parseInt(offsetParam, 10) : null;

      if (pageNum < 1) {
        throw new AppError('El número de página debe ser mayor a 0', 400);
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new AppError('El límite debe estar entre 1 y 100', 400);
      }

      const options = {
        page: pageNum,
        limit: limitNum,
        offset: Number.isFinite(offsetNum) ? Math.max(0, offsetNum) : null,
        search,
        categoryId: categoryId ? parseInt(categoryId) : null,
        status,
        minPrice: minPrice ? parseInt(minPrice) : null,
        maxPrice: maxPrice ? parseInt(maxPrice) : null,
        onlyLowStock: onlyLowStock === 'true',
        sortBy,
        sortOrder
      };

      const result = await productsModel.getAll(options);

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        filters: {
          search,
          categoryId,
          status,
          minPrice,
          maxPrice,
          onlyLowStock: onlyLowStock === 'true'
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      let product = null;

      if (/^\d+$/.test(id)) {
        product = await productsModel.getById(parseInt(id));
      }

      if (!product) {
        product = await productsModel.getByPublicId(id);
      }

      if (!product) {
        throw new AppError('Producto no encontrado', 404);
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const product = await productsModel.getBySlug(slug);

      if (!product) {
        throw new AppError('Producto no encontrado', 404);
      }

      if (product.status !== 'activo' && !req.user?.isAdmin) {
        throw new AppError('Producto no disponible', 404);
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  async searchProducts(req, res, next) {
    try {
      const {
        categoria_id,
        nombre,
        slug,
        sku,
        precio_cents,
        compare_at_price_cents,
        stock,
        status,
        descripcion,
        descripcion_corta,
        img_url,
        gallery,
        badge,
        tags,
        color,
        material,
        dimensions,
        weight,
        specs
      } = req.body;

      if (!categoria_id || !nombre || !slug || !sku || precio_cents === undefined) {
        throw new AppError(
          'Campos requeridos: categoria_id, nombre, slug, sku, precio_cents',
          400
        );
      }

      const category = await categoriesModel.getById(categoria_id);
      if (!category) {
        throw new AppError('Categoría no encontrada', 400);
      }

      const slugExists = await productsModel.slugExists(slug);
      if (slugExists) {
        throw new AppError('Ya existe un producto con ese slug', 400);
      }

      const skuExists = await productsModel.skuExists(sku);
      if (skuExists) {
        throw new AppError('Ya existe un producto con ese SKU', 400);
      }

      if (precio_cents < 0) {
        throw new AppError('El precio no puede ser negativo', 400);
      }

      if (stock !== undefined && stock < 0) {
        throw new AppError('El stock no puede ser negativo', 400);
      }

      const validStatuses = ['activo', 'inactivo', 'descontinuado'];
      if (status && !validStatuses.includes(status)) {
        throw new AppError(`Status debe ser uno de: ${validStatuses.join(', ')}`, 400);
      }

      const productData = {
        categoria_id,
        nombre: nombre.trim(),
        slug: slug.toLowerCase().trim(),
        sku: sku.toUpperCase().trim(),
        precio_cents,
        compare_at_price_cents,
        stock,
        status: status || 'activo',
        descripcion: descripcion?.trim() || null,
        descripcion_corta: descripcion_corta?.trim() || null,
        img_url: img_url?.trim() || null,
        gallery: Array.isArray(gallery) ? gallery : [],
        badge: Array.isArray(badge) ? badge : [],
        tags: Array.isArray(tags) ? tags : [],
        color: color?.trim() || null,
        material: material?.trim() || null,
        dimensions: dimensions || null,
        weight: weight || null,
        specs: specs || null
      };

      const product = await productsModel.create(productData);

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
};

// Exportaciones individuales para compatibilidad con las rutas
export const getProducts = productsController.getProducts;
export const getProduct = productsController.getProduct;
export const getProductBySlug = productsController.getProductBySlug;
export const searchProducts = productsController.searchProducts;

export default productsController;
