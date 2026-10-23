// Error propio para poder lanzar errores con codigo HTTP y codigo interno
class AppError extends Error {
    constructor(statusCode, code, message, details = []) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

module.exports = AppError;
