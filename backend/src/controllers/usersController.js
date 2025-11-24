import {
  createUserModel,
  getUserByIdModel,
  updateUserModel,
} from "../models/usersModel.js";

export const registerUser = async (req, res) => {
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
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    res.status(500).json({ message: "Error al crear usuario" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserByIdModel(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono } = req.body;

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ message: "El nombre es obligatorio" });
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
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};
