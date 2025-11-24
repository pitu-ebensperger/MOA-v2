const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  INVALID_TEXT_REPRESENTATION: "22P02",
};

const timestamp = () => new Date().toISOString();

export class AppError extends Error {
  constructor(message = "Error interno del servidor", statusCode = 500, { isOperational = true, errors = null } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.timestamp = timestamp();
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Solicitud inválida", errors = []) {
    super(message, 400, { errors });
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso denegado") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con el estado actual del recurso") {
    super(message, 409);
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const buildErrorResponse = ({ message, errors }) => ({
  success: false,
  message,
  ...(errors ? { errors } : {}),
  timestamp: timestamp(),
});

const handlePgError = (err, res) => {
  if (err.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
    return res.status(409).json(
      buildErrorResponse({
        message: "Ya existe un registro con esos datos",
      }),
    );
  }
  if (err.code === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
    return res.status(409).json(
      buildErrorResponse({
        message: "No se puede completar la operación por referencias en uso",
      }),
    );
  }
  if (err.code === PG_ERROR_CODES.INVALID_TEXT_REPRESENTATION) {
    return res.status(400).json(
      buildErrorResponse({
        message: "Formato de dato inválido en la solicitud",
      }),
    );
  }
  return null;
};

const handleJwtError = (err, res) => {
  if (err.name === "TokenExpiredError") {
    return res.status(401).json(
      buildErrorResponse({
        message: "Token expirado",
      }),
    );
  }
  if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
    return res.status(401).json(
      buildErrorResponse({
        message: "Token inválido",
      }),
    );
  }
  return null;
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const error = err instanceof Error ? err : new Error(String(err ?? "Error desconocido"));

  console.error(`[${timestamp()}] ${req.method} ${req.originalUrl}`, error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      buildErrorResponse({
        message: error.message,
        errors: error.errors,
      }),
    );
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json(
      buildErrorResponse({
        message: "JSON inválido en el cuerpo de la solicitud",
      }),
    );
  }

  const pgHandled = handlePgError(error, res);
  if (pgHandled) return pgHandled;

  const jwtHandled = handleJwtError(error, res);
  if (jwtHandled) return jwtHandled;

  return res.status(500).json(
    buildErrorResponse({
      message: "Error interno del servidor",
    }),
  );
};


export const handleError = (res, error, defaultMessage = 'Error interno del servidor') => {
  console.error('Error:', error);
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || null
    });
  }

  return res.status(500).json({
    success: false,
    message: defaultMessage
  });
};
