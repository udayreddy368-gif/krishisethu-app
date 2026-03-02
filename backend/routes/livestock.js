const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { uploadFields, handleUploadError } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');

// Public routes
router.get('/', ProductController.getAllLivestock);
router.get('/:id', ProductController.getLivestockById);

// Protected routes
router.post('/',
  authenticate,
  uploadFields,
  handleUploadError,
  productValidation,
  ProductController.createLivestock
);

router.patch('/:id/status',
  authenticate,
  ProductController.updateProductStatus
);

module.exports = router;