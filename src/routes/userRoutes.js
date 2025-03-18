const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to get all users and create new users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

// Routes to get, update and delete a specific user
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router; 