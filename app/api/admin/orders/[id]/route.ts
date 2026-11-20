import { type NextRequest, NextResponse } from "next/server"
import { getAdminOrderDetail } from "@/lib/db"

function money(value: unknown) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

function displayStatus(status: unknown) {
  const value = String(status || "pending").toLowerCase()
  if (value === "completed") return "delivered"
  return value
}

function paymentStatusOf(order: any) {
  if (String(order.payment_method || "").toLowerCase() === "online") return "paid"
  const stored = String(order.payment_status || "").toLowerCase()
  if (stored === "paid" || stored === "pending") return stored
  return "pending"
}

function paymentMethodLabel(method: unknown) {
  const value = String(method || "cod").toLowerCase()
  if (value === "online") return "Online Payment"
  if (value === "cod") return "Cash on Delivery"
  return String(method || "Cash on Delivery")
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const detail = await getAdminOrderDetail(id)
    if (!detail) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const { order, items } = detail
    const lineItems = (items || []).map((item) => {
      const quantity = Number(item.quantity) || 0
      const price = money(item.price)
      return {
        id: item.id,
        productId: item.product_id,
        name: item.name || "Product",
        imageUrl: item.image_url || null,
        quantity,
        price,
        lineTotal: quantity * price,
      }
    })
    const itemsSubtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const storedTotal = money(order.total_amount)
    const addressParts = [order.delivery_address, order.city, order.zip_code]
      .map((part: unknown) => String(part || "").trim())
      .filter(Boolean)

    return NextResponse.json({
      order: {
        id: order.id,
        customerName: order.full_name || "Customer",
        email: order.email || "",
        phone: order.phone || null,
        deliveryAddress: addressParts.length > 0 ? addressParts.join(", ") : null,
        addressLine: order.delivery_address || null,
        city: order.city || null,
        zipCode: order.zip_code || null,
        orderDate: order.created_at,
        expectedDelivery: order.expected_delivery_at,
        status: displayStatus(order.status),
        paymentMethod: String(order.payment_method || "cod").toLowerCase(),
        paymentMethodLabel: paymentMethodLabel(order.payment_method),
        paymentStatus: paymentStatusOf(order),
        itemsSubtotal,
        totalBill: storedTotal > 0 ? storedTotal : itemsSubtotal,
        items: lineItems,
      },
    })
  } catch (error) {
    console.error("Error fetching admin order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
