import { type NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId, items, totalAmount, paymentMethod = "cod" } = await request.json()

    console.log("[API] Order request:", { userId, items: items?.length, totalAmount, paymentMethod })

    if (!userId || !items || !totalAmount) {
      console.log("[API] Missing required fields:", { userId: !!userId, items: !!items, totalAmount: !!totalAmount })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const orderId = await createOrder(String(userId), Number(totalAmount), items, paymentMethod)

    return NextResponse.json(
      {
        message: "Order created successfully",
        orderId,
        paymentMethod,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating order:", error)
    const message = error?.message || "Internal server error"
    const clientError =
      message.includes("expired") ||
      message.includes("stock") ||
      message.includes("available") ||
      message.includes("not found")
    return NextResponse.json({ error: message }, { status: clientError ? 400 : 500 })
  }
}
