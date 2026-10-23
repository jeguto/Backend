const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { validateObjectId, pickAllowed, parseListQuery, buildPagination } = require('../utils/helpers');

const SALT_ROUNDS = 12;

// Campos que se pueden enviar. role, active y passwordHash NO se aceptan del body
const CREATE_FIELDS = ['name', 'email', 'password'];
const UPDATE_FIELDS = ['name', 'email', 'password'];

const notFound = () => new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

const validatePassword = (password) => {
    let message = null;

    if (typeof password !== 'string' || password === '') {
        message = 'La contraseña es obligatoria';
    } else if (password.length < 12) {
        message = 'La contraseña debe tener mínimo 12 caracteres';
    } else if (Buffer.byteLength(password, 'utf8') > 72) {
        // bcrypt solo mira los primeros 72 bytes
        message = 'La contraseña es demasiado larga (máximo 72 bytes)';
    }

    if (message) {
        throw new AppError(422, 'VALIDATION_ERROR', 'Los datos no son válidos', [
            { field: 'password', message }
        ]);
    }
};

const createUser = async (body) => {
    const { name, email, password } = pickAllowed(body, CREATE_FIELDS);

    validatePassword(password);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // role y active se quedan con el valor por defecto (client / true)
    return await User.create({ name, email, passwordHash });
};

const getUsers = async (query) => {
    const { filter, sort, page, limit, skip } = parseListQuery(query, ['name', 'email', 'createdAt']);

    const [data, total] = await Promise.all([
        User.find(filter).sort(sort).skip(skip).limit(limit),
        User.countDocuments(filter)
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
};

const getUserById = async (id) => {
    validateObjectId(id);

    const user = await User.findById(id);
    if (!user) {
        throw notFound();
    }
    return user;
};

const updateUser = async (id, body) => {
    validateObjectId(id);
    const { password, ...rest } = pickAllowed(body, UPDATE_FIELDS);

    const user = await User.findById(id);
    if (!user) {
        throw notFound();
    }

    user.set(rest);

    if (password !== undefined) {
        validatePassword(password);
        user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await user.save();
    return user;
};

// Baja logica: no se borra, solo se pone active = false
const deactivateUser = async (id) => {
    validateObjectId(id);

    const user = await User.findById(id);
    if (!user) {
        throw notFound();
    }

    user.active = false;
    await user.save();
    return user;
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deactivateUser
};
