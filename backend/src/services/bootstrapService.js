const fs = require("fs/promises");
const path = require("path");
const { db, paths } = require("../config/env");
const { createAdminConnection, createPool, setPool, getPool } = require("../config/database");
const { readJsonFile } = require("../utils/file");
const { parseOrderDate } = require("../utils/order");

async function tableCount(connection, tableName) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM ${tableName}`);
  return rows[0].count;
}

async function createSchema() {
  const adminConnection = await createAdminConnection();
  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${db.name}\``);
  await adminConnection.end();

  setPool(createPool(db.name));
  const connection = await getPool().getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        username VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        username VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        category VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        created_at DATETIME NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
  } finally {
    connection.release();
  }
}

async function importJsonSeedData() {
  const connection = await getPool().getConnection();

  try {
    if (await tableCount(connection, "admins") === 0) {
      const admins = await readJsonFile(paths.usersFile, [{ username: "admin", password: "password123" }]);
      for (const admin of admins) {
        await connection.query(
          `
            INSERT INTO admins (username, password)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE password = VALUES(password)
          `,
          [admin.username, admin.password]
        );
      }
    }

    if (await tableCount(connection, "customers") === 0) {
      const customers = await readJsonFile(paths.customersFile, []);
      for (const customer of customers) {
        await connection.query(
          `
            INSERT INTO customers (username, password, name)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
              password = VALUES(password),
              name = VALUES(name)
          `,
          [customer.username, customer.password, customer.name]
        );
      }
    }

    if (await tableCount(connection, "inventory") === 0) {
      const items = await readJsonFile(paths.inventoryFile, []);
      for (const item of items) {
        await connection.query(
          `
            INSERT INTO inventory (id, name, price, quantity, category, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              price = VALUES(price),
              quantity = VALUES(quantity),
              category = VALUES(category),
              image_url = VALUES(image_url)
          `,
          [item.id, item.name, item.price, item.quantity, item.category, item.image_url || null]
        );
      }
    }

    if (await tableCount(connection, "orders") === 0) {
      let filenames = [];
      try {
        filenames = await fs.readdir(paths.ordersDir);
      } catch (error) {
        filenames = [];
      }

      for (const filename of filenames.sort()) {
        if (!filename.endsWith(".json")) {
          continue;
        }

        const order = await readJsonFile(path.join(paths.ordersDir, filename), null);
        if (!order) {
          continue;
        }

        const orderId = order.orderId || filename.replace(/^order_/, "").replace(/\.json$/, "");
        const username = order.username || "Guest";
        const createdAt = parseOrderDate(order.date, filename);

        await connection.query(
          `
            INSERT INTO orders (order_id, username, total_amount, created_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              username = VALUES(username),
              total_amount = VALUES(total_amount),
              created_at = VALUES(created_at)
          `,
          [orderId, username, Number(order.totalAmount || 0), createdAt]
        );

        const [[orderRow]] = await connection.query("SELECT id FROM orders WHERE order_id = ?", [orderId]);
        await connection.query("DELETE FROM order_items WHERE order_id = ?", [orderRow.id]);

        for (const item of order.items || []) {
          await connection.query(
            `
              INSERT INTO order_items (order_id, item_name, price, quantity)
              VALUES (?, ?, ?, ?)
            `,
            [orderRow.id, item.name, Number(item.price || 0), Number(item.quantity || 0)]
          );
        }
      }
    }
  } finally {
    connection.release();
  }
}

async function initializeDatabase() {
  await createSchema();
  await importJsonSeedData();
}

module.exports = {
  initializeDatabase
};
