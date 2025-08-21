const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports ={
  async getAllProducts(options = {}) {
    try {
      const { page = 1, limit = 10, isActive = true } = options;
      const skip = (page - 1) * limit;

      return await prisma.product.findMany({
        where: { 
          status:"1",
          is_deleted: "0"
        },
        include: {
          prices: {
            where: { 
              status:"1",
              is_deleted: "0"
            },
            orderBy: { createdAt: 'desc' }
          },
          variations: {
            where: { 
              status:"1",
              is_deleted: "0"
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw error;
    }
  },

  async getProductById(id) {
    try {
      return await prisma.product.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        },
        include: {
          prices: {
            where: { 
              status: "1",
              is_deleted: "0"
            },
            orderBy: { createdAt: 'desc' }
          },
          variations: {
            where: { 
              status: "1",
              is_deleted: "0"
            }
          }
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      const { prices = [], variations = [], ...product } = productData;
      
      return await prisma.product.create({
        data: {
          ...product,
          is_deleted: "0",
          prices: {
            create: prices.map(price => ({
              ...price,
              is_deleted: "0"
            }))
          },
          variations: {
            create: variations.map(variation => ({
              ...variation,
              is_deleted: "0"
            }))
          }
        },
        include: {
          prices: true,
          variations: true
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async updateProduct(productId, productData) {
    try {
      const { prices, variations, ...product } = productData;
      const id = parseInt(productId)
      return await prisma.product.update({
        where: {
          id: id,
          is_deleted: "0",
        },
        data: {
          ...product,
          prices: {
            deleteMany: { productId: id, is_deleted: "0" }, // remove old
            create: prices, // insert new
          },

          // Update or recreate variations
          variations: {
            deleteMany: { productId: id, is_deleted: "0" },
            create: variations,
          },
        },
        include: {
          prices: true,
          variations:true,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      return await prisma.product.update({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        },
        data: {
          is_deleted: "1"
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async addProductPrice(productId, priceData) {
    try {
      return await prisma.productPrice.create({
        data: {
          ...priceData,
          productId: productId,
          is_deleted: "0"
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async updateProductPrice(priceId, priceData) {
    try {
      return await prisma.productPrice.update({
        where: { 
          id: priceId,
          is_deleted: "0"
        },
        data: priceData
      });
    } catch (error) {
      throw error;
    }
  },

  async addProductVariation(productId, variationData) {
    try {
      return await prisma.productVariation.create({
        data: {
          ...variationData,
          productId: productId,
          is_deleted: "0",
        },
      });
    } catch (error) {
      throw error;
    }
  },

  async updateProductVariation(variationId, variationData) {
    try {
      return await prisma.productVariation.update({
        where: { 
          id: variationId,
          is_deleted: "0"
        },
        data: variationData
      });
    } catch (error) {
      throw error;
    }
  }
}