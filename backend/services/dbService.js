const db = require('../config/database');

class DatabaseService {
  // ========== FARMER OPERATIONS ==========
  static async createFarmer(farmerData) {
    const { name, phone, email, password, address, village, district, state, pincode } = farmerData;
    const result = await db.run(
      `INSERT INTO farmers (name, phone, email, password, address, village, district, state, pincode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email, password, address, village, district, state, pincode]
    );
    return { id: result.id, ...farmerData };
  }

  static async getFarmerById(id) {
    return await db.get('SELECT * FROM farmers WHERE id = ?', [id]);
  }

  static async getFarmerByPhone(phone) {
    return await db.get('SELECT * FROM farmers WHERE phone = ?', [phone]);
  }

  static async getAllFarmers() {
    return await db.all('SELECT * FROM farmers ORDER BY created_at DESC');
  }

  static async updateFarmer(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    await db.run(`UPDATE farmers SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return await this.getFarmerById(id);
  }

  // ========== PRODUCT OPERATIONS ==========
  static async addProduct(productData) {
    const {
      farmer_id, category, name, type, breed, age_months, weight_kg,
      quantity, unit, price_per_unit, total_price, description,
      image_url, image_url2, image_url3, video_url, location,
      is_organic, is_certified
    } = productData;

    const result = await db.run(
      `INSERT INTO products (
        farmer_id, category, name, type, breed, age_months, weight_kg,
        quantity, unit, price_per_unit, total_price, description,
        image_url, image_url2, image_url3, video_url, location,
        is_organic, is_certified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        farmer_id, category, name, type, breed, age_months, weight_kg,
        quantity, unit, price_per_unit, total_price, description,
        image_url, image_url2, image_url3, video_url, location,
        is_organic || 0, is_certified || 0
      ]
    );
    return { id: result.id, ...productData };
  }

  static async getProductsByCategory(category, filters = {}) {
    let sql = `
      SELECT p.*, f.name as farmer_name, f.village, f.district, f.phone
      FROM products p
      JOIN farmers f ON p.farmer_id = f.id
      WHERE p.category = ? AND p.status = 'available'
    `;
    const params = [category];

    // Apply filters
    if (filters.minPrice) {
      sql += ' AND p.price_per_unit >= ?';
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      sql += ' AND p.price_per_unit <= ?';
      params.push(filters.maxPrice);
    }
    if (filters.is_organic) {
      sql += ' AND p.is_organic = 1';
    }
    if (filters.location) {
      sql += ' AND (f.village LIKE ? OR f.district LIKE ?)';
      params.push(`%${filters.location}%`, `%${filters.location}%`);
    }

    sql += ' ORDER BY p.created_at DESC';
    
    return await db.all(sql, params);
  }

  static async getProductById(id) {
    return await db.get(
      `SELECT p.*, f.name as farmer_name, f.village, f.district, f.phone, f.email
       FROM products p
       JOIN farmers f ON p.farmer_id = f.id
       WHERE p.id = ?`,
      [id]
    );
  }

  static async incrementProductViews(id) {
    await db.run('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
  }

  static async updateProductStatus(id, status) {
    await db.run('UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
  }

  // ========== ORDER OPERATIONS ==========
  static async createOrder(orderData) {
    const {
      order_number, buyer_id, farmer_id, product_id, quantity,
      unit_price, total_price, delivery_charge, grand_total,
      delivery_address, delivery_pincode, delivery_phone, payment_method
    } = orderData;

    const result = await db.run(
      `INSERT INTO orders (
        order_number, buyer_id, farmer_id, product_id, quantity,
        unit_price, total_price, delivery_charge, grand_total,
        delivery_address, delivery_pincode, delivery_phone, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number, buyer_id, farmer_id, product_id, quantity,
        unit_price, total_price, delivery_charge, grand_total,
        delivery_address, delivery_pincode, delivery_phone, payment_method
      ]
    );

    // Update product status to reserved
    await this.updateProductStatus(product_id, 'reserved');
    
    return { id: result.id, ...orderData };
  }

  static async getOrdersByBuyer(buyer_id) {
    return await db.all(
      `SELECT o.*, p.name as product_name, p.image_url, f.name as farmer_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN farmers f ON o.farmer_id = f.id
       WHERE o.buyer_id = ?
       ORDER BY o.order_date DESC`,
      [buyer_id]
    );
  }

  static async getOrdersByFarmer(farmer_id) {
    return await db.all(
      `SELECT o.*, p.name as product_name, p.image_url, b.name as buyer_name, b.phone as buyer_phone
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN buyers b ON o.buyer_id = b.id
       WHERE o.farmer_id = ?
       ORDER BY o.order_date DESC`,
      [farmer_id]
    );
  }

  // ========== REVIEW OPERATIONS ==========
  static async addReview(reviewData) {
    const { product_id, buyer_id, rating, comment, images } = reviewData;
    const result = await db.run(
      'INSERT INTO reviews (product_id, buyer_id, rating, comment, images) VALUES (?, ?, ?, ?, ?)',
      [product_id, buyer_id, rating, comment, images]
    );
    return { id: result.id, ...reviewData };
  }

  static async getProductReviews(product_id) {
    return await db.all(
      `SELECT r.*, b.name as buyer_name
       FROM reviews r
       JOIN buyers b ON r.buyer_id = b.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [product_id]
    );
  }

  // ========== MESSAGE OPERATIONS ==========
  static async sendMessage(messageData) {
    const { sender_id, sender_type, receiver_id, receiver_type, message, image_url } = messageData;
    const result = await db.run(
      `INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, message, image_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sender_id, sender_type, receiver_id, receiver_type, message, image_url]
    );
    return { id: result.id, ...messageData };
  }

  static async getConversation(user1_id, user1_type, user2_id, user2_type) {
    return await db.all(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?)
          OR (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?)
       ORDER BY created_at ASC`,
      [user1_id, user1_type, user2_id, user2_type, user2_id, user2_type, user1_id, user1_type]
    );
  }

  // ========== NOTIFICATION OPERATIONS ==========
  static async createNotification(notificationData) {
    const { user_id, user_type, title, message, type } = notificationData;
    const result = await db.run(
      'INSERT INTO notifications (user_id, user_type, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [user_id, user_type, title, message, type]
    );
    return { id: result.id, ...notificationData };
  }

  static async getUserNotifications(user_id, user_type) {
    return await db.all(
      'SELECT * FROM notifications WHERE user_id = ? AND user_type = ? ORDER BY created_at DESC',
      [user_id, user_type]
    );
  }

  static async markNotificationAsRead(id) {
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
  }
}

module.exports = DatabaseService;