const AppError = require('../utils/AppError');

// Si no entra en ninguna ruta
const notFound = (req, res, next) => {
    next(new AppError(404, 'ROUTE_NOT_FOUND', 'Ruta no encontrada'));
};

// Middleware global de errores (tiene que tener 4 parametros)
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Error interno del servidor';
    let details = [];

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
        details = err.details;
    } else if (err.name === 'ValidationError') {
        // Validaciones de Mongoose (required, minlength, match...)
        statusCode = 422;
        code = 'VALIDATION_ERROR';
        message = 'Los datos no son válidos';
        details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.name === 'CastError' ? 'Formato incorrecto' : e.message
        }));
    } else if (err.name === 'CastError') {
        // ID mal formado o valor de un tipo que no toca
        statusCode = 400;
        if (err.path === '_id') {
            code = 'INVALID_ID';
            message = 'El ID no es válido';
        } else {
            code = 'INVALID_VALUE';
            message = 'Hay un valor con formato incorrecto';
            details = [{ field: err.path, message: 'Formato incorrecto' }];
        }
    } else if (err.code === 11000) {
        // Error de indice unico de MongoDB (email o slug repetido)
        const field = Object.keys(err.keyPattern || {})[0] || 'campo';
        statusCode = 409;
        code = 'DUPLICATE_VALUE';
        message = 'Ya existe un registro con ese valor de ' + field;
        details = [{ field, message: 'Valor duplicado' }];
    } else if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        code = 'INVALID_JSON';
        message = 'El JSON enviado no es válido';
    } else {
        // Error inesperado: se ve en la consola, pero no se manda al cliente
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        error: { code, message, details }
    });
};

module.exports = { notFound, errorHandler };
