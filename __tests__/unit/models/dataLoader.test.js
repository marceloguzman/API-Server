const fs = require('fs').promises;
const path = require('path');
const { loadJsonData, saveJsonData } = require('../../../src/models/dataLoader');

// Mock para fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('dataLoader Module', () => {
  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadJsonData', () => {
    it('should load and parse JSON data correctly', async () => {
      // Mock data
      const mockData = [{ id: 1, name: 'Test Product' }];
      const mockJsonString = JSON.stringify(mockData);

      // Setup mock implementation
      fs.readFile.mockResolvedValue(mockJsonString);

      // Call function
      const result = await loadJsonData('test.json');

      // Check file path is correct
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('test.json'),
        'utf8'
      );

      // Check parsing result
      expect(result).toEqual(mockData);
    });

    it('should throw an error when file reading fails', async () => {
      // Mock error
      const mockError = new Error('File read error');
      fs.readFile.mockRejectedValue(mockError);

      // Test error handling
      await expect(loadJsonData('test.json')).rejects.toThrow(
        'Could not load data from test.json'
      );
    });
  });

  describe('saveJsonData', () => {
    it('should stringify and save data correctly', async () => {
      // Mock data
      const mockData = [{ id: 1, name: 'Test Product' }];

      // Call function
      await saveJsonData('test.json', mockData);

      // Check file path and data are correct
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test.json'),
        JSON.stringify(mockData, null, 2),
        'utf8'
      );
    });

    it('should throw an error when file writing fails', async () => {
      // Mock error
      const mockError = new Error('File write error');
      fs.writeFile.mockRejectedValue(mockError);

      // Test error handling
      await expect(saveJsonData('test.json', [])).rejects.toThrow(
        'Could not save data to test.json'
      );
    });
  });
}); 