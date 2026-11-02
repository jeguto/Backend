const authService = require('../services/authService');

const register = async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
};

const login = async (req, res) => {
    const { token, user } = await authService.login(req.body);
    res.status(200).json({ success: true, data: { token, user } });
};

module.exports = { register, login };