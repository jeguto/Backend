const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const register = async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
};

const login = async (req, res) => {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.status(200).json({ success: true, data: { accessToken, refreshToken, user } });
};

const refresh = async (req, res) => {
    const { accessToken, refreshToken } = await tokenService.rotateRefreshToken(req.body.refreshToken);
    res.status(200).json({ success: true, data: { accessToken, refreshToken } });
};

const logout = async (req, res) => {
    await tokenService.revokeRefreshToken(req.body.refreshToken);
    res.status(200).json({ success: true, data: { message: 'Sesión cerrada' } });
};

const logoutAll = async (req, res) => {
    await tokenService.revokeAllUserTokens(req.user.id);
    res.status(200).json({ success: true, data: { message: 'Todas las sesiones cerradas' } });
};

// Ruta protegida de ejemplo
const me = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    res.status(200).json({ success: true, data: user });
};

module.exports = { register, login, refresh, logout, logoutAll, me };
