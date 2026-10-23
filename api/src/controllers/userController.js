const userService = require('../services/userService');

const createUser = async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
};

const getUsers = async (req, res) => {
    const { data, pagination } = await userService.getUsers(req.query);
    res.status(200).json({ success: true, data, pagination });
};

const getUserById = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
};

const updateUser = async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: user });
};

// DELETE = baja logica, devolvemos el usuario con active:false
const deactivateUser = async (req, res) => {
    const user = await userService.deactivateUser(req.params.id);
    res.status(200).json({ success: true, message: 'Usuario desactivado', data: user });
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deactivateUser
};
