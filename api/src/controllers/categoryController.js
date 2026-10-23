const categoryService = require('../services/categoryService');

const createCategory = async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
};

const getCategories = async (req, res) => {
    const { data, pagination } = await categoryService.getCategories(req.query);
    res.status(200).json({ success: true, data, pagination });
};

const getCategoryById = async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({ success: true, data: category });
};

const updateCategory = async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ success: true, data: category });
};

const deleteCategory = async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
