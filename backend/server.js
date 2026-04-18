const createApp = require("./src/app");
const { port } = require("./src/config/env");
const { initializeDatabaseWithRetry } = require("./src/services/bootstrapService");

function startServer() {
  const app = createApp();
  app.listen(port, "0.0.0.0", () => {
    console.log(`Node backend running on port ${port}`);
  });

  initializeDatabaseWithRetry();
}

startServer();
