const express = require("express");
const app = express();
const { sequelize } = require("./db/models");

// config
const { application } = require("./config");
// PORT
const PORT = application.PORT || 9000;
// indexRoute
const indexRoute = require("./routes/indexRoute");
// errorHandler
const errorHandler = require("../src/middleware/errorHandler");
const cookieParser = require("cookie-parser");

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api", indexRoute);
app.use(errorHandler);

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
};
connectDb();
app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
