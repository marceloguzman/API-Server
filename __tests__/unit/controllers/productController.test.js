const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../../../src/controllers/productController');
const { loadJsonData, saveJsonData } = require('../../../src/models/dataLoader');

// Mock dataLoader module
jest.mock('../../../src/models/dataLoader');

describe('Product Controller', () => {
  // Test data
  const mockProducts = [
    { id: 1, name: 'Product 1', price: 99.99, category: 'electronics', stock: 10 },
    { id: 2, name: 'Product 2', price: 199.99, category: 'electronics', stock: 5 },
    { id: 3, name: 'Product 3', price: 29.99, category: 'accessories', stock: 20 }
  ];

  // Mock request, response, and next objects
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next
    req = {
      params: {},
      body: {},
      query: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    // Default mock for loadJsonData
    loadJsonData.mockResolvedValue([...mockProducts]);
  });

  describe('getAllProducts', () => {
    it('should return all products when no filters are applied', async () => {
      // Call the controller
      await getAllProducts(req, res, next);

      // Check if loadJsonData was called correctly
      expect(loadJsonData).toHaveBeenCalledWith('products.json');

      // Check if response was sent correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockProducts.length,
        data: { products: mockProducts }
      });
    });

    it('should filter products by category', async () => {
      // Setup query parameters
      req.query.category = 'accessories';

      // Call the controller
      await getAllProducts(req, res, next);

      // Check if response was filtered correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: { products: [mockProducts[2]] }
      });
    });

    it('should filter products by minimum price', async () => {
      // Setup query parameters
      req.query.minPrice = '50';

      // Call the controller
      await getAllProducts(req, res, next);

      // Check if response was filtered correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { products: [mockProducts[0], mockProducts[1]] }
      });
    });

    it('should filter products by maximum price', async () => {
      // Setup query parameters
      req.query.maxPrice = '100';

      // Call the controller
      await getAllProducts(req, res, next);

      // Check if response was filtered correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { products: [mockProducts[0], mockProducts[2]] }
      });
    });

    it('should apply multiple filters correctly', async () => {
      // Setup query parameters
      req.query.category = 'electronics';
      req.query.minPrice = '150';

      // Call the controller
      await getAllProducts(req, res, next);

      // Check if response was filtered correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: { products: [mockProducts[1]] }
      });
    });

    it('should call next with error when loadJsonData fails', async () => {
      // Setup loadJsonData to fail
      const error = new Error('Test error');
      loadJsonData.mockRejectedValue(error);

      // Call the controller
      await getAllProducts(req, res, next);

      // Check if next was called with the error
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProductById', () => {
    it('should return the product with the specified ID', async () => {
      // Set up request params
      req.params.id = '1';

      // Call the controller
      await getProductById(req, res, next);

      // Check if loadJsonData was called correctly
      expect(loadJsonData).toHaveBeenCalledWith('products.json');

      // Check if response was sent correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { product: mockProducts[0] }
      });
    });

    it('should call next with 404 error when product is not found', async () => {
      // Set up request params with non-existent ID
      req.params.id = '999';

      // Call the controller
      await getProductById(req, res, next);

      // Check if next was called with 404 error
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'Product not found'
      }));
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      // Setup request body
      req.body = { 
        name: 'New Product', 
        price: 149.99, 
        category: 'gaming', 
        stock: 15 
      };

      // Call the controller
      await createProduct(req, res, next);

      // Check if saveJsonData was called with the updated products array
      expect(saveJsonData).toHaveBeenCalledWith('products.json', expect.arrayContaining([
        ...mockProducts,
        expect.objectContaining({ 
          id: 4, // Expected next ID
          name: 'New Product', 
          price: 149.99, 
          category: 'gaming', 
          stock: 15 
        })
      ]));

      // Check if response was sent correctly
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { product: expect.objectContaining({ 
          name: 'New Product',
          price: 149.99,
          category: 'gaming',
          stock: 15 
        }) }
      });
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      // Setup request
      req.params.id = '1';
      req.body = { price: 89.99, stock: 5 };

      // Call the controller
      await updateProduct(req, res, next);

      // Check if saveJsonData was called with updated data
      expect(saveJsonData).toHaveBeenCalledWith('products.json', expect.arrayContaining([
        expect.objectContaining({ id: 1, name: 'Product 1', price: 89.99, stock: 5 }),
        mockProducts[1],
        mockProducts[2]
      ]));

      // Check if response was sent correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { product: expect.objectContaining({ id: 1, name: 'Product 1', price: 89.99, stock: 5 }) }
      });
    });

    it('should call next with 404 error when product is not found', async () => {
      // Setup request with non-existent ID
      req.params.id = '999';
      req.body = { price: 89.99 };

      // Call the controller
      await updateProduct(req, res, next);

      // Check if next was called with 404 error
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'Product not found'
      }));
    });
  });

  describe('deleteProduct', () => {
    it('should delete an existing product', async () => {
      // Setup request
      req.params.id = '1';

      // Call the controller
      await deleteProduct(req, res, next);

      // Check if saveJsonData was called with the updated products array (without the deleted product)
      expect(saveJsonData).toHaveBeenCalledWith('products.json', 
        expect.arrayContaining([mockProducts[1], mockProducts[2]])
      );

      // Check if response was sent correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { product: mockProducts[0] }
      });
    });

    it('should call next with 404 error when product is not found', async () => {
      // Setup request with non-existent ID
      req.params.id = '999';

      // Call the controller
      await deleteProduct(req, res, next);

      // Check if next was called with 404 error
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'Product not found'
      }));
    });
  });
}); 