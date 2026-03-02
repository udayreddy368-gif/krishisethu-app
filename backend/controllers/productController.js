const dbService = require('../services/dbService');
const path = require('path');
const fs = require('fs');

class ProductController {
  static async getAllLivestock(req, res) {
    try {
      const products = await dbService.getProductsByCategory('livestock', req.query);
      
      // Add full image URLs
      const productsWithUrls = products.map(p => ({
        ...p,
        image_url: p.image_url ? `/uploads/products/${path.basename(p.image_url)}` : null,
        image_url2: p.image_url2 ? `/uploads/products/${path.basename(p.image_url2)}` : null,
        image_url3: p.image_url3 ? `/uploads/products/${path.basename(p.image_url3)}` : null
      }));
      
      res.json(productsWithUrls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLivestockById(req, res) {
    try {
      await dbService.incrementProductViews(req.params.id);
      const product = await dbService.getProductById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Add full image URLs
      product.image_url = product.image_url ? `/uploads/products/${path.basename(product.image_url)}` : null;
      product.image_url2 = product.image_url2 ? `/uploads/products/${path.basename(product.image_url2)}` : null;
      product.image_url3 = product.image_url3 ? `/uploads/products/${path.basename(product.image_url3)}` : null;
      
      // Get reviews
      const reviews = await dbService.getProductReviews(req.params.id);
      product.reviews = reviews;
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createLivestock(req, res) {
    try {
      const files = req.files || {};
      
      const productData = {
        farmer_id: parseInt(req.body.farmer_id),
        category: 'livestock',
        name: req.body.name,
        type: req.body.type,
        breed: req.body.breed,
        age_months: req.body.age_months ? parseInt(req.body.age_months) : null,
        weight_kg: req.body.weight_kg ? parseFloat(req.body.weight_kg) : null,
        quantity: parseInt(req.body.quantity) || 1,
        unit: req.body.unit || 'kg',
        price_per_unit: parseFloat(req.body.price_per_unit),
        total_price: parseFloat(req.body.total_price) || (parseFloat(req.body.price_per_unit) * (parseInt(req.body.quantity) || 1)),
        description: req.body.description,
        location: req.body.location,
        is_organic: req.body.is_organic === 'true' || req.body.is_organic === '1',
        is_certified: req.body.is_certified === 'true' || req.body.is_certified === '1',
        image_url: files.image ? files.image[0].path : null,
        image_url2: files.images && files.images[0] ? files.images[0].path : null,
        image_url3: files.images && files.images[1] ? files.images[1].path : null
      };

      const newProduct = await dbService.addProduct(productData);
      
      res.status(201).json({
        message: 'Product created successfully',
        product: {
          ...newProduct,
          image_url: newProduct.image_url ? `/uploads/products/${path.basename(newProduct.image_url)}` : null
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProductStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await dbService.updateProductStatus(id, status);
      res.json({ message: 'Product status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;