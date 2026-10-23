const Category = require('../models/Category');
const Product = require('../models/Producto');
const AppError = require('../utils/AppError');
const { validateObjectId, pickAllowed, parseListQuery, buildPagination } = require('../utils/helpers');

const ALLOWED_FIELDS = ['name', 'slug', 'description', 'active'];

const notFound = () => new AppError(404, 'CATEGORY_NOT_FOUND', 'Categoría no encontrada');

const createCategory = async (body) => {
    const data = pickAllowed(body, ALLOWED_FIELDS);
    return await Category.create(data);
};

const getCategories = async (query) => {
    const { filter, sort, page, limit, skip } = parseListQuery(query, ['name', 'slug', 'createdAt']);

    const [data, total] = await Promise.all([
        Category.find(filter).sort(sort).skip(skip).limit(limit),
        Category.countDocuments(filter)
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
};

const getCategoryById = async (id) => {
    validateObjectId(id);

    const category = await Category.findById(id);
    if (!category) {
        throw notFound();
    }
    return category;
};

const updateCategory = async (id, body) => {
    validateObjectId(id);
    const data = pickAllowed(body, ALLOWED_FIELDS);

    const category = await Category.findById(id);
    if (!category) {
        throw notFound();
    }

    // con save() se ejecutan las validaciones del modelo
    category.set(data);
    await category.save();
    return category;
};

const deleteCategory = async (id) => {
    validateObjectId(id);

    const category = await Category.findById(id);
    if (!category) {
        throw notFound();
    }

    // no dejamos borrar una categoria si todavia tiene productos
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
        throw new AppError(409, 'CATEGORY_IN_USE', 'No se puede eliminar: la categoría tiene productos asignados');
    }

    await category.deleteOne();
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
