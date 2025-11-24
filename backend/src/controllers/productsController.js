import { pool } from "../../database/config.js";
import { productsModel } from "../models/productsModel.js";
import { categoriesModel } from "../models/categoriesModel.js";
import { AppError, UnauthorizedError, ForbiddenError } from "../utils/error.utils.js";


export const productsController = {
  /*productos con filtros y paginación */
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

  /*producto por ID o public_id */
  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      let product = null;

      // Intentar buscar por ID numérico primero
      if (/^\d+$/.test(id)) {
        product = await productsModel.getById(parseInt(id));
      }

      // Si no se encuentra, intentar por public_id
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

  /* Obtener producto por slug (para el frontend público)  */
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

  /* Crear nuevo producto (admin)*/
  async createProduct(req, res, next) {
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

      // Validaciones requeridas
      if (!categoria_id || !nombre || !slug || !sku || precio_cents === undefined) {
        throw new AppError(
          'Campos requeridos: categoria_id, nombre, slug, sku, precio_cents',
          400
        );
      }

      // Verificar que la categoría existe
      const category = await categoriesModel.getById(categoria_id);
      if (!category) {
        throw new AppError('Categoría no encontrada', 400);
      }

      // Verificar que el slug no existe
      const slugExists = await productsModel.slugExists(slug);
      if (slugExists) {
        throw new AppError('Ya existe un producto con ese slug', 400);
      }

      // Verificar que el SKU no existe
      const skuExists = await productsModel.skuExists(sku);
      if (skuExists) {
        throw new AppError('Ya existe un producto con ese SKU', 400);
      }

      // Validar precio
      if (precio_cents < 0) {
        throw new AppError('El precio no puede ser negativo', 400);
      }

      // Validar stock
      if (stock !== undefined && stock < 0) {
        throw new AppError('El stock no puede ser negativo', 400);
      }

      // Validar status
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
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        throw new AppError('ID de producto inválido', 400);
      }

      // Verificar que el producto existe
      const existingProduct = await productsModel.getById(productId);
      if (!existingProduct) {
        throw new AppError('Producto no encontrado', 404);
      }

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

      // Validaciones si se proporcionan
      if (categoria_id !== undefined) {
        const category = await categoriesModel.getById(categoria_id);
        if (!category) {
          throw new AppError('Categoría no encontrada', 400);
        }
      }

      if (slug !== undefined) {
        const slugExists = await productsModel.slugExists(slug, productId);
        if (slugExists) {
          throw new AppError('Ya existe un producto con ese slug', 400);
        }
      }

      if (sku !== undefined) {
        const skuExists = await productsModel.skuExists(sku, productId);
        if (skuExists) {
          throw new AppError('Ya existe un producto con ese SKU', 400);
        }
      }

      if (precio_cents !== undefined && precio_cents < 0) {
        throw new AppError('El precio no puede ser negativo', 400);
      }

      if (stock !== undefined && stock < 0) {
        throw new AppError('El stock no puede ser negativo', 400);
      }

      if (status !== undefined) {
        const validStatuses = ['activo', 'inactivo', 'descontinuado'];
        if (!validStatuses.includes(status)) {
          throw new AppError(`Status debe ser uno de: ${validStatuses.join(', ')}`, 400);
        }
      }

      // Preparar datos para actualización (solo campos presentes)
      const updateData = {};

      if (categoria_id !== undefined) updateData.categoria_id = categoria_id;
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (slug !== undefined) updateData.slug = slug.toLowerCase().trim();
      if (sku !== undefined) updateData.sku = sku.toUpperCase().trim();
      if (precio_cents !== undefined) updateData.precio_cents = precio_cents;
      if (compare_at_price_cents !== undefined) updateData.compare_at_price_cents = compare_at_price_cents;
      if (stock !== undefined) updateData.stock = stock;
      if (status !== undefined) updateData.status = status;
      if (descripcion !== undefined) updateData.descripcion = descripcion?.trim() || null;
      if (descripcion_corta !== undefined) updateData.descripcion_corta = descripcion_corta?.trim() || null;
      if (img_url !== undefined) updateData.img_url = img_url?.trim() || null;
      if (gallery !== undefined) updateData.gallery = Array.isArray(gallery) ? gallery : [];
      if (badge !== undefined) updateData.badge = Array.isArray(badge) ? badge : [];
      if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
      if (color !== undefined) updateData.color = color?.trim() || null;
      if (material !== undefined) updateData.material = material?.trim() || null;
      if (dimensions !== undefined) updateData.dimensions = dimensions || null;
      if (weight !== undefined) updateData.weight = weight || null;
      if (specs !== undefined) updateData.specs = specs || null;

      const product = await productsModel.update(productId, updateData);

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        throw new AppError('ID de producto inválido', 400);
      }

      // Verificar que el producto existe
      const existingProduct = await productsModel.getById(productId);
      if (!existingProduct) {
        throw new AppError('Producto no encontrado', 404);
      }

      let success = false;
      let message = '';

      if (permanent === 'true') {
        // Eliminación permanente
        try {
          success = await productsModel.hardDelete(productId);
          message = 'Producto eliminado permanentemente';
        } catch (error) {
          if (error.message.includes('orden(es)')) {
            throw new AppError(error.message, 400);
          }
          throw error;
        }
      } else {
        // Eliminación suave (cambiar status a inactivo)
        success = await productsModel.softDelete(productId);
        message = 'Producto marcado como inactivo';
      }

      if (!success) {
        throw new AppError('Error al eliminar el producto', 500);
      }

      res.json({
        success: true,
        message
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, operation = 'set' } = req.body;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        throw new AppError('ID de producto inválido', 400);
      }

      if (quantity === undefined || isNaN(quantity)) {
        throw new AppError('Cantidad requerida y debe ser numérica', 400);
      }

      // Verificar que el producto existe
      const existingProduct = await productsModel.getById(productId);
      if (!existingProduct) {
        throw new AppError('Producto no encontrado', 404);
      }

      let product = null;

      if (operation === 'set') {
        // Establecer stock específico
        if (quantity < 0) {
          throw new AppError('El stock no puede ser negativo', 400);
        }
        product = await productsModel.update(productId, { stock: quantity });
      } else if (operation === 'add') {
        // Agregar stock
        product = await productsModel.updateStock(productId, Math.abs(quantity));
      } else if (operation === 'subtract') {
        // Restar stock
        product = await productsModel.updateStock(productId, -Math.abs(quantity));
      } else {
        throw new AppError('Operación debe ser: set, add, o subtract', 400);
      }

      if (!product) {
        throw new AppError('No se pudo actualizar el stock. Verifique que haya stock suficiente.', 400);
      }

      res.json({
        success: true,
        message: 'Stock actualizado exitosamente',
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  async getLowStockProducts(req, res, next) {
    try {
      const { threshold = 5 } = req.query;
      const thresholdNum = parseInt(threshold);

      if (isNaN(thresholdNum) || thresholdNum < 0) {
        throw new AppError('El umbral debe ser un número mayor o igual a 0', 400);
      }

      const products = await productsModel.getLowStockProducts(thresholdNum);

      res.json({
        success: true,
        data: products,
        threshold: thresholdNum
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductStats(req, res, next) {
    try {
      const stats = await productsModel.getStats();

      res.json({
        success: true,
        data: {
          total: stats.total,
          active: stats.active,
          inactive: stats.inactive,
          lowStock: stats.low_stock,
          outOfStock: stats.out_of_stock,
          averagePriceCents: stats.avg_price_cents,
          totalStock: stats.total_stock
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async searchProducts(req, res, next) {
    try {
      const {
        q: search,
        category,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20,
        sortBy = 'nombre',
        sortOrder = 'ASC'
      } = req.query;

      if (!search || search.trim().length < 2) {
        throw new AppError('La búsqueda debe tener al menos 2 caracteres', 400);
      }

      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 50), // Max 50 para búsqueda pública
        search: search.trim(),
        categoryId: category ? parseInt(category) : null,
        minPrice: minPrice ? parseInt(minPrice) : null,
        maxPrice: maxPrice ? parseInt(maxPrice) : null,
        status: 'activo', // Solo productos activos en búsqueda pública
        sortBy,
        sortOrder
      };

      const result = await productsModel.getAll(options);

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        query: search
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Exportar productos a CSV (respeta filtros)
   * GET /admin/productos/export?search=&status=&categoryId=&onlyLowStock=
   */
  async exportProductsCSV(req, res, next) {
    try {
      const { search, status, categoryId, onlyLowStock } = req.query;

      // Obtener TODOS los productos respetando filtros (sin paginación)
      const options = {
        page: 1,
        limit: 10000, // Límite alto para obtener todos
        search,
        categoryId: categoryId ? parseInt(categoryId) : null,
        status,
        onlyLowStock: onlyLowStock === 'true'
      };

      const result = await productsModel.getAll(options);
      
      // Obtener categorías para mapeo
      const categories = await categoriesModel.getAll();
      const categoryMap = Object.fromEntries(
        categories.map(c => [c.id, c.name])
      );

      // Generar CSV
      const headers = ['SKU', 'Nombre', 'Categoría', 'Precio (CLP)', 'Stock', 'Estado'];
      const rows = result.items.map(item => [
        item.sku || '',
        `"${(item.name || '').replace(/"/g, '""')}"`, // Escape comillas dobles
        `"${(categoryMap[item.fk_category_id] || '').replace(/"/g, '""')}"`,
        Math.round((item.price || 0) / 100), // Convertir de centavos a pesos
        item.stock || 0,
        item.status || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Headers para descarga
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="productos_moa_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // BOM para UTF-8 en Excel
    } catch (error) {
      next(error);
    }
  }
};

// Exportaciones individuales para compatibilidad con las rutas
export const getProducts = productsController.getProducts;
export const getProductById = productsController.getProduct;
export const getProductBySlug = productsController.getProductBySlug;
export const createProduct = productsController.createProduct;
export const updateProduct = productsController.updateProduct;
export const deleteProduct = productsController.deleteProduct;
export const updateStock = productsController.updateStock;
export const getLowStockProducts = productsController.getLowStockProducts;
export const getProductStats = productsController.getProductStats;
export const searchProducts = productsController.searchProducts;
export const exportProductsCSV = productsController.exportProductsCSV;
