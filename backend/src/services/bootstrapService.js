const fs = require("fs/promises");
const path = require("path");
const { db, paths } = require("../config/env");
const { connectToDatabase, getCollection } = require("../config/database");
const { readJsonFile } = require("../utils/file");
const { parseOrderDate } = require("../utils/order");

async function collectionCount(name) {
  return getCollection(name).countDocuments();
}

async function createCollections() {
  const database = await connectToDatabase();
  const collections = await database.listCollections().toArray();
  const existing = new Set(collections.map((collection) => collection.name));

  for (const name of ["admins", "customers", "inventory", "orders", "counters"]) {
    if (!existing.has(name)) {
      await database.createCollection(name);
    }
  }

  await getCollection("admins").createIndex({ username: 1 }, { unique: true });
  await getCollection("customers").createIndex({ username: 1 }, { unique: true });
  await getCollection("inventory").createIndex({ id: 1 }, { unique: true });
  await getCollection("orders").createIndex({ orderId: 1 }, { unique: true });
}

async function importJsonSeedData() {
  if (await collectionCount("admins") === 0) {
    const admins = await readJsonFile(paths.usersFile, [{ username: "admin", password: "password123" }]);
    for (const admin of admins) {
      await getCollection("admins").updateOne(
        { username: admin.username },
        { $set: { password: admin.password } },
        { upsert: true }
      );
    }
  }

  if (await collectionCount("customers") === 0) {
    const customers = await readJsonFile(paths.customersFile, []);
    for (const customer of customers) {
      await getCollection("customers").updateOne(
        { username: customer.username },
        {
          $set: {
            password: customer.password,
            name: customer.name
          }
        },
        { upsert: true }
      );
    }
  }

  if (await collectionCount("inventory") === 0) {
    const items = await readJsonFile(paths.inventoryFile, []);
    for (const item of items) {
      await getCollection("inventory").updateOne(
        { id: Number(item.id) },
        {
          $set: {
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            category: item.category,
            image_url: item.image_url || null
          }
        },
        { upsert: true }
      );
    }
  }

  if (await collectionCount("orders") === 0) {
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

      await getCollection("orders").updateOne(
        { orderId },
        {
          $set: {
            username,
            totalAmount: Number(order.totalAmount || 0),
            createdAt,
            items: (order.items || []).map((item) => ({
              name: item.name,
              price: Number(item.price || 0),
              quantity: Number(item.quantity || 0)
            }))
          }
        },
        { upsert: true }
      );
    }
  }

  const highestInventoryId = await getCollection("inventory")
    .find({}, { projection: { id: 1 } })
    .sort({ id: -1 })
    .limit(1)
    .toArray();

  await getCollection("counters").updateOne(
    { _id: "inventory" },
    { $max: { seq: highestInventoryId[0]?.id || 0 } },
    { upsert: true }
  );
}

async function initializeDatabase() {
  await createCollections();
  await importJsonSeedData();
  console.log(`MongoDB connected: ${db.name}`);
}

module.exports = {
  initializeDatabase
};
