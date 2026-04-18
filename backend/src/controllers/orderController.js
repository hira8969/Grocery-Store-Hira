const orderService = require("../services/orderService");

async function checkout(req, res) {
  const { order, error } = await orderService.createOrder({
    cart: Array.isArray(req.body.cart) ? req.body.cart : [],
    username: req.body.username || "Guest"
  });

  if (error) {
    res.status(400).json({ success: false, message: error });
    return;
  }

  res.json({ success: true, order });
}

async function getOrders(req, res) {
  const orders = await orderService.listOrders();
  res.json(orders);
}

async function getCustomerOrders(req, res) {
  if (!req.body.username) {
    res.status(400).json({ success: false, message: "Username required" });
    return;
  }

  const orders = await orderService.listOrdersByUsername(req.body.username);
  res.json({ success: true, orders });
}

module.exports = {
  checkout,
  getCustomerOrders,
  getOrders
};

