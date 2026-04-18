const { MongoClient } = require("mongodb");
const { db } = require("./env");

let client;
let database;
let connectionPromise = null;
let lastConnectionError = null;

async function connectToDatabase() {
  if (database) {
    return database;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  client = new MongoClient(db.uri, {
    serverSelectionTimeoutMS: 10000
  });

  connectionPromise = client
    .connect()
    .then(() => {
      database = client.db(db.name);
      lastConnectionError = null;
      return database;
    })
    .catch((error) => {
      lastConnectionError = error;
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
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

function isDatabaseReady() {
  return Boolean(database);
}

function getLastConnectionError() {
  return lastConnectionError;
}

module.exports = {
  connectToDatabase,
  getCollection,
  getDb,
  getLastConnectionError,
  isDatabaseReady
};
