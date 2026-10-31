import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  let connection
  try {
    const { name, description, price, quantity, categoryId, imageUrl } = await request.json()

    if (!name || price == null || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    connection = await getDb()
    const [result]: any = await connection.execute(
      `INSERT INTO products (name, description, price, quantity, category_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, Number(price), Number(quantity ?? 0), Number(categoryId), imageUrl || null],
    )

    const insertId = result?.insertId
    if (!insertId) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    const [rows]: any = await connection.execute("SELECT * FROM products WHERE id = ?", [insertId])
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    connection?.release?.()
  }
}
