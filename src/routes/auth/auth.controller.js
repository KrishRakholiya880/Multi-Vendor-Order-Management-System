const authService = require("./auth.service");

// register
const register = async (req, res, next) => {
  try {
    const body = req.body;
    const result = await authService.register(body);
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// login
const login = async (req, res, next) => {
  try {
    const body = req.body;
    const result = await authService.login(body);
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
