const express = require("express");
const app = express();

// config
const { application } = require("./config");
// PORT
const PORT = application.PORT || 9000;
// indexRoute
const indexRoute = require("./routes/indexRoute");
// errorHandler
const errorHandler = require("../src/middleware/errorHandler");

// middlewares
app.use(express.json());

// routes
app.use("/api", indexRoute);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
