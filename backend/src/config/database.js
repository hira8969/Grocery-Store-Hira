const mysql = require("mysql2/promise");
const { db } = require("./env");

let pool;

function createPool(database) {
  return mysql.createPool({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true
  });
}

async function createAdminConnection() {
  return mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password
  });
}

function setPool(nextPool) {
  pool = nextPool;
}

function getPool() {
  if (!pool) {
    throw new Error("Database pool has not been initialized.");
  }
  return pool;
}

module.exports = {
  createAdminConnection,
  createPool,
  getPool,
  setPool
};

