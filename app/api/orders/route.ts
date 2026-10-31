import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"


export async function POST(request: NextRequest) {
  try {
    const { userId, items, totalAmount, shippingAddress, paymentMethod = "cod" } = await request.json()
    
    console.log("[API] Order request:", { userId, items: items?.length, totalAmount, paymentMethod })

    if (!userId || !items || !totalAmount) {
      console.log("[API] Missing required fields:", { userId: !!userId, items: !!items, totalAmount: !!totalAmount })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[API] Creating order...")
    
    // Test database connection first
    const connection = await getDb()
    console.log("[API] Database connection successful")
    
    // Try to create order without payment_method first
    try {
      const [result] = await connection.execute(
        "INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, ?, NOW())",
        [userId, totalAmount, "pending"],
      )
      const orderId = (result as any).insertId
      console.log("[API] Order created with ID:", orderId)

      console.log("[API] Adding order items...")
      for (const item of items) {
        console.log("[API] Adding item:", { orderId, productId: item.product_id, quantity: item.quantity, price: item.price })
        await connection.execute("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
        ])
      }
      console.log("[API] All order items added")

      // Clear cart after order
      console.log("[API] Clearing cart...")
      await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [userId])
      console.log("[API] Cart cleared")

      connection.release()

      return NextResponse.json(
        {
          message: "Order created successfully",
          orderId,
          paymentMethod,
        },
        { status: 201 },
      )
    } catch (dbError) {
      console.error("[API] Database error:", dbError)
      connection.release()
      throw dbError
    }

  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
