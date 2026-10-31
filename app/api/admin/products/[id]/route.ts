import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection
  try {
    const { id } = await params
    connection = await getDb()
    const [rows]: any = await connection.execute("SELECT * FROM products WHERE id = ?", [Number(id)])
    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    connection?.release?.()
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    const { name, description, price, quantity, categoryId, imageUrl } = await request.json()
    
    connection = await getDb()
    
    console.log(`[PUT] Updating product with id: ${id}`)
    
    // Check if product exists
    const [checkRows]: any = await connection.execute("SELECT * FROM products WHERE id = ?", [Number(id)])
    if (checkRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    
    // Update the product
    await connection.execute(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, quantity = ?, category_id = ?, image_url = ? 
       WHERE id = ?`,
      [name, description || null, Number(price), Number(quantity), Number(categoryId), imageUrl || null, Number(id)]
    )
    
    // Fetch updated product
    const [rows]: any = await connection.execute("SELECT * FROM products WHERE id = ?", [Number(id)])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("[PUT] Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    connection = await getDb()
    
    console.log(`[DELETE] Attempting to delete product with id: ${id} (type: ${typeof id})`)
    
    // First check if product exists
    const [checkRows]: any = await connection.execute("SELECT * FROM products WHERE id = ?", [Number(id)])
    console.log(`[DELETE] Found ${checkRows.length} products with id ${id}`)
    
    if (checkRows.length === 0) {
      console.log(`[DELETE] Product with id ${id} not found in database`)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    
    // Check if product is referenced in order_items
    const [orderItems]: any = await connection.execute(
      "SELECT * FROM order_items WHERE product_id = ?", 
      [Number(id)]
    )
    
    if (orderItems.length > 0) {
      console.log(`[DELETE] Product has ${orderItems.length} order items. Setting quantity to 0 instead of deleting.`)
      
      // Instead of deleting, set quantity to 0 to mark as out of stock
      await connection.execute(
        "UPDATE products SET quantity = 0 WHERE id = ?",
        [Number(id)]
      )
      
      return NextResponse.json({ 
        message: "Product marked as out of stock (has existing orders)", 
        archived: true 
      })
    }
    
    console.log(`[DELETE] Deleting product:`, checkRows[0])
    const [result]: any = await connection.execute("DELETE FROM products WHERE id = ?", [Number(id)])
    console.log(`[DELETE] Delete result:`, result)
    
    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error: any) {
    console.error("[DELETE] Error deleting product:", error)
    console.error("[DELETE] Error stack:", error.stack)
    
    // If it's a foreign key constraint error, try to set quantity to 0 instead
    if (error.message && error.message.includes('foreign key constraint')) {
      console.log("[DELETE] Foreign key constraint detected. Attempting to mark product as out of stock instead.")
      try {
        const resolvedParams = await params
        const id = resolvedParams.id
        if (connection) {
          await connection.execute(
            "UPDATE products SET quantity = 0 WHERE id = ?",
            [Number(id)]
          )
          return NextResponse.json({ 
            message: "Product marked as out of stock (has existing orders)", 
            archived: true 
          })
        }
      } catch (retryError: any) {
        console.error("[DELETE] Retry also failed:", retryError)
      }
    }
    
    return NextResponse.json({ 
      error: error.message || "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
}
