import { productsModel } from "../models/productsModel.js";
import { categoriesModel } from "../models/categoriesModel.js";
import { AppError } from "../utils/error.utils.js";

export const productAdminController = {
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

    const updateData = {};      if (categoria_id !== undefined) updateData.categoria_id = categoria_id;
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

      const existingProduct = await productsModel.getById(productId);
      if (!existingProduct) {
        throw new AppError('Producto no encontrado', 404);
      }

      let success = false;
      let message = '';

      if (permanent === 'true') {
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

      const existingProduct = await productsModel.getById(productId);
      if (!existingProduct) {
        throw new AppError('Producto no encontrado', 404);
      }

      let product = null;

      if (operation === 'set') {
        if (quantity < 0) {
          throw new AppError('El stock no puede ser negativo', 400);
        }
        product = await productsModel.update(productId, { stock: quantity });
      } else if (operation === 'add') {
        product = await productsModel.updateStock(productId, Math.abs(quantity));
      } else if (operation === 'subtract') {
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

  // EXPORTAR CSV
  async exportProductsCSV(req, res, next) {
    try {
      const { search, status, categoryId, onlyLowStock } = req.query;

      const options = {
        page: 1,
        limit: 10000,
        search,
        categoryId: categoryId ? parseInt(categoryId) : null,
        status,
        onlyLowStock: onlyLowStock === 'true'
      };

      const result = await productsModel.getAll(options);
      
      const categories = await categoriesModel.getAll();
      const categoryMap = Object.fromEntries(
        categories.map(c => [c.id, c.name])
      );

      const headers = ['SKU', 'Nombre', 'Categoría', 'Precio (CLP)', 'Stock', 'Estado'];
      const rows = result.items.map(item => [
        item.sku || '',
        `"${(item.name || '').replace(/"/g, '""')}"`, 
        `"${(categoryMap[item.fk_category_id] || '').replace(/"/g, '""')}"`,
        Math.round((item.price || 0) / 100),
        item.stock || 0,
        item.status || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="productos_moa_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); 
    } catch (error) {
      next(error);
    }
  }
};

export const createProduct = productAdminController.createProduct;
export const updateProduct = productAdminController.updateProduct;
export const deleteProduct = productAdminController.deleteProduct;
export const updateStock = productAdminController.updateStock;
export const getLowStockProducts = productAdminController.getLowStockProducts;
export const getProductStats = productAdminController.getProductStats;
export const exportProductsCSV = productAdminController.exportProductsCSV;

export default productAdminController;
