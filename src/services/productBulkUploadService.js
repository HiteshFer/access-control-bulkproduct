const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { productQueue } = require('../config/queue');
const fs = require('fs');
const csv = require('csv-parser');
const Joi = require('joi');

  // Validation schema for product data
const productSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(255),
  description: Joi.string().allow('').max(1000),
  status: Joi.string().required().trim().min(1).max(100),
  category: Joi.string().required().trim().min(1).max(100),
});

const ProductBulkUploadService  = {
  async createBulkUploadJob(fileName, jobId) {
    try {
      return await prisma.bulkUploadJob.create({
        data: {
          jobId,
          fileName,
          status: 'pending',
        },
      });
    } catch (error) {
      throw new Error(`Failed to create bulk upload job: ${error.message}`);
    }
  },

  async updateBulkUploadJob(jobId, data) {
    try {
      return await prisma.bulkUploadJob.update({
        where: { jobId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to update bulk upload job: ${error.message}`);
    }
  },

  async getBulkUploadJob(jobId) {
    try {
      return await prisma.bulkUploadJob.findUnique({
        where: { jobId },
      });
    } catch (error) {
      throw new Error(`Failed to get bulk upload job: ${error.message}`);
    }
  },

  async getAllBulkUploadJobs() {
    try {
      return await prisma.bulkUploadJob.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to get bulk upload jobs: ${error.message}`);
    }
  },

  async processCsvFile(filePath) {
    return new Promise((resolve, reject) => {
      const products = [];
      const errors = [];
      let lineNumber = 1; // Start from 1 (header row)

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          lineNumber++;
          try {
            // Clean and transform the data
            const productData = {
              name: row.name?.trim(),
              description: row.description?.trim() || '',
              status: row.status || "0",
              category: row.category?.trim(),
            };

            // Validate the product data
            const { error, value } = productSchema.validate(productData);
            if (error) {
              errors.push({
                line: lineNumber,
                errors: error.details.map(d => d.message),
                data: row,
              });
            } else {
              products.push(value);
            }
          } catch (err) {
            errors.push({
              line: lineNumber,
              errors: [`Processing error: ${err.message}`],
              data: row,
            });
          }
        })
        .on('end', () => {
          resolve({ products, errors });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  },

  async createProductsBatch(products) {
    const results = {
      successful: [],
      failed: [],
    };

    // Process products in smaller batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (const product of batch) {
        try {
          const createdProduct = await prisma.product.create({
            data: product,
          });
          results.successful.push(createdProduct);
        } catch (error) {
          results.failed.push({
            product,
            error: error.message,
          });
        }
      }
    }

    return results;
  },

  async addToQueue(filePath, fileName) {
    const jobId = `bulk-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await this.createBulkUploadJob(fileName, jobId);
    
    const job = await productQueue.add('product-bulk-upload', {
      filePath,
      fileName,
      jobId,
    }, {
      jobId,
    });

    return { jobId: job.id, trackingId: jobId };
  }
}

module.exports = ProductBulkUploadService;