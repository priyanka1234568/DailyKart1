import { type NextRequest, NextResponse } from "next/server"
import { removeFromCart } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params
    const { userId } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await removeFromCart(userId, productId)

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
