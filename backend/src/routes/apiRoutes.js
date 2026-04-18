const express = require("express");
const authController = require("../controllers/authController");
const inventoryController = require("../controllers/inventoryController");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/inventory", inventoryController.getInventory);
router.post("/inventory/add", inventoryController.addInventoryItem);
router.post("/inventory/update", inventoryController.updateInventoryItem);
router.post("/inventory/delete", inventoryController.deleteInventoryItem);

router.post("/login", authController.adminLogin);
router.post("/customer/signup", authController.customerSignup);
router.post("/customer/login", authController.customerLogin);
router.post("/customer/orders", orderController.getCustomerOrders);

router.post("/checkout", orderController.checkout);
router.get("/orders", orderController.getOrders);

module.exports = router;

