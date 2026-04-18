const { getCollection } = require("../config/database");

async function authenticateAdmin(username, password) {
  return getCollection("admins").findOne(
    { username, password },
    { projection: { _id: 0, username: 1 } }
  );
}

async function signupCustomer({ username, password, name }) {
  const existing = await getCollection("customers").findOne(
    { username },
    { projection: { _id: 1 } }
  );

  if (existing) {
    return null;
  }

  await getCollection("customers").insertOne({ username, password, name });

  return { username, password, name };
}

async function authenticateCustomer(username, password) {
  return getCollection("customers").findOne(
    { username, password },
    { projection: { _id: 0, username: 1, password: 1, name: 1 } }
  );
}

module.exports = {
  authenticateAdmin,
  authenticateCustomer,
  signupCustomer
};
