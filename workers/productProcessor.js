const { Worker } = require('bullmq');
const ProductBulkUploadService = require('../src/services/productBulkUploadService');
const redisConnection = require('../src/config/redis');
const fs = require('fs');

const worker = new Worker('product-bulk-upload', async (job) => {
  const { filePath, fileName, jobId } = job.data;
  
  try {
    console.log(`Processing job ${jobId}: ${fileName}`);

    // Update job status to processing
    await ProductBulkUploadService.updateBulkUploadJob(jobId, {
      status: 'processing',
    });

    // Process CSV file
    const { products, errors } = await ProductBulkUploadService.processCsvFile(filePath);

    console.log(`Found ${products.length} valid products and ${errors.length} errors`);

    // Update job with total rows
    await ProductBulkUploadService.updateBulkUploadJob(jobId, {
      totalRows: products.length + errors.length,
    });

    // Create products in batches
    const results = await ProductBulkUploadService.createProductsBatch(products);

    console.log(`Successfully created ${results.successful.length} products`);
    console.log(`Failed to create ${results.failed.length} products`);

    // Combine all errors
    const allErrors = [
      ...errors,
      ...results.failed.map(f => ({
        product: f.product,
        error: f.error,
      }))
    ];

    // Update final job status
    await ProductBulkUploadService.updateBulkUploadJob(jobId, {
      status: 'completed',
      processedRows: results.successful.length,
      failedRows: allErrors.length,
      errors: allErrors,
    });

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.log(`Job ${jobId} completed successfully`);
    
    return {
      processed: results.successful.length,
      failed: allErrors.length,
      errors: allErrors,
    };

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);

    // Update job status to failed
    await ProductBulkUploadService.updateBulkUploadJob(jobId, {
      status: 'failed',
      errors: [{
        error: error.message,
        stack: error.stack,
      }],
    });

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 jobs concurrently
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('Product processor worker started');

// Keep the worker running
process.on('SIGINT', async () => {
  await worker.close();
  process.exit(0);
});