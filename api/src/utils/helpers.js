const AppError = require('./AppError');

const MAX_LIMIT = 50;

// Un ObjectId de Mongo son 24 caracteres hexadecimales
const isValidId = (id) => {
    return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

const validateObjectId = (id) => {
    if (!isValidId(id)) {
        throw new AppError(400, 'INVALID_ID', 'El ID no es válido');
    }
};

// Solo deja pasar los campos permitidos. Si llega alguno que no toca, error 400
const pickAllowed = (body, allowedFields) => {
    const data = body || {};

    if (typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError(400, 'INVALID_BODY', 'El cuerpo debe ser un objeto JSON');
    }

    const notAllowed = Object.keys(data).filter((key) => !allowedFields.includes(key));

    if (notAllowed.length > 0) {
        throw new AppError(
            400,
            'FIELDS_NOT_ALLOWED',
            'Se han enviado campos que no se pueden modificar',
            notAllowed.map((field) => ({ field, message: 'Campo no permitido' }))
        );
    }

    return data;
};

const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const invalidQuery = (field, message) => {
    return new AppError(400, 'INVALID_QUERY', 'Parámetros de consulta no válidos', [{ field, message }]);
};

const parsePositiveInt = (value, field, defaultValue) => {
    if (value === undefined) {
        return defaultValue;
    }
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
        throw invalidQuery(field, 'Debe ser un entero positivo');
    }
    return Number(value);
};

const parseBoolean = (value, field) => {
    if (value === undefined) {
        return undefined;
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw invalidQuery(field, 'Debe ser true o false');
};

const parseSort = (sort, allowedFields, defaultSort) => {
    if (sort === undefined) {
        return defaultSort;
    }
    if (typeof sort !== 'string') {
        throw invalidQuery('sort', 'Valor no válido');
    }

    const direction = sort.startsWith('-') ? -1 : 1;
    const field = sort.replace(/^-/, '');

    if (!allowedFields.includes(field)) {
        throw invalidQuery('sort', 'Solo se puede ordenar por: ' + allowedFields.join(', '));
    }

    // _id al final para que la paginacion sea estable
    return { [field]: direction, _id: 1 };
};

// Lee active, name, sort, page y limit de la query (sirve para categorias y usuarios)
const parseListQuery = (query, allowedSortFields) => {
    const filter = {};

    const active = parseBoolean(query.active, 'active');
    if (active !== undefined) {
        filter.active = active;
    }

    if (query.name !== undefined) {
        if (typeof query.name !== 'string') {
            throw invalidQuery('name', 'Valor no válido');
        }
        if (query.name.trim() !== '') {
            filter.name = { $regex: escapeRegex(query.name.trim()), $options: 'i' };
        }
    }

    const sort = parseSort(query.sort, allowedSortFields, { createdAt: -1, _id: 1 });

    const page = parsePositiveInt(query.page, 'page', 1);
    let limit = parsePositiveInt(query.limit, 'limit', 10);
    if (limit > MAX_LIMIT) {
        limit = MAX_LIMIT;
    }

    return { filter, sort, page, limit, skip: (page - 1) * limit };
};

const buildPagination = (page, limit, total) => {
    return { page, limit, total, totalPages: Math.ceil(total / limit) };
};

module.exports = {
    isValidId,
    validateObjectId,
    pickAllowed,
    parseListQuery,
    buildPagination
};
