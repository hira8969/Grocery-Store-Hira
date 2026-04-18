const express = require("express");
const path = require("path");
const { paths } = require("../config/env");

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(paths.frontendRoot, "index.html"));
});

router.get("/admin", (req, res) => {
  res.sendFile(path.join(paths.frontendRoot, "admin.html"));
});

router.get("/invoice", (req, res) => {
  res.sendFile(path.join(paths.frontendRoot, "invoice.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(paths.frontendRoot, "login.html"));
});

router.get("/my-orders", (req, res) => {
  res.sendFile(path.join(paths.frontendRoot, "orders.html"));
});

module.exports = router;

