import { type NextRequest, NextResponse } from "next/server"
import { createOrder, getUserById } from "@/lib/db"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { userId, items, totalAmount, paymentMethod = "cod", shippingAddress } = await request.json()

    console.log("[API] Order request:", { userId, items: items?.length, totalAmount, paymentMethod })

    if (!userId || !items || !totalAmount) {
      console.log("[API] Missing required fields:", { userId: !!userId, items: !!items, totalAmount: !!totalAmount })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const orderId = await createOrder(String(userId), Number(totalAmount), items, paymentMethod, shippingAddress)

    const user = await getUserById(String(userId))
    const recipientEmail = String(user?.email || "").trim().toLowerCase()
    let emailSent = false

    if (recipientEmail) {
      const paymentLabel =
        paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod === "online"
            ? "Online Payment"
            : String(paymentMethod)
      try {
        await sendOrderConfirmationEmail(
          recipientEmail,
          String(orderId),
          Number(totalAmount),
          user.full_name || "Customer",
          paymentLabel,
        )
        emailSent = true
      } catch (emailError: any) {
        console.error("[API] Failed to send receipt email:", emailError?.message || emailError)
      }
    } else {
      console.error("[API] Cannot send receipt email: user email not found for userId", userId)
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        orderId,
        paymentMethod,
        emailSent,
        emailTo: recipientEmail || null,
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
