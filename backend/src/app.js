const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const viewRoutes = require("./routes/viewRoutes");
const errorHandler = require("./middleware/errorHandler");
const { paths } = require("./config/env");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/static", express.static(paths.staticRoot));

  app.use("/api", apiRoutes);
  app.use("/", viewRoutes);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

