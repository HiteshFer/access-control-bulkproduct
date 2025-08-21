const ProductBulkUploadService = require('../services/productBulkUploadService');
const fs = require('fs');
const path = require('path');

class ProductBulkUploadController {
  static async uploadProducts(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload a CSV file.',
        });
      }

      const filePath = req.file.path;
      const fileName = req.file.originalname;
      // Add to queue for processing
      const result = await ProductBulkUploadService.addToQueue(filePath, fileName);

      res.status(202).json({
        success: true,
        message: 'File uploaded successfully. Processing has started.',
        data: {
          jobId: result.jobId,
          trackingId: result.trackingId,
          fileName,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  static async getJobStatus(req, res) {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required',
        });
      }

      const job = await ProductBulkUploadService.getBulkUploadJob(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      console.error('Get job status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  static async getAllJobs(req, res) {
    try {
      const jobs = await ProductBulkUploadService.getAllBulkUploadJobs();

      res.json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      console.error('Get all jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
}

module.exports = ProductBulkUploadController;