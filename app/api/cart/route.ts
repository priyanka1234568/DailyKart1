import { type NextRequest, NextResponse } from "next/server"
import { addToCart, getCartItems, removeFromCart, updateCartItemQuantity } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity } = await request.json()
    
    console.log("[API] Add to cart request:", { userId, productId, quantity })

    if (!userId || !productId || !quantity) {
      console.log("[API] Missing required fields:", { userId, productId, quantity })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await addToCart(String(userId), String(productId), quantity)
    console.log("[API] Successfully added to cart")

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    console.log("[API] Get cart request for userId:", userId)

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const items = await getCartItems(String(userId))
    console.log("[API] Retrieved cart items:", items?.length || 0)

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, productId } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await removeFromCart(String(userId), String(productId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, productId, quantity } = await request.json()

    if (!userId || !productId || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await updateCartItemQuantity(String(userId), String(productId), quantity)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
