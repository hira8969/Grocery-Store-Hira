const { MongoClient } = require("mongodb");
const { db } = require("./env");

let client;
let database;

async function connectToDatabase() {
  if (database) {
    return database;
  }

  client = new MongoClient(db.uri);
  await client.connect();
  database = client.db(db.name);
  return database;
}

function getDb() {
  if (!database) {
    throw new Error("Database connection has not been initialized.");
  }
  return database;
}

function getCollection(name) {
  return getDb().collection(name);
}

module.exports = {
  connectToDatabase,
  getCollection,
  getDb
};
