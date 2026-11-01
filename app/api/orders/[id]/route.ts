import { type NextRequest, NextResponse } from "next/server"
import { cancelOrder, getOrderById } from "@/lib/db"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    if (body?.action !== "cancel") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
    }
    const result = await cancelOrder(id)
    return NextResponse.json({
      message: result.alreadyCancelled ? "Order was already cancelled" : "Order cancelled and stock restored",
      ...result,
    })
  } catch (error: any) {
    console.error("Error cancelling order:", error)
    const message = error?.message || "Internal server error"
    return NextResponse.json({ error: message }, { status: message === "Order not found" ? 404 : 500 })
  }
}
