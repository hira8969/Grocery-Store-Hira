const { getPool } = require("../config/database");

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
  const [rows] = await getPool().query(
    `
      SELECT id, name, price, quantity, category, image_url
      FROM inventory
      ORDER BY id ASC
    `
  );
  return rows.map(mapInventoryItem);
}

async function createInventoryItem({ name, price, quantity, category, image_url }) {
  const [result] = await getPool().query(
    `
      INSERT INTO inventory (name, price, quantity, category, image_url)
      VALUES (?, ?, ?, ?, ?)
    `,
    [name, Number(price), Number(quantity), category, image_url || null]
  );

  const [[item]] = await getPool().query(
    `
      SELECT id, name, price, quantity, category, image_url
      FROM inventory
      WHERE id = ?
    `,
    [result.insertId]
  );

  return mapInventoryItem(item);
}

async function updateInventoryItem({ id, name, price, quantity, category, image_url }) {
  const [result] = await getPool().query(
    `
      UPDATE inventory
      SET name = ?,
          price = ?,
          quantity = ?,
          category = ?,
          image_url = COALESCE(?, image_url)
      WHERE id = ?
    `,
    [name, Number(price), Number(quantity), category, image_url || null, Number(id)]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [[item]] = await getPool().query(
    `
      SELECT id, name, price, quantity, category, image_url
      FROM inventory
      WHERE id = ?
    `,
    [Number(id)]
  );

  return mapInventoryItem(item);
}

async function deleteInventoryItem(id) {
  const [result] = await getPool().query("DELETE FROM inventory WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

module.exports = {
  createInventoryItem,
  deleteInventoryItem,
  listInventory,
  updateInventoryItem
};

