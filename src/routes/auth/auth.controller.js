const authService = require("./auth.service");

// register
const register = async (req, res, next) => {
  try {
    const body = req.body;
    const result = await authService.register(body);

    // cookie
    res.cookie("userdata", result.data, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
