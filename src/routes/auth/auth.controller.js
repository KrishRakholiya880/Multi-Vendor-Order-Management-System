const authService = require("./auth.service");

// register
const register = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(body);
    const result = await authService.register(body);
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
};
