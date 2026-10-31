import { type NextRequest, NextResponse } from "next/server"
import { getProducts, getCategories } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    const products = await getProducts(categoryId || undefined)
    const categories = await getCategories()

    return NextResponse.json({
      products,
      categories,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
