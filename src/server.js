const express = require("express");
const app = express();

// config
const { application } = require("./config");
// PORT
const PORT = application.PORT || 9000;

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
