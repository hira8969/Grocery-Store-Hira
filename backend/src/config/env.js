const path = require("path");
const dotenv = require("dotenv");

const backendRoot = path.join(__dirname, "..", "..");
dotenv.config({ path: path.join(backendRoot, ".env") });

module.exports = {
  backendRoot,
  port: Number(process.env.PORT || 5000),
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "grocery_store_hira",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || ""
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

