const path = require("path");
const dotenv = require("dotenv");

const backendRoot = path.join(__dirname, "..", "..");
dotenv.config({ path: path.join(backendRoot, ".env") });

module.exports = {
  backendRoot,
  port: Number(process.env.PORT || 5000),
  db: {
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
    name: process.env.MONGODB_DB_NAME || "grocery_store_hira"
  },
  paths: {
    frontendRoot: path.join(backendRoot, "..", "frontend"),
    staticRoot: path.join(backendRoot, "..", "frontend", "static"),
    dataRoot: path.join(backendRoot, "data"),
    usersFile: path.join(backendRoot, "data", "users.json"),
    customersFile: path.join(backendRoot, "data", "customers.json"),
    inventoryFile: path.join(backendRoot, "data", "inventory.json"),
    ordersDir: path.join(backendRoot, "data", "orders")
  }
};
