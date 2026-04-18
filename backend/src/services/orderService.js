const { getCollection } = require("../config/database");
const { generateOrderId } = require("../utils/order");

function hydrateOrder(orderRow) {
  return {
    orderId: orderRow.orderId,
    username: orderRow.username,
    items: (orderRow.items || []).map((item) => ({
      name: item.name || item.item_name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0)
    })),
    totalAmount: Number(orderRow.totalAmount || 0),
    date: new Date(orderRow.createdAt).toISOString()
  };
}

async function listOrders() {
  const rows = await getCollection("orders")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return rows.map(hydrateOrder);
}

async function listOrdersByUsername(username) {
  const rows = await getCollection("orders")
    .find({ username }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return rows.map(hydrateOrder);
}

async function createOrder({ cart, username }) {
  const inventory = getCollection("inventory");
  const orders = getCollection("orders");
  const updatedItems = [];
  try {
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart) {
      const itemId = Number(cartItem.id);
      const quantity = Number(cartItem.quantity);

      const stockItem = await inventory.findOneAndUpdate(
        {
          id: itemId,
          quantity: { $gte: quantity }
        },
        { $inc: { quantity: -quantity } },
        {
          returnDocument: "before",
          projection: { _id: 0, id: 1, name: 1, price: 1, quantity: 1 },
          includeResultMetadata: false
        }
      );

      if (!stockItem) {
        const existingItem = await inventory.findOne(
          { id: itemId },
          { projection: { _id: 0, name: 1 } }
        );
        return {
          order: null,
          error: existingItem
            ? `Not enough stock for ${existingItem.name}.`
            : `Item ID ${itemId} not found.`
        };
      }

      updatedItems.push({ id: itemId, quantity });

      totalAmount += Number(stockItem.price) * quantity;
      orderItems.push({
        name: stockItem.name,
        price: Number(stockItem.price),
        quantity
      });
    }

    const now = new Date();
    const orderId = generateOrderId(now);
    await orders.insertOne({
      orderId,
      username: username || "Guest",
      items: orderItems,
      totalAmount,
      createdAt: now
    });

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
    await Promise.all(
      updatedItems.map((item) =>
        inventory.updateOne({ id: item.id }, { $inc: { quantity: item.quantity } })
      )
    );
    throw error;
  }
}

module.exports = {
  createOrder,
  listOrders,
  listOrdersByUsername
};
