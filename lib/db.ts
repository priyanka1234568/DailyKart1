import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  // Empty string is a valid local MySQL password; do not fall back with ||
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE || "dailykart",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
})

export async function getDb() {
  try {
    const connection = await pool.getConnection()
    console.log("[v0] Database connection successful")
    return connection
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    const code = (error as { code?: string }).code
    if (code === "ECONNREFUSED") {
      const host = process.env.MYSQL_HOST || "127.0.0.1"
      const port = process.env.MYSQL_PORT || "3306"
      throw new Error(
        `MySQL is not running on ${host}:${port}. Start WAMP (green icon) or run npm run mysql:up, then retry.`,
      )
    }
    throw new Error("Failed to connect to database")
  }
}

// User queries
export async function getUserByEmail(email: string) {
  const connection = await getDb()
  try {
    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim()
    const [rows] = await connection.execute("SELECT * FROM users WHERE LOWER(TRIM(email)) = ?", [normalizedEmail])
    return (rows as any[])[0] || null
  } finally {
    connection.release()
  }
}

export async function createUser(email: string, passwordHash: string, fullName: string, userType: "admin" | "user") {
  const connection = await getDb()
  try {
    const [result] = await connection.execute(
      "INSERT INTO users (email, password_hash, full_name, user_type, created_at) VALUES (?, ?, ?, ?, NOW())",
      [email, passwordHash, fullName, userType],
    )
    return (result as any).insertId
  } finally {
    connection.release()
  }
}

export async function getUserById(id: string) {
  const connection = await getDb()
  try {
    const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [id])
    return (rows as any[])[0] || null
  } finally {
    connection.release()
  }
}

// Product queries
export async function getProducts(categoryId?: string) {
  const connection = await getDb()
  try {
    if (categoryId) {
      const [rows] = await connection.execute("SELECT * FROM products WHERE category_id = ? ORDER BY name", [
        categoryId,
      ])
      return rows
    }
    const [rows] = await connection.execute("SELECT * FROM products ORDER BY name")
    return rows
  } finally {
    connection.release()
  }
}

export async function getProductById(id: string) {
  const connection = await getDb()
  try {
    const [rows] = await connection.execute("SELECT * FROM products WHERE id = ?", [id])
    return (rows as any[])[0] || null
  } finally {
    connection.release()
  }
}

export async function getCategories() {
  const connection = await getDb()
  try {
    const [rows] = await connection.execute("SELECT * FROM categories ORDER BY name")
    return rows
  } finally {
    connection.release()
  }
}

// Cart queries
export async function getCartItems(userId: string) {
  const connection = await getDb()
  try {
    console.log("[DB] Getting cart items for user:", userId)
    const [rows] = await connection.execute(
      `SELECT ci.*, p.name, p.price, p.image_url 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?`,
      [userId],
    )
    console.log("[DB] Retrieved cart items:", rows?.length || 0)
    return rows
  } catch (error) {
    console.error("[DB] Error getting cart items:", error)
    throw error
  } finally {
    connection.release()
  }
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const connection = await getDb()
  try {
    console.log("[DB] Adding to cart:", { userId, productId, quantity })
    const result = await connection.execute(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [userId, productId, quantity, quantity],
    )
    console.log("[DB] Add to cart result:", result)
    return true
  } catch (error) {
    console.error("[DB] Error adding to cart:", error)
    throw error
  } finally {
    connection.release()
  }
}

export async function removeFromCart(userId: string, productId: string) {
  const connection = await getDb()
  try {
    await connection.execute("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, productId])
  } finally {
    connection.release()
  }
}

export async function clearCart(userId: string) {
  const connection = await getDb()
  try {
    await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [userId])
  } finally {
    connection.release()
  }
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  const connection = await getDb()
  try {
    if (quantity <= 0) {
      await removeFromCart(userId, productId)
    } else {
      await connection.execute("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", [
        quantity,
        userId,
        productId,
      ])
    }
  } finally {
    connection.release()
  }
}

// Order queries
export async function createOrder(userId: string, totalAmount: number, items: any[], paymentMethod: string = "cod") {
  const connection = await getDb()
  try {
    console.log("[DB] Creating order:", { userId, totalAmount, items: items?.length, paymentMethod })
    
    // Try with payment_method column first, fallback to without it
    let result
    try {
      result = await connection.execute(
        "INSERT INTO orders (user_id, total_amount, status, payment_method, created_at) VALUES (?, ?, ?, ?, NOW())",
        [userId, totalAmount, "pending", paymentMethod],
      )
    } catch (error) {
      console.log("[DB] Payment method column not found, using fallback")
      result = await connection.execute(
        "INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, ?, NOW())",
        [userId, totalAmount, "pending"],
      )
    }
    
    const orderId = (result as any).insertId
    console.log("[DB] Order created with ID:", orderId)

    console.log("[DB] Adding order items...")
    for (const item of items) {
      console.log("[DB] Adding item:", { orderId, productId: item.product_id, quantity: item.quantity, price: item.price })
      await connection.execute("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ])
    }
    console.log("[DB] All order items added")

    return orderId
  } catch (error) {
    console.error("[DB] Error creating order:", error)
    throw error
  } finally {
    connection.release()
  }
}

export async function getOrderById(orderId: string) {
  const connection = await getDb()
  try {
    const [rows] = await connection.execute("SELECT * FROM orders WHERE id = ?", [orderId])
    return (rows as any[])[0] || null
  } finally {
    connection.release()
  }
}

export async function getOrderItems(orderId: string) {
  const connection = await getDb()
  try {
    const [rows] = await connection.execute(
      `SELECT oi.*, p.name, p.image_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orderId],
    )
    return rows
  } finally {
    connection.release()
  }
}
