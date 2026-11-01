import { type NextRequest, NextResponse } from "next/server"
import { getDb, ensureProductInventoryColumns } from "@/lib/db"
import { computeInventoryStats, enrichProduct, formatDateOnly } from "@/lib/inventory"

function toNullableDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  const formatted = formatDateOnly(String(value))
  return formatted
}

export async function GET(request: NextRequest) {
  let connection
  try {
    await ensureProductInventoryColumns()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim().toLowerCase() || ""
    const categoryId = searchParams.get("categoryId")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const availability = searchParams.get("availability")
    const expiry = searchParams.get("expiry")
    const stockStatus = searchParams.get("stockStatus")

    connection = await getDb()
    const [rows]: any = await connection.execute(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.name`,
    )
    const [categoryRows]: any = await connection.execute("SELECT * FROM categories ORDER BY name")
    const categories = categoryRows
    const products = (rows || []).map((row: any) => enrichProduct(row))
    const stats = computeInventoryStats(products)

    const filtered = products.filter((product: any) => {
      if (search && !String(product.name || "").toLowerCase().includes(search)) return false
      if (categoryId && String(product.category_id) !== String(categoryId)) return false
      if (minPrice !== null && minPrice !== "" && Number(product.price) < Number(minPrice)) return false
      if (maxPrice !== null && maxPrice !== "" && Number(product.price) > Number(maxPrice)) return false
      const statusFilter = availability
      if (statusFilter && statusFilter !== "all" && product.availability !== statusFilter) return false
      if (stockStatus === "available" && Number(product.quantity) <= 0) return false
      if (stockStatus === "unavailable" && Number(product.quantity) > 0) return false
      if (stockStatus && !["available", "unavailable", "all", ""].includes(stockStatus) && product.availability !== stockStatus) {
        return false
      }
      if (expiry && expiry !== "all" && product.expiry_status !== expiry) return false
      return true
    })

    return NextResponse.json({ products: filtered, categories, stats })
  } catch (error) {
    console.error("Error fetching admin products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    connection?.release?.()
  }
}

export async function POST(request: NextRequest) {
  let connection
  try {
    await ensureProductInventoryColumns()
    const { name, description, price, quantity, categoryId, imageUrl, minimumStock, expiryDate } = await request.json()

    if (!name || price == null || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (Number(price) < 0 || Number(quantity ?? 0) < 0 || Number(minimumStock ?? 0) < 0) {
      return NextResponse.json({ error: "Price, stock, and minimum stock must be zero or greater" }, { status: 400 })
    }

    connection = await getDb()
    const [result]: any = await connection.execute(
      `INSERT INTO products (name, description, price, quantity, minimum_stock, expiry_date, category_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        Number(price),
        Number(quantity ?? 0),
        Number(minimumStock ?? 10),
        toNullableDate(expiryDate),
        Number(categoryId),
        imageUrl || null,
      ],
    )

    const insertId = result?.insertId
    if (!insertId) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    const [rows]: any = await connection.execute(
      `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
      [insertId],
    )
    return NextResponse.json(enrichProduct(rows[0]), { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    connection?.release?.()
  }
}
