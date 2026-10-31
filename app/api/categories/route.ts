import { type NextRequest, NextResponse } from "next/server"
import { getCategories } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
