const Product = require('../models/Producto');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const { isValidId, validateObjectId, pickAllowed } = require('../utils/helpers');

const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'image', 'stock'];

const notFound = () => new AppError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');

// Comprueba que la categoria que nos mandan existe de verdad
const checkCategory = async (categoryId) => {
    if (!isValidId(categoryId) || !(await Category.exists({ _id: categoryId }))) {
        throw new AppError(422, 'VALIDATION_ERROR', 'Los datos no son válidos', [
            { field: 'category', message: 'La categoría no existe' }
        ]);
    }
};

const createProduct = async (body) => {
    const data = pickAllowed(body, ALLOWED_FIELDS);

    if (data.category !== undefined && data.category !== null) {
        await checkCategory(data.category);
    }

    const product = await Product.create(data);
    await product.populate('category', 'name slug');
    return product;
};

const getProducts = async () => {
    return await Product.find().populate('category', 'name slug');
};

const getProductById = async (id) => {
    validateObjectId(id);

    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product) {
        throw notFound();
    }
    return product;
};

const updateProduct = async (id, body) => {
    validateObjectId(id);
    const data = pickAllowed(body, ALLOWED_FIELDS);

    const product = await Product.findById(id);
    if (!product) {
        throw notFound();
    }

    if (data.category !== undefined && data.category !== null) {
        await checkCategory(data.category);
    }

    product.set(data);
    await product.save();
    await product.populate('category', 'name slug');
    return product;
};

const deleteProduct = async (id) => {
    validateObjectId(id);

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
        throw notFound();
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
