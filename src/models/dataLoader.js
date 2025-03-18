const fs = require('fs').promises;
const path = require('path');

/**
 * Loads data from a JSON file
 * @param {string} filename - Name of the JSON file in the data directory
 * @returns {Promise<Array|Object>} - Data loaded from the JSON file
 */
async function loadJsonData(filename) {
  try {
    const filePath = path.join(__dirname, '../data', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading file ${filename}:`, error);
    throw new Error(`Could not load data from ${filename}`);
  }
}

/**
 * Saves data to a JSON file
 * @param {string} filename - Name of the JSON file in the data directory
 * @param {Array|Object} data - Data to save to the JSON file
 * @returns {Promise<void>}
 */
async function saveJsonData(filename, data) {
  try {
    const filePath = path.join(__dirname, '../data', filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving to file ${filename}:`, error);
    throw new Error(`Could not save data to ${filename}`);
  }
}

module.exports = {
  loadJsonData,
  saveJsonData
}; 