import {
  createUserModel,
  getUserByIdModel,
  updateUserModel,
} from "../models/usersModel.js";
import { ValidationError, NotFoundError } from "../utils/error.utils.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await createUserModel(name, email, phone, password);
    res.status(201).json({
      message: "Usuario creado con éxito",
      user,
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);

    if (error.code === "23505") {
      return next(new ValidationError('El correo ya está registrado', [
        { field: 'email', message: 'Este email ya existe en el sistema' }
      ]));
    }

    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getUserByIdModel(id);

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    return res.json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, telefono } = req.body;

    if (!nombre || nombre.trim() === "") {
      throw new ValidationError('El nombre es obligatorio', [
        { field: 'nombre', message: 'Este campo no puede estar vacío' }
      ]);
    }

    const updatedUser = await updateUserModel({
      id,
      nombre,
      telefono,
    });

    return res.status(200).json({
      message: "Usuario actualizado",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    next(error);
  }
};
