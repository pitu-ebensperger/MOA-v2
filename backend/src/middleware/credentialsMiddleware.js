import { ValidationError } from "../utils/error.utils.js";

const buildMissingFieldsError = (fieldsMap) => {
  const errors = Object.entries(fieldsMap)
    .filter(([, value]) => !value)
    .map(([field]) => ({ field, message: `${field} es requerido` }));

  if (!errors.length) return null;
  return new ValidationError("Se deben enviar todos los campos", errors);
};

export const checkRegisterCredentials = (req, res, next) => {
  const { name, email, password } = req.body;
  const validationError = buildMissingFieldsError({ name, email, password });
  if (validationError) {
    return next(validationError);
  }
  next();
};

export const checkLoginCredentials = (req, res, next) => {
  const { email, password } = req.body;
  const validationError = buildMissingFieldsError({ email, password });
  if (validationError) {
    return next(validationError);
  }
  next();
};
