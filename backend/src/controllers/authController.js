const authService = require("../services/authService");

async function adminLogin(req, res) {
  const user = await authService.authenticateAdmin(req.body.username, req.body.password);
  if (!user) {
    res.status(401).json({ success: false, message: "Invalid admin credentials" });
    return;
  }

  res.json({ success: true, message: "Admin login successful" });
}

async function customerSignup(req, res) {
  const customer = await authService.signupCustomer(req.body);
  if (!customer) {
    res.status(400).json({ success: false, message: "Username already exists" });
    return;
  }

  res.status(201).json({ success: true, message: "Signup successful", user: customer });
}

async function customerLogin(req, res) {
  const customer = await authService.authenticateCustomer(req.body.username, req.body.password);
  if (!customer) {
    res.status(401).json({ success: false, message: "Invalid username or password" });
    return;
  }

  res.json({ success: true, message: "Login successful", user: customer });
}

module.exports = {
  adminLogin,
  customerLogin,
  customerSignup
};

