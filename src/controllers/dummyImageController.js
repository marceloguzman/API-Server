const { createCanvas } = require('canvas');

/**
 * Generates a dummy image with the specified text
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const generateDummyImage = (req, res, next) => {
  try {
    const { label, width, height } = req.params;

    // Convert parameters to numbers
    const imageWidth = parseInt(width, 10);
    const imageHeight = parseInt(height, 10);

    // Validate dimensions
    if (isNaN(imageWidth) || isNaN(imageHeight) || imageWidth <= 0 || imageHeight <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid image dimensions'
      });
    }

    // Create canvas
    const canvas = createCanvas(imageWidth, imageHeight);
    const ctx = canvas.getContext('2d');

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, imageHeight);
    gradient.addColorStop(0, '#e0e0e0');    // Lighter gray at the top
    gradient.addColorStop(1, '#ababab');    // Darker gray at the bottom

    // Draw background with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, imageWidth, imageHeight);

    // Configure text
    ctx.fillStyle = '#666666';
    ctx.font = `${Math.min(imageWidth, imageHeight) / 8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text in the center
    ctx.fillText(label, imageWidth / 2, imageHeight / 2);

    // Send image as response
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDummyImage
}; 