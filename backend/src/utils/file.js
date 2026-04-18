const fs = require("fs/promises");

async function readJsonFile(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return fallback;
  }
}

module.exports = {
  readJsonFile
};

