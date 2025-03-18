const request = require('supertest');
const app = require('../../src/app');
const { loadJsonData, saveJsonData } = require('../../src/models/dataLoader');

// Mock dataLoader module
jest.mock('../../src/models/dataLoader');

describe('API Routes Integration Tests', () => {
  // Test data
  const mockUsers = [
    { id: '1', name: 'Test User 1', email: 'user1@example.com', role: 'admin' },
    { id: '2', name: 'Test User 2', email: 'user2@example.com', role: 'user' }
  ];

  const mockProducts = [
    { id: 1, name: 'Test Product 1', price: 99.99, category: 'electronics', stock: 10 },
    { id: 2, name: 'Test Product 2', price: 49.99, category: 'accessories', stock: 20 }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock loadJsonData to return test data
    loadJsonData.mockImplementation(filename => {
      if (filename === 'users.json') return Promise.resolve([...mockUsers]);
      if (filename === 'products.json') return Promise.resolve([...mockProducts]);
      return Promise.resolve([]);
    });

    // Mock saveJsonData to do nothing
    saveJsonData.mockResolvedValue(undefined);
  });

  describe('User Routes', () => {
    describe('GET /api/v1/users', () => {
      it('should return all users', async () => {
        const response = await request(app).get('/api/v1/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          status: 'success',
          results: mockUsers.length,
          data: { users: mockUsers }
        });
      });
    });

    describe('GET /api/v1/users/:id', () => {
      it('should return a user by ID', async () => {
        const response = await request(app).get('/api/v1/users/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          status: 'success',
          data: { user: mockUsers[0] }
        });
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app).get('/api/v1/users/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('User not found');
      });
    });

    describe('POST /api/v1/users', () => {
      it('should create a new user', async () => {
        const newUser = { name: 'New User', email: 'newuser@example.com', role: 'user' };
        
        const response = await request(app)
          .post('/api/v1/users')
          .send(newUser);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.user).toMatchObject(newUser);
        expect(saveJsonData).toHaveBeenCalled();
      });
    });

    describe('PATCH /api/v1/users/:id', () => {
      it('should update a user', async () => {
        const updateData = { name: 'Updated User' };
        
        const response = await request(app)
          .patch('/api/v1/users/1')
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.user.name).toBe('Updated User');
        expect(saveJsonData).toHaveBeenCalled();
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .patch('/api/v1/users/999')
          .send({ name: 'Updated User' });

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });

    describe('DELETE /api/v1/users/:id', () => {
      it('should delete a user', async () => {
        const response = await request(app).delete('/api/v1/users/1');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.user).toEqual(mockUsers[0]);
        expect(saveJsonData).toHaveBeenCalled();
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app).delete('/api/v1/users/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });
  });

  describe('Product Routes', () => {
    describe('GET /api/v1/products', () => {
      it('should return all products', async () => {
        const response = await request(app).get('/api/v1/products');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          status: 'success',
          results: mockProducts.length,
          data: { products: mockProducts }
        });
      });

      it('should filter products by category', async () => {
        const response = await request(app).get('/api/v1/products?category=accessories');

        expect(response.status).toBe(200);
        expect(response.body.data.products).toHaveLength(1);
        expect(response.body.data.products[0].category).toBe('accessories');
      });

      it('should filter products by price range', async () => {
        const response = await request(app).get('/api/v1/products?minPrice=80&maxPrice=100');

        expect(response.status).toBe(200);
        expect(response.body.data.products).toHaveLength(1);
        expect(response.body.data.products[0].price).toBe(99.99);
      });
    });

    describe('GET /api/v1/products/:id', () => {
      it('should return a product by ID', async () => {
        const response = await request(app).get('/api/v1/products/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          status: 'success',
          data: { product: mockProducts[0] }
        });
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request(app).get('/api/v1/products/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Product not found');
      });
    });

    describe('POST /api/v1/products', () => {
      it('should create a new product', async () => {
        const newProduct = { 
          name: 'New Product', 
          price: 149.99, 
          category: 'gaming', 
          stock: 15 
        };
        
        const response = await request(app)
          .post('/api/v1/products')
          .send(newProduct);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.product).toMatchObject(newProduct);
        expect(saveJsonData).toHaveBeenCalled();
      });
    });

    describe('PATCH /api/v1/products/:id', () => {
      it('should update a product', async () => {
        const updateData = { price: 89.99, stock: 5 };
        
        const response = await request(app)
          .patch('/api/v1/products/1')
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.product.price).toBe(89.99);
        expect(response.body.data.product.stock).toBe(5);
        expect(saveJsonData).toHaveBeenCalled();
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request(app)
          .patch('/api/v1/products/999')
          .send({ price: 89.99 });

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });

    describe('DELETE /api/v1/products/:id', () => {
      it('should delete a product', async () => {
        const response = await request(app).delete('/api/v1/products/1');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.product).toEqual(mockProducts[0]);
        expect(saveJsonData).toHaveBeenCalled();
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request(app).delete('/api/v1/products/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });
  });

  describe('API Info Routes', () => {
    it('should return welcome message on root path', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Welcome to the API');
    });

    it('should return API information on /api/v1', async () => {
      const response = await request(app).get('/api/v1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('API v1');
      expect(response.body.endpoints).toHaveProperty('users');
      expect(response.body.endpoints).toHaveProperty('products');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
}); 