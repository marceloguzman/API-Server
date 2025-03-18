const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../../../src/controllers/userController');
const { loadJsonData, saveJsonData } = require('../../../src/models/dataLoader');

// Mock dataLoader module
jest.mock('../../../src/models/dataLoader');

describe('User Controller', () => {
  // Test data
  const mockUsers = [
    { id: '1', name: 'User 1', email: 'user1@example.com' },
    { id: '2', name: 'User 2', email: 'user2@example.com' }
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
    loadJsonData.mockResolvedValue([...mockUsers]);
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      // Call the controller
      await getAllUsers(req, res, next);

      // Check if loadJsonData was called correctly
      expect(loadJsonData).toHaveBeenCalledWith('users.json');

      // Check if response was sent correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockUsers.length,
        data: { users: mockUsers }
      });
    });

    it('should call next with error when loadJsonData fails', async () => {
      // Setup loadJsonData to fail
      const error = new Error('Test error');
      loadJsonData.mockRejectedValue(error);

      // Call the controller
      await getAllUsers(req, res, next);

      // Check if next was called with the error
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    it('should return the user with the specified ID', async () => {
      // Set up request params
      req.params.id = '1';

      // Call the controller
      await getUserById(req, res, next);

      // Check if loadJsonData was called correctly
      expect(loadJsonData).toHaveBeenCalledWith('users.json');

      // Check if response was sent correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUsers[0] }
      });
    });

    it('should call next with 404 error when user is not found', async () => {
      // Set up request params with non-existent ID
      req.params.id = 'nonexistent';

      // Call the controller
      await getUserById(req, res, next);

      // Check if next was called with 404 error
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'User not found'
      }));
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      // Setup request body
      req.body = { name: 'New User', email: 'newuser@example.com' };

      // Call the controller
      await createUser(req, res, next);

      // Check if saveJsonData was called with the updated users array
      expect(saveJsonData).toHaveBeenCalledWith('users.json', expect.arrayContaining([
        ...mockUsers,
        expect.objectContaining({ name: 'New User', email: 'newuser@example.com' })
      ]));

      // Check if response was sent correctly
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: expect.objectContaining({ name: 'New User', email: 'newuser@example.com' }) }
      });
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      // Setup request
      req.params.id = '1';
      req.body = { name: 'Updated User' };

      // Call the controller
      await updateUser(req, res, next);

      // Check if saveJsonData was called with updated data
      expect(saveJsonData).toHaveBeenCalledWith('users.json', expect.arrayContaining([
        expect.objectContaining({ id: '1', name: 'Updated User' }),
        mockUsers[1]
      ]));

      // Check if response was sent correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: expect.objectContaining({ id: '1', name: 'Updated User' }) }
      });
    });

    it('should call next with 404 error when user is not found', async () => {
      // Setup request with non-existent ID
      req.params.id = 'nonexistent';
      req.body = { name: 'Updated User' };

      // Call the controller
      await updateUser(req, res, next);

      // Check if next was called with 404 error
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'User not found'
      }));
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      // Setup request
      req.params.id = '1';

      // Call the controller
      await deleteUser(req, res, next);

      // Check if saveJsonData was called with the updated users array (without the deleted user)
      expect(saveJsonData).toHaveBeenCalledWith('users.json', [mockUsers[1]]);

      // Check if response was sent correctly
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUsers[0] }
      });
    });

    it('should call next with 404 error when user is not found', async () => {
      // Setup request with non-existent ID
      req.params.id = 'nonexistent';

      // Call the controller
      await deleteUser(req, res, next);

      // Check if next was called with 404 error
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'User not found'
      }));
    });
  });
}); 