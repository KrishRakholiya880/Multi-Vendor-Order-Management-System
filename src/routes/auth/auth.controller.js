const authService = require("./auth.service");
const { expressSession } = require("../../config");
const { v4: uuidV4 } = require("uuid");

// register
const register = async (req, res, next) => {
  const requestId = uuidV4();
  const body = req.body;
  const { url, method } = req;
  try {
    const result = await authService.register(body, {
      url,
      method,
      requestId,
    });

    // cookie
    res.cookie("userdata", result.data, {
      httpOnly: expressSession.HTTPONLY,
      secure: expressSession.SECURE,
      maxAge: Number(expressSession.MAX_AGE_ACCESS),
    });
    res.cookie("accessToken", result.accessToken, {
      httpOnly: expressSession.HTTPONLY,
      secure: expressSession.SECURE,
      maxAge: Number(expressSession.MAX_AGE_ACCESS),
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: expressSession.HTTPONLY,
      secure: expressSession.SECURE,
      maxAge: Number(expressSession.MAX_AGE_REFRESH),
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
  const requestId = uuidV4();
  const { url, method } = req;

  try {
    const result = await authService.login(body, {
      url,
      method,
      requestId,
    });

    // cookie
    res.cookie("userdata", result.data, {
      httpOnly: expressSession.HTTPONLY,
      secure: expressSession.SECURE,
      maxAge: Number(expressSession.MAX_AGE_ACCESS),
    });
    res.cookie("accessToken", result.accessToken, {
      httpOnly: expressSession.HTTPONLY,
      secure: expressSession.SECURE,
      maxAge: Number(expressSession.MAX_AGE_ACCESS),
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: expressSession.HTTPONLY,
      secure: expressSession.SECURE,
      maxAge: Number(expressSession.MAX_AGE_REFRESH),
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
  const { url, method, requestId } = req;

  try {
    await authService.logout(refreshToken, { url, method, requestId });

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

// renewAccessToken
const renewAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  const userData = req.user;
  const { method, url, ip } = req;
  try {
    const result = await authService.renewAccessToken(refreshToken, userData, {
      method,
      url,
    });

    if (result?.removeAccessAndData) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(403).json({
        status: false,
        message: "Your session has expired. Please login again",
      });
    }

    // cookie
    res.cookie("accessToken", result.accessToken, {
      httpOnly: expressSession.HTTPONLY,
      secure: expressSession.SECURE,
      maxAge: Number(expressSession.MAX_AGE_ACCESS),
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: expressSession.HTTPONLY,
      secure: expressSession.SECURE,
      maxAge: Number(expressSession.MAX_AGE_REFRESH),
    });

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
  const { url, method, requestId, ip } = req;

  try {
    const result = await authService.profile(userData, {
      url,
      method,
      requestId,
    });

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// changePassword
const changePassword = async (req, res, next) => {
  const userData = req?.user;
  const body = req.body;
  const { url, method, requestId } = req;

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
  renewAccessToken,
  profile,
  changePassword,
};
