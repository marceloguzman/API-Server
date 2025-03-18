const errorHandler = require('../../../src/middlewares/errorHandler');

describe('Error Handler Middleware', () => {
  // Save original NODE_ENV and console.error
  const originalNodeEnv = process.env.NODE_ENV;
  const originalConsoleError = console.error;

  // Mock response object
  let res;
  let req;
  let next;

  beforeEach(() => {
    // Mock console.error to prevent test output noise
    console.error = jest.fn();

    // Mock request, response objects
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    // Restore original NODE_ENV and console.error
    process.env.NODE_ENV = originalNodeEnv;
    console.error = originalConsoleError;
  });

  it('should respond with the correct status code and error message', () => {
    // Create test error
    const error = new Error('Test error message');
    error.statusCode = 400;

    // Call middleware
    errorHandler(error, req, res, next);

    // Check if response was sent correctly
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      statusCode: 400,
      message: 'Test error message'
    }));
  });

  it('should default to status code 500 when not specified', () => {
    // Create test error without statusCode
    const error = new Error('Internal server error');

    // Call middleware
    errorHandler(error, req, res, next);

    // Check if default status code is used
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should include stack trace in development environment', () => {
    // Set environment to development
    process.env.NODE_ENV = 'development';

    // Create test error with stack
    const error = new Error('Development error');
    error.stack = 'Stack trace info';

    // Call middleware
    errorHandler(error, req, res, next);

    // Check if stack is included in development
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      stack: 'Stack trace info'
    }));
  });

  it('should not include stack trace in production environment', () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';

    // Create test error with stack
    const error = new Error('Production error');
    error.stack = 'Stack trace info';

    // Call middleware
    errorHandler(error, req, res, next);

    // Check if stack is not included in production
    expect(res.json).toHaveBeenCalledWith(
      expect.not.objectContaining({
        stack: expect.anything()
      })
    );
  });

  it('should log the error message and stack trace', () => {
    // Create test error
    const error = new Error('Logged error');
    error.stack = 'Stack trace to log';

    // Call middleware
    errorHandler(error, req, res, next);

    // Check if error is logged
    expect(console.error).toHaveBeenCalledWith(`Error: Logged error`);
    expect(console.error).toHaveBeenCalledWith('Stack trace to log');
  });
}); 