const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const viewRoutes = require("./routes/viewRoutes");
const errorHandler = require("./middleware/errorHandler");
const { paths } = require("./config/env");
const { getLastConnectionError, isDatabaseReady } = require("./config/database");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/static", express.static(paths.staticRoot));

  app.get("/healthz", (req, res) => {
    res.status(isDatabaseReady() ? 200 : 503).json({
      status: isDatabaseReady() ? "ok" : "starting",
      database: isDatabaseReady() ? "connected" : "connecting",
      error: getLastConnectionError()?.message || null
    });
  });

  app.use("/api", apiRoutes);
  app.use("/", viewRoutes);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
