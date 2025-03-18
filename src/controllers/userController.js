const { loadJsonData, saveJsonData } = require('../models/dataLoader');

/**
 * Gets all users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await loadJsonData('users.json');
    res.json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const users = await loadJsonData('users.json');
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new user
 */
const createUser = async (req, res, next) => {
  try {
    const users = await loadJsonData('users.json');
    
    // Generate a random ID if not provided
    const newUser = {
      id: req.body.id || generateRandomId(),
      ...req.body
    };
    
    users.push(newUser);
    await saveJsonData('users.json', users);
    
    res.status(201).json({
      status: 'success',
      data: { user: newUser }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing user
 */
const updateUser = async (req, res, next) => {
  try {
    const users = await loadJsonData('users.json');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Update user preserving the ID
    users[userIndex] = {
      ...users[userIndex],
      ...req.body,
      id: users[userIndex].id // Ensure ID doesn't change
    };
    
    await saveJsonData('users.json', users);
    
    res.json({
      status: 'success',
      data: { user: users[userIndex] }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a user
 */
const deleteUser = async (req, res, next) => {
  try {
    const users = await loadJsonData('users.json');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    await saveJsonData('users.json', users);
    
    res.json({
      status: 'success',
      data: { user: deletedUser }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generates a random ID similar to MongoDB ObjectId
 */
function generateRandomId() {
  return Math.random().toString(16).substring(2) + Date.now().toString(16);
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 