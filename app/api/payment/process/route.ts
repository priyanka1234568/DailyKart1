import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, upiMethod, upiId, userEmail } = await request.json()

    if (!amount || !upiMethod || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate fake transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    const recipientEmail = String(userEmail).trim().toLowerCase()

    console.log(`[PAYMENT] Fake payment processed:`, {
      amount,
      upiMethod,
      upiId,
      transactionId,
      userEmail: recipientEmail,
    })

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      transactionId,
      amount,
      paymentMethod: `UPI (${upiMethod})`,
    })
  } catch (error: any) {
    console.error("[PAYMENT] Payment processing error:", error)
    return NextResponse.json(
      { error: error.message || "Payment processing failed" },
      { status: 500 }
    )
  }
}

