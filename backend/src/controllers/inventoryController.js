const inventoryService = require("../services/inventoryService");

async function getInventory(req, res) {
  const inventory = await inventoryService.listInventory();
  res.json(inventory);
}

async function addInventoryItem(req, res) {
  const item = await inventoryService.createInventoryItem(req.body);
  res.status(201).json({ success: true, item });
}

async function updateInventoryItem(req, res) {
  const item = await inventoryService.updateInventoryItem(req.body);
  if (!item) {
    res.status(404).json({ success: false, message: "Item not found" });
    return;
  }

  res.json({ success: true, item });
}

async function deleteInventoryItem(req, res) {
  const deleted = await inventoryService.deleteInventoryItem(req.body.id);
  if (!deleted) {
    res.status(404).json({ success: false, message: "Item not found" });
    return;
  }

  res.json({ success: true, message: "Item deleted" });
}

module.exports = {
  addInventoryItem,
  deleteInventoryItem,
  getInventory,
  updateInventoryItem
};

