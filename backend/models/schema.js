const db = require('../config/database');

async function initializeDatabase() {
  // Create Farmers table
  await db.run(`
    CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      address TEXT,
      village TEXT,
      district TEXT,
      state TEXT,
      pincode TEXT,
      profile_image TEXT,
      aadhar_number TEXT UNIQUE,
      bank_account TEXT,
      ifsc_code TEXT,
      is_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Buyers table
  await db.run(`
    CREATE TABLE IF NOT EXISTS buyers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      business_name TEXT,
      business_type TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      gst_number TEXT,
      profile_image TEXT,
      is_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Products table
  await db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('livestock', 'grains', 'vegetables', 'fruits', 'others')),
      name TEXT NOT NULL,
      type TEXT,
      breed TEXT,
      age_months INTEGER,
      weight_kg REAL,
      quantity INTEGER DEFAULT 1,
      unit TEXT DEFAULT 'kg',
      price_per_unit REAL NOT NULL,
      total_price REAL,
      description TEXT,
      image_url TEXT,
      image_url2 TEXT,
      image_url3 TEXT,
      video_url TEXT,
      location TEXT,
      is_organic BOOLEAN DEFAULT 0,
      is_certified BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'reserved', 'sold', 'hidden')),
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
    )
  `);

  // Create Orders table
  await db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      buyer_id INTEGER NOT NULL,
      farmer_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      delivery_charge REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      delivery_address TEXT,
      delivery_pincode TEXT,
      delivery_phone TEXT,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expected_delivery DATE,
      delivered_date DATETIME,
      payment_method TEXT CHECK(payment_method IN ('cash', 'online', 'bank_transfer')),
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
      order_status TEXT DEFAULT 'pending' CHECK(order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
      notes TEXT,
      FOREIGN KEY (buyer_id) REFERENCES buyers(id),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Create Reviews table
  await db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      buyer_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (buyer_id) REFERENCES buyers(id)
    )
  `);

  // Create Messages table
  await db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      sender_type TEXT CHECK(sender_type IN ('farmer', 'buyer')),
      receiver_id INTEGER NOT NULL,
      receiver_type TEXT CHECK(receiver_type IN ('farmer', 'buyer')),
      message TEXT NOT NULL,
      image_url TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Notifications table
  await db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_type TEXT CHECK(user_type IN ('farmer', 'buyer')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ All database tables created successfully');
}

module.exports = { initializeDatabase };