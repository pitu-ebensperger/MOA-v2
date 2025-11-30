import pool from "../../database/config.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/error.utils.js";
import { createAdminCustomerModel, updateAdminCustomerModel } from "../models/usersModel.js";

/**
 * Controller de administración de usuarios
 * Gestión CRUD de usuarios y clientes por administradores
 */

export class UserAdminController {
  static async getUsers(req, res, next) {
    try {
      const { page = "1", limit = "20", search = "" } = req.query;
      const parsedPage = Number.parseInt(page, 10);
      const parsedLimit = Number.parseInt(limit, 10);
      const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const pageSize = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
      const offset = (pageNumber - 1) * pageSize;

      const whereClauses = ["rol_code != 'ADMIN'"];
      const whereValues = [];

      if (search) {
        whereValues.push(`%${search}%`);
        const searchIndex = whereValues.length;
        whereClauses.push(
          `(nombre ILIKE $${searchIndex} OR email ILIKE $${searchIndex})`,
        );
      }

      const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
      const queryValues = [...whereValues];
      const limitPlaceholder = queryValues.length + 1;
      const offsetPlaceholder = queryValues.length + 2;

      const query = `
        SELECT 
          usuario_id AS id,
          public_id AS "publicId",
          nombre,
          email,
          telefono,
          status,
          rol_code AS "rolCode",
          creado_en AS "createdAt",
          (
            SELECT COUNT(*)::int
            FROM ordenes o
            WHERE o.usuario_id = usuarios.usuario_id
          ) AS "orderCount"
        FROM usuarios
        ${whereClause}
        ORDER BY creado_en DESC
        LIMIT $${limitPlaceholder}
        OFFSET $${offsetPlaceholder}
      `;

      queryValues.push(pageSize, offset);
      const result = await pool.query(query, queryValues);

      const countValues = [...whereValues];
      const countQuery = `SELECT COUNT(*) FROM usuarios ${whereClause}`;
      const countResult = await pool.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count, 10);

      res.json({
        success: true,
        data: {
          items: result.rows,
          total,
          page: pageNumber,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req, res, next) {
    try {
      const { nombre, email, telefono, rol_code, password, status } = req.body;

      if (!nombre || !email) {
        return res.status(400).json({
          success: false,
          message: "Nombre y correo son obligatorios",
        });
      }

      const newCustomer = await createAdminCustomerModel({
        nombre,
        email,
        telefono,
        password,
        rol_code: rol_code || "CLIENT",
        status: status || "activo",
      });

      res.status(201).json({
        success: true,
        message: "Cliente creado correctamente",
        data: newCustomer,
      });
    } catch (error) {
      console.error("Error creando cliente admin:", error);
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "El correo ya está registrado",
        });
      }
      next(error);
    }
  }

  static async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, email, telefono, status, rol_code } = req.body;

      if (!nombre && !email && !telefono && !status && !rol_code) {
        return res.status(400).json({
          success: false,
          message: "Debes proporcionar al menos un campo para actualizar",
        });
      }

      const updates = {
        ...(nombre !== undefined ? { nombre } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(telefono !== undefined ? { telefono } : {}),
      };

      if (status !== undefined) {
        updates.status = status;
      }

      if (rol_code) {
        updates.rol_code = rol_code;
      }

      const updatedCustomer = await updateAdminCustomerModel({
        id,
        ...updates,
      });

      if (!updatedCustomer) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Cliente actualizado",
        data: updatedCustomer,
      });
    } catch (error) {
      console.error("Error actualizando cliente admin:", error);
      next(error);
    }
  }

  static async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar que el usuario existe
      const userCheck = await pool.query(
        'SELECT usuario_id, rol_code, nombre, email FROM usuarios WHERE usuario_id = $1',
        [id]
      );

      if (userCheck.rows.length === 0) {
        throw new NotFoundError('Cliente');
      }

      const user = userCheck.rows[0];

      // No permitir eliminar administradores
      if (user.rol_code === 'ADMIN') {
        throw new ForbiddenError('No se pueden eliminar usuarios administradores');
      }

      // No permitir que un admin se elimine a sí mismo
      if (parseInt(id) === req.user.id) {
        throw new ForbiddenError('No puedes eliminar tu propia cuenta');
      }

      // Verificar si tiene órdenes
      const ordersCheck = await pool.query(
        'SELECT COUNT(*) as count FROM ordenes WHERE usuario_id = $1',
        [id]
      );

      const hasOrders = parseInt(ordersCheck.rows[0].count, 10) > 0;

      if (hasOrders) {
        // Si tiene órdenes, NO eliminar físicamente, solo desactivar
        // Esto preserva el historial de compras y datos de auditoría
        await pool.query(
          `UPDATE usuarios 
           SET status = 'inactivo',
               email = $1,
               nombre = $2
           WHERE usuario_id = $3`,
          [
            `deleted_${Date.now()}_${user.email}`, // Anonimizar email
            `[ELIMINADO] ${user.nombre}`,
            id
          ]
        );

        res.json({
          success: true,
          message: 'Cliente desactivado correctamente (tiene órdenes asociadas)',
          data: { 
            deleted: false, 
            deactivated: true,
            reason: 'Usuario con historial de órdenes' 
          }
        });
      } else {
        // Si NO tiene órdenes, eliminar físicamente
        // Esto eliminará automáticamente: direcciones, wishlist, carrito (por CASCADE)
        await pool.query(
          'DELETE FROM usuarios WHERE usuario_id = $1',
          [id]
        );

        res.json({
          success: true,
          message: 'Cliente eliminado correctamente',
          data: { 
            deleted: true, 
            deactivated: false 
          }
        });
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { rolCode } = req.body;

      if (!rolCode) {
        throw new ValidationError('Código de rol es requerido');
      }

      const userCheck = await pool.query(
        'SELECT usuario_id FROM usuarios WHERE usuario_id = $1',
        [id]
      );

      if (userCheck.rows.length === 0) {
        throw new NotFoundError('Usuario');
      }

      if (parseInt(id) === req.user.id && rolCode.toUpperCase() !== 'ADMIN') {
        throw new ForbiddenError('No puedes remover tus propios privilegios de administrador');
      }

      const updateResult = await pool.query(
        `UPDATE usuarios 
         SET rol_code = $1 
         WHERE usuario_id = $2 
         RETURNING usuario_id AS id, nombre, email, rol_code AS "rolCode"`,
        [rolCode, id]
      );

      res.json({
        success: true,
        message: 'Rol actualizado correctamente',
        data: updateResult.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserAdminController;
