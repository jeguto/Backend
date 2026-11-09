const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { pickAllowed } = require('../utils/helpers');
const userService = require('./userService');
const tokenService = require('./tokenService');

const LOGIN_FIELDS = ['email', 'password'];

// El registro reutiliza la logica de crear usuario (validaciones + hash con bcrypt)
const register = async (body) => {
    return await userService.createUser(body);
};

const login = async (body) => {
    const { email, password } = pickAllowed(body, LOGIN_FIELDS);

    // comprobamos que llegan los dos campos y que son texto
    const details = [];
    if (typeof email !== 'string' || email.trim() === '') {
        details.push({ field: 'email', message: 'El email es obligatorio' });
    }
    if (typeof password !== 'string' || password === '') {
        details.push({ field: 'password', message: 'La contraseña es obligatoria' });
    }
    if (details.length > 0) {
        throw new AppError(422, 'VALIDATION_ERROR', 'Los datos no son válidos', details);
    }

    // passwordHash tiene select:false, asi que hay que pedirlo
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

    // mismo error si no existe el email o si la contraseña esta mal
    const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!passwordOk) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    if (!user.active) {
        throw new AppError(403, 'USER_DISABLED', 'El usuario está desactivado');
    }

    const { accessToken, refreshToken } = await tokenService.issueTokens(user);

    return { accessToken, refreshToken, user };
};

module.exports = { register, login };