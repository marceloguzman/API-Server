const express = require('express');
const { generateDummyImage } = require('../controllers/dummyImageController');

const router = express.Router();

// Route to generate dummy images
router.get('/:label/:width/:height', generateDummyImage);

module.exports = router; 