const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Valida el access token: Authorization: Bearer <token>
const authenticate = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return next(new AppError(401, 'NO_TOKEN', 'Falta el token de acceso'));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET); // firma + caducidad
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError(401, 'TOKEN_EXPIRED', 'El token de acceso ha caducado'));
        }
        next(new AppError(401, 'INVALID_TOKEN', 'Token de acceso no válido'));
    }
};

// Restringe una ruta a ciertos roles (se usa despues de authenticate)
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return next(new AppError(403, 'FORBIDDEN', 'No tienes permisos para esta acción'));
    }
    next();
};

module.exports = { authenticate, authorize };
