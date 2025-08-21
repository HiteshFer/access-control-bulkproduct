const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productBulkUploadController = require('../controllers/productBulkUploadController');
const upload = require('../config/multer');


router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Price routes
router.post('/:id/prices', productController.addProductPrice);
router.put('/prices/:priceId', productController.updateProductPrice);

// Variation routes
router.post('/:id/variations', productController.addProductVariation);
router.put('/variations/:variationId', productController.updateProductVariation);

// Bulk upload routes
router.post('/upload', upload.single('file'), productBulkUploadController.uploadProducts);

// Get job status
router.get('/jobs/:jobId', productBulkUploadController.getJobStatus);

// Get all jobs
router.get('/jobs', productBulkUploadController.getAllJobs);

module.exports = router;