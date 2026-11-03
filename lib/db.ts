import mysql from "mysql2/promise"
import { enrichProduct, isPurchasable } from "@/lib/inventory"

let inventorySchemaReady: Promise<void> | null = null

export async function ensureProductInventoryColumns() {
  if (!inventorySchemaReady) {
    inventorySchemaReady = (async () => {
      const connection = await pool.getConnection()
      try {
        const [cols]: any = await connection.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'`,
        )
        const names = new Set((cols || []).map((col: { COLUMN_NAME: string }) => col.COLUMN_NAME))
        if (!names.has("minimum_stock")) {
          await connection.execute(
            "ALTER TABLE products ADD COLUMN minimum_stock INT NOT NULL DEFAULT 10 AFTER quantity",
          )
        }
        if (!names.has("expiry_date")) {
          await connection.execute("ALTER TABLE products ADD COLUMN expiry_date DATE NULL AFTER minimum_stock")
        }
      } catch (error) {
        inventorySchemaReady = null
        throw error
      } finally {
        connection.release()
      }
    })()
  }
  await inventorySchemaReady
}

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
export async function getProducts(categoryId?: string, options?: { includeExpired?: boolean }) {
  await ensureProductInventoryColumns()
  const connection = await getDb()
  try {
    const params: any[] = []
    let sql = `SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE 1=1`
    if (categoryId) {
      sql += " AND p.category_id = ?"
      params.push(categoryId)
    }
    if (!options?.includeExpired) {
      sql += " AND (p.expiry_date IS NULL OR p.expiry_date >= CURDATE())"
    }
    sql += " ORDER BY p.name"
    const [rows] = await connection.execute(sql, params)
    return (rows as any[]).map((row) => enrichProduct(row))
  } finally {
    connection.release()
  }
}

export async function getProductById(id: string) {
  await ensureProductInventoryColumns()
  const connection = await getDb()
  try {
    const [rows] = await connection.execute(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [id],
    )
    const product = (rows as any[])[0]
    return product ? enrichProduct(product) : null
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
    await ensureProductInventoryColumns()
    const [rows] = await connection.execute(
      `SELECT ci.*, p.name, p.price, p.image_url, p.quantity AS stock_quantity,
              p.minimum_stock, p.expiry_date
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?`,
      [userId],
    )
    console.log("[DB] Retrieved cart items:", rows?.length || 0)
    return (rows as any[]).map((row) => {
      const enriched = enrichProduct({
        ...row,
        quantity: row.stock_quantity,
        expiry_date: row.expiry_date,
      })
      return {
        ...row,
        is_expired: enriched.is_expired,
        is_purchasable: isPurchasable(row.stock_quantity, row.expiry_date),
        availability: enriched.availability,
        expiry_status: enriched.expiry_status,
      }
    })
  } catch (error) {
    console.error("[DB] Error getting cart items:", error)
    throw error
  } finally {
    connection.release()
  }
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  await ensureProductInventoryColumns()
  const connection = await getDb()
  try {
    console.log("[DB] Adding to cart:", { userId, productId, quantity })
    const [productRows]: any = await connection.execute("SELECT * FROM products WHERE id = ?", [productId])
    const product = productRows[0] ? enrichProduct(productRows[0]) : null
    if (!product) {
      throw new Error("Product not found")
    }
    if (!isPurchasable(product.quantity, product.expiry_date)) {
      if (product.is_expired) {
        throw new Error("This product has expired and cannot be added to the cart")
      }
      throw new Error("This product is out of stock")
    }

    const [existing]: any = await connection.execute(
      "SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    )
    const alreadyInCart = Number(existing?.[0]?.quantity || 0)
    if (alreadyInCart + Number(quantity) > Number(product.quantity)) {
      throw new Error("Requested quantity exceeds available stock")
    }

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
  await ensureProductInventoryColumns()
  const connection = await getDb()
  try {
    if (quantity <= 0) {
      await connection.execute("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, productId])
      return
    }

    const [productRows]: any = await connection.execute("SELECT * FROM products WHERE id = ?", [productId])
    const product = productRows[0] ? enrichProduct(productRows[0]) : null
    if (!product) {
      throw new Error("Product not found")
    }
    if (!isPurchasable(product.quantity, product.expiry_date)) {
      throw new Error(
        product.is_expired
          ? "This product has expired and cannot be purchased"
          : "This product is out of stock",
      )
    }
    if (Number(quantity) > Number(product.quantity)) {
      throw new Error("Requested quantity exceeds available stock")
    }

    await connection.execute("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", [
      quantity,
      userId,
      productId,
    ])
  } finally {
    connection.release()
  }
}

// Order queries
export async function createOrder(userId: string, totalAmount: number, items: any[], paymentMethod: string = "cod") {
  await ensureProductInventoryColumns()
  const connection = await getDb()
  try {
    console.log("[DB] Creating order:", { userId, totalAmount, items: items?.length, paymentMethod })
    await connection.beginTransaction()

    for (const item of items) {
      const [rows]: any = await connection.execute("SELECT * FROM products WHERE id = ? FOR UPDATE", [item.product_id])
      const product = rows[0]
      if (!product) {
        throw new Error("One or more products in your cart are no longer available")
      }
      const enriched = enrichProduct(product)
      if (enriched.is_expired) {
        throw new Error(`${product.name} has expired and cannot be purchased`)
      }
      if (Number(enriched.quantity) < Number(item.quantity)) {
        throw new Error(`Insufficient stock for ${product.name}`)
      }
    }

    // Try with payment_method column first, fallback to without it
    let result: any
    try {
      ;[result] = await connection.execute(
        "INSERT INTO orders (user_id, total_amount, status, payment_method, created_at) VALUES (?, ?, ?, ?, NOW())",
        [userId, totalAmount, "pending", paymentMethod],
      )
    } catch (error) {
      console.log("[DB] Payment method column not found, using fallback")
      ;[result] = await connection.execute(
        "INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, ?, NOW())",
        [userId, totalAmount, "pending"],
      )
    }

    const orderId = result?.insertId
    if (!orderId) {
      throw new Error("Failed to create order")
    }
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
      await connection.execute("UPDATE products SET quantity = GREATEST(quantity - ?, 0), updated_at = NOW() WHERE id = ?", [
        Number(item.quantity),
        item.product_id,
      ])
    }
    console.log("[DB] All order items added")

    await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [userId])
    console.log("[DB] Cart cleared")

    await connection.commit()
    return orderId
  } catch (error) {
    try {
      await connection.rollback()
    } catch {}
    console.error("[DB] Error creating order:", error)
    throw error
  } finally {
    connection.release()
  }
}

export async function cancelOrder(orderId: string) {
  await ensureProductInventoryColumns()
  const connection = await getDb()
  try {
    await connection.beginTransaction()
    const [orders]: any = await connection.execute("SELECT * FROM orders WHERE id = ? FOR UPDATE", [orderId])
    const order = orders[0]
    if (!order) {
      throw new Error("Order not found")
    }
    if (order.status === "cancelled") {
      await connection.commit()
      return { orderId, alreadyCancelled: true }
    }

    const [items]: any = await connection.execute("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [
      orderId,
    ])
    for (const item of items) {
      await connection.execute("UPDATE products SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?", [
        Number(item.quantity),
        item.product_id,
      ])
    }
    await connection.execute("UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?", [orderId])
    await connection.commit()
    return { orderId, alreadyCancelled: false }
  } catch (error) {
    try {
      await connection.rollback()
    } catch {}
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
