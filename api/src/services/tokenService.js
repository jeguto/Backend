const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// En BD solo guardamos el hash SHA-256: si se filtra la BD, los tokens no sirven
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateAccessToken = (user) =>
    jwt.sign(
        { sub: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES }
    );

const generateRefreshToken = (user, family) =>
    jwt.sign(
        { sub: user._id.toString(), family, jti: crypto.randomUUID() },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES }
    );

// Crea access + refresh y guarda el refresh en MongoDB
const issueTokens = async (user, family = crypto.randomUUID()) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, family);
    const { exp } = jwt.decode(refreshToken);

    await Token.create({
        user: user._id,
        tokenHash: hashToken(refreshToken),
        family,
        expiresAt: new Date(exp * 1000)
    });

    return { accessToken, refreshToken };
};

const invalidRefresh = () =>
    new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token no válido o caducado');

const verifyRefreshJwt = (refreshToken) => {
    if (typeof refreshToken !== 'string' || refreshToken === '') {
        throw new AppError(422, 'VALIDATION_ERROR', 'Los datos no son válidos', [
            { field: 'refreshToken', message: 'El refreshToken es obligatorio' }
        ]);
    }
    try {
        return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw invalidRefresh();
    }
};

// Rotacion: el refresh token usado se revoca y se entrega uno nuevo
const rotateRefreshToken = async (refreshToken) => {
    const payload = verifyRefreshJwt(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const stored = await Token.findOne({ tokenHash });
    if (!stored) throw invalidRefresh();

    // Marcamos como usado de forma atomica (solo si aun no estaba revocado).
    // Asi, dos peticiones simultaneas con el mismo token no pasan las dos.
    const consumed = await Token.findOneAndUpdate(
        { tokenHash, revoked: false },
        { revoked: true },
        { new: true }
    );

    if (!consumed) {
        // Token ya usado/revocado => posible robo: se revoca toda la familia
        await Token.updateMany({ family: stored.family }, { revoked: true });
        throw new AppError(
            401,
            'TOKEN_REUSE_DETECTED',
            'Se ha detectado la reutilización de un refresh token. Se han cerrado las sesiones, inicia sesión de nuevo'
        );
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.active) throw invalidRefresh();

    const tokens = await issueTokens(user, stored.family);
    await Token.updateOne(
        { tokenHash },
        { replacedByHash: hashToken(tokens.refreshToken) }
    );

    return tokens;
};

// Logout: revoca la familia del refresh token (la sesion de ese dispositivo)
const revokeRefreshToken = async (refreshToken) => {
    const payload = verifyRefreshJwt(refreshToken);
    await Token.updateMany({ family: payload.family, user: payload.sub }, { revoked: true });
};

// Logout global: cierra todas las sesiones del usuario
const revokeAllUserTokens = async (userId) => {
    await Token.updateMany({ user: userId, revoked: false }, { revoked: true });
};

module.exports = {
    generateAccessToken,
    issueTokens,
    rotateRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens
};
