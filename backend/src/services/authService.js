const { getPool } = require("../config/database");

async function authenticateAdmin(username, password) {
  const [[user]] = await getPool().query(
    "SELECT username FROM admins WHERE username = ? AND password = ?",
    [username, password]
  );
  return user || null;
}

async function signupCustomer({ username, password, name }) {
  const [[existing]] = await getPool().query(
    "SELECT username FROM customers WHERE username = ?",
    [username]
  );

  if (existing) {
    return null;
  }

  await getPool().query(
    "INSERT INTO customers (username, password, name) VALUES (?, ?, ?)",
    [username, password, name]
  );

  return { username, password, name };
}

async function authenticateCustomer(username, password) {
  const [[customer]] = await getPool().query(
    `
      SELECT username, password, name
      FROM customers
      WHERE username = ? AND password = ?
    `,
    [username, password]
  );

  return customer || null;
}

module.exports = {
  authenticateAdmin,
  authenticateCustomer,
  signupCustomer
};

