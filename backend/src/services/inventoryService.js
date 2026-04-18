const { getCollection } = require("../config/database");

function mapInventoryItem(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    quantity: row.quantity,
    category: row.category,
    image_url: row.image_url
  };
}

async function listInventory() {
  const rows = await getCollection("inventory")
    .find({}, { projection: { _id: 0 } })
    .sort({ id: 1 })
    .toArray();
  return rows.map(mapInventoryItem);
}

async function getNextInventoryId() {
  const result = await getCollection("counters").findOneAndUpdate(
    { _id: "inventory" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after", includeResultMetadata: false }
  );

  return result.seq;
}

async function createInventoryItem({ name, price, quantity, category, image_url }) {
  const item = {
    id: await getNextInventoryId(),
    name,
    price: Number(price),
    quantity: Number(quantity),
    category,
    image_url: image_url || null
  };

  await getCollection("inventory").insertOne(item);

  return mapInventoryItem(item);
}

async function updateInventoryItem({ id, name, price, quantity, category, image_url }) {
  const update = {
    name,
    price: Number(price),
    quantity: Number(quantity),
    category
  };

  if (Object.prototype.hasOwnProperty.call(arguments[0], "image_url")) {
    update.image_url = image_url || null;
  }

  const result = await getCollection("inventory").findOneAndUpdate(
    { id: Number(id) },
    { $set: update },
    {
      returnDocument: "after",
      projection: { _id: 0 },
      includeResultMetadata: false
    }
  );

  if (!result) {
    return null;
  }

  return mapInventoryItem(result);
}

async function deleteInventoryItem(id) {
  const result = await getCollection("inventory").deleteOne({ id: Number(id) });
  return result.deletedCount > 0;
}

module.exports = {
  createInventoryItem,
  deleteInventoryItem,
  listInventory,
  updateInventoryItem
};
