const authService = require("./auth.service");

// register
const register = async (req, res, next) => {
  const body = req.body;
  const { url, method } = req;
  try {
    const result = await authService.register(body, { url, method });

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

    return res
      .status(201)
      .json({ status: true, message: "User registered successfully", result });
  } catch (error) {
    next(error);
  }
};

// login
const login = async (req, res, next) => {
  const body = req.body;
  const { url, method } = req;

  try {
    const result = await authService.login(body, { url, method });

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

    return res
      .status(200)
      .json({ status: true, message: "User login successfully", result });
  } catch (error) {
    next(error);
  }
};

// logout
const logout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  const { url, method } = req;

  try {
    await authService.logout(refreshToken, { url, method });

    res.clearCookie("userdata");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res
      .status(200)
      .json({ status: true, message: "User logout successfully" });
  } catch (error) {
    next(error);
  }
};

// refreshToken
const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  try {
    const result = await authService.refreshToken(refreshToken);

    // cookie
    res.cookie("accessToken", result?.accessToken);
    res.cookie("refreshToken", result?.refreshToken);

    return res.status(200).json({
      status: true,
      message: "Refresh token sent successfully!!!",
      result,
    });
  } catch (error) {
    next(error);
  }
};

// profile
const profile = async (req, res, next) => {
  const userData = req.user;
  const { url, method } = req;

  try {
    const result = await authService.profile(userData, { url, method });

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// changePassword
const changePassword = async (req, res, next) => {
  const userData = req?.user;
  const body = req.body;
  const { url, method } = req;

  const result = await authService.changePassword(userData, body, {
    url,
    method,
  });

  return res.status(200).json({ status: true, message: "Password changed!!!" });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  profile,
  changePassword,
};
