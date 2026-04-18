const path = require("path");

function parseOrderDate(dateValue, filename) {
  if (dateValue) {
    return new Date(dateValue);
  }

  const stamp = path.basename(filename, ".json").replace(/^order_/, "");
  const match = stamp.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/);
  if (!match) {
    return new Date();
  }

  const [, year, month, day, hour, minute, second] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}

function generateOrderId(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("") + "_" + [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0")
  ].join("");
}

module.exports = {
  generateOrderId,
  parseOrderDate
};

