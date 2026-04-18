const createApp = require("./src/app");
const { port } = require("./src/config/env");
const { initializeDatabase } = require("./src/services/bootstrapService");

async function startServer() {
  await initializeDatabase();
  const app = createApp();
  app.listen(port, "0.0.0.0", () => {
    console.log(`Node backend running on http://127.0.0.1:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
