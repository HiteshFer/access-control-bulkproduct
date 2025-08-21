const productService = require('../services/productService');
const ApiError = require('../utils/ApiError');

const productController = {
  async getAllProducts(req, res, next) {
    try {
      const { page, limit, isActive } = req.query;
      const options = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        isActive: isActive !== undefined ? isActive === 'true' : true
      };

      const products = await productService.getAllProducts(options);
      
      res.json({
        success: true,
        data: products
      });
    } catch (err) {
      console.error('Get products error:', err);
      return next(ApiError(500, 'Failed to fetch products'));
    }
  },

  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID format (assuming CUID, modify if using integer IDs)
      if (!id) {
        return next(ApiError(400, 'Invalid product ID format'));
      }
      
      const product = await productService.getProductById(id);
      
      if (!product) {
        return next(ApiError(404, 'Product not found'));
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (err) {
      console.error('Get product error:', err);
      return next(ApiError(500, 'Failed to fetch product'));
    }
  },

  async createProduct(req, res, next) {
    try {
      const productData = req.body;
      // Validate required fields
      if (!productData.name) {
        return next(ApiError(400, 'Name are required'));
      }
      
      const product = await productService.createProduct(productData);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (err) {
      console.error('Create product error:', err);
      
      if (err.code === 'P2002') {
        return next(ApiError(400, 'Product with this slug already exists'));
      }
      
      return next(ApiError(500, 'Failed to create product'));
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      if (!id) {
        return next(ApiError(400, 'Invalid product ID format'));
      }
      
      const product = await productService.updateProduct(id, productData);
      
      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (err) {
      console.error('Update product error:', err);
      
      if (err.code === 'P2025') {
        return next(ApiError(404, 'Product not found'));
      }
      
      if (err.code === 'P2002') {
        return next(ApiError(400, 'Product with this slug already exists'));
      }
      
      return next(ApiError(500, 'Failed to update product'));
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return next(ApiError(400, 'Invalid product ID format'));
      }
      
      await productService.deleteProduct(id);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (err) {
      console.error('Delete product error:', err);
      
      if (err.code === 'P2025') {
        return next(ApiError(404, 'Product not found'));
      }
      
      return next(ApiError(500, 'Failed to delete product'));
    }
  },

  async addProductPrice(req, res, next) {
    try {
      const { id } = req.params;
      const priceData = req.body;
      
      if (!id) {
        return next(ApiError(400, 'Invalid product ID format'));
      }
      
      // Validate required price fields
      if (!priceData.price) {
        return next(ApiError(400, 'Price is required'));
      }
      const productId = parseInt(id)
      const price = await productService.addProductPrice(productId, priceData);
      
      res.status(201).json({
        success: true,
        data: price,
        message: 'Price added successfully'
      });
    } catch (err) {
      console.error('Add product price error:', err);
      
      if (err.code === 'P2003') {
        return next(ApiError(404, 'Product not found'));
      }
      
      return next(ApiError(500, 'Failed to add price'));
    }
  },

  async updateProductPrice(req, res, next) {
    try {
      const { priceId } = req.params;
      const priceData = req.body;
      
      if (!priceId) {
        return next(ApiError(400, 'Invalid price ID format'));
      }
      
      const price = await productService.updateProductPrice(parseInt(priceId), priceData);
      
      res.json({
        success: true,
        data: price,
        message: 'Price updated successfully'
      });
    } catch (err) {
      console.error('Update product price error:', err);
      
      if (err.code === 'P2025') {
        return next(ApiError(404, 'Price not found'));
      }
      
      return next(ApiError(500, 'Failed to update price'));
    }
  },

  async addProductVariation(req, res, next) {
    try {
      const { id } = req.params;
      const variationData = req.body;
      
      if (!id) {
        return next(ApiError(400, 'Invalid product ID format'));
      }
      
      // Validate required variation fields
      if (!variationData.name || !variationData.value) {
        return next(ApiError(400, 'Variation name and value are required'));
      }
      const productId = parseInt(id)
      const variation = await productService.addProductVariation(productId, variationData);
      
      res.status(201).json({
        success: true,
        data: variation,
        message: 'Variation added successfully'
      });
    } catch (err) {
      console.error('Add product variation error:', err);
      
      if (err.code === 'P2002') {
        return next(ApiError(400, 'SKU already exists'));
      }
      
      if (err.code === 'P2003') {
        return next(ApiError(404, 'Product not found'));
      }
      
      return next(ApiError(500, 'Failed to add variation'));
    }
  },

  async updateProductVariation(req, res, next) {
    try {
      const { variationId } = req.params;
      const variationData = req.body;
      
      if (!variationId) {
        return next(ApiError(400, 'Invalid variation ID format'));
      }
      
      const variation = await productService.updateProductVariation(parseInt(variationId), variationData);
      
      res.json({
        success: true,
        data: variation,
        message: 'Variation updated successfully'
      });
    } catch (err) {
      console.error('Update product variation error:', err);
      
      if (err.code === 'P2025') {
        return next(ApiError(404, 'Variation not found'));
      }
      
      if (err.code === 'P2002') {
        return next(ApiError(400, 'SKU already exists'));
      }
      
      return next(ApiError(500, 'Failed to update variation'));
    }
  },


  
};

module.exports = productController;