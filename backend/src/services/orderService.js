const { getPool } = require("../config/database");
const { generateOrderId } = require("../utils/order");

async function hydrateOrder(connection, orderRow) {
  const [items] = await connection.query(
    `
      SELECT item_name, price, quantity
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `,
    [orderRow.id]
  );

  return {
    orderId: orderRow.order_id,
    username: orderRow.username,
    items: items.map((item) => ({
      name: item.item_name,
      price: Number(item.price),
      quantity: item.quantity
    })),
    totalAmount: Number(orderRow.total_amount),
    date: new Date(orderRow.created_at).toISOString()
  };
}

async function listOrders() {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.query(
      `
        SELECT id, order_id, username, total_amount, created_at
        FROM orders
        ORDER BY created_at DESC
      `
    );
    return Promise.all(rows.map((row) => hydrateOrder(connection, row)));
  } finally {
    connection.release();
  }
}

async function listOrdersByUsername(username) {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.query(
      `
        SELECT id, order_id, username, total_amount, created_at
        FROM orders
        WHERE username = ?
        ORDER BY created_at DESC
      `,
      [username]
    );
    return Promise.all(rows.map((row) => hydrateOrder(connection, row)));
  } finally {
    connection.release();
  }
}

async function createOrder({ cart, username }) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart) {
      const itemId = Number(cartItem.id);
      const quantity = Number(cartItem.quantity);

      const [[stockItem]] = await connection.query(
        `
          SELECT id, name, price, quantity
          FROM inventory
          WHERE id = ?
          FOR UPDATE
        `,
        [itemId]
      );

      if (!stockItem) {
        await connection.rollback();
        return { order: null, error: `Item ID ${itemId} not found.` };
      }

      if (stockItem.quantity < quantity) {
        await connection.rollback();
        return { order: null, error: `Not enough stock for ${stockItem.name}.` };
      }

      await connection.query(
        "UPDATE inventory SET quantity = quantity - ? WHERE id = ?",
        [quantity, itemId]
      );

      totalAmount += Number(stockItem.price) * quantity;
      orderItems.push({
        name: stockItem.name,
        price: Number(stockItem.price),
        quantity
      });
    }

    const now = new Date();
    const orderId = generateOrderId(now);
    const [orderResult] = await connection.query(
      `
        INSERT INTO orders (order_id, username, total_amount, created_at)
        VALUES (?, ?, ?, ?)
      `,
      [orderId, username || "Guest", totalAmount, now]
    );

    for (const item of orderItems) {
      await connection.query(
        `
          INSERT INTO order_items (order_id, item_name, price, quantity)
          VALUES (?, ?, ?, ?)
        `,
        [orderResult.insertId, item.name, item.price, item.quantity]
      );
    }

    await connection.commit();
    return {
      error: null,
      order: {
        orderId,
        username: username || "Guest",
        items: orderItems,
        totalAmount,
        date: now.toISOString()
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createOrder,
  listOrders,
  listOrdersByUsername
};

