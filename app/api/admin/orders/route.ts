import { type NextRequest, NextResponse } from "next/server"
import { listOrdersWithCustomers } from "@/lib/db"

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

function formatAddress(order: any) {
  const parts = [order.delivery_address, order.city, order.zip_code].map((part) => String(part || "").trim()).filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : null
}

function toOrderSummary(order: any) {
  const itemsSubtotal = money(order.items_subtotal)
  const storedTotal = money(order.total_amount)
  const status = displayStatus(order.status)
  return {
    id: order.id,
    customerName: order.full_name || "Customer",
    email: order.email || "",
    phone: order.phone || null,
    deliveryAddress: formatAddress(order),
    orderDate: order.created_at,
    expectedDelivery: order.expected_delivery_at,
    status,
    paymentMethod: String(order.payment_method || "cod").toLowerCase(),
    paymentMethodLabel: paymentMethodLabel(order.payment_method),
    paymentStatus: paymentStatusOf(order),
    itemsSubtotal,
    totalBill: storedTotal > 0 ? storedTotal : itemsSubtotal,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim().toLowerCase() || ""
    const paymentStatus = (searchParams.get("paymentStatus") || "all").toLowerCase()
    const orderStatus = (searchParams.get("orderStatus") || "all").toLowerCase()
    const page = Math.max(1, Number(searchParams.get("page") || 1) || 1)
    const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") || 8) || 8))

    const rows = await listOrdersWithCustomers()
    const orders = (rows || []).map(toOrderSummary)

    const stats = {
      totalOrders: orders.length,
      revenue: orders.reduce((sum, order) => (order.status === "cancelled" ? sum : sum + order.totalBill), 0),
      pending: orders.filter((order) => order.status === "pending").length,
      delivered: orders.filter((order) => order.status === "delivered").length,
    }

    const filtered = orders.filter((order) => {
      if (search) {
        const haystack = `${order.customerName} ${order.email} ${order.id}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }
      if (paymentStatus !== "all" && order.paymentStatus !== paymentStatus) return false
      if (orderStatus !== "all" && order.status !== orderStatus) return false
      return true
    })

    const start = (page - 1) * pageSize
    const pageOrders = filtered.slice(start, start + pageSize)

    return NextResponse.json({
      orders: pageOrders,
      total: filtered.length,
      page,
      pageSize,
      stats,
    })
  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
