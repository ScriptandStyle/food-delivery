const express = require('express');
const router = express.Router();
const { uploadFoodImage, deleteUploadedImage } = require('../controllers/uploadController');
const upload = require('../utils/fileUpload');
const { protect, authorize } = require('../middleware/auth');

// Upload image route
router.post('/', protect, authorize('admin'), upload.single('image'), uploadFoodImage);

// Delete image route
router.delete('/:filename', protect, authorize('admin'), deleteUploadedImage);

module.exports = router;
