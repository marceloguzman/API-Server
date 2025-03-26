const request = require('supertest');
const app = require('../../../src/app');

describe('Dummy Image Routes', () => {
  describe('GET /api/dummyImage/:label/:width/:height', () => {
    it('should generate an image with valid parameters', async () => {
      // Act
      const response = await request(app)
        .get('/api/dummyImage/Test Image/800/300');

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/png');
    });

    it('should handle URL encoded labels', async () => {
      // Act
      const response = await request(app)
        .get('/api/dummyImage/Hello%20World/800/300');

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/png');
    });

    it('should return 400 for invalid width', async () => {
      // Act
      const response = await request(app)
        .get('/api/dummyImage/Test Image/invalid/300');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid image dimensions'
      });
    });

    it('should return 400 for invalid height', async () => {
      // Act
      const response = await request(app)
        .get('/api/dummyImage/Test Image/800/invalid');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid image dimensions'
      });
    });

    it('should return 400 for negative dimensions', async () => {
      // Act
      const response = await request(app)
        .get('/api/dummyImage/Test Image/-800/300');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid image dimensions'
      });
    });
  });
});