import { type NextRequest, NextResponse } from "next/server"
import { sendPaymentConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { amount, upiMethod, upiId, userEmail, userName } = await request.json()

    if (!amount || !upiMethod || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate fake transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    const recipientEmail = String(userEmail).trim().toLowerCase()
    const recipientName = userName || "Customer"

    console.log(`[PAYMENT] Fake payment processed:`, {
      amount,
      upiMethod,
      upiId,
      transactionId,
      userEmail: recipientEmail,
    })

    let emailSent = false
    let emailErrorMessage: string | null = null

    try {
      await sendPaymentConfirmationEmail(recipientEmail, recipientName, Number(amount), transactionId, upiMethod)
      emailSent = true
    } catch (emailError: any) {
      emailErrorMessage = emailError?.message || String(emailError)
      console.error("[PAYMENT] Failed to send payment email:", emailErrorMessage)
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Payment processed successfully. Confirmation email sent to ${recipientEmail}`
        : "Payment processed successfully, but confirmation email could not be sent",
      transactionId,
      amount,
      paymentMethod: `UPI (${upiMethod})`,
      emailSent,
      emailTo: recipientEmail,
      emailError: emailErrorMessage,
    })
  } catch (error: any) {
    console.error("[PAYMENT] Payment processing error:", error)
    return NextResponse.json(
      { error: error.message || "Payment processing failed" },
      { status: 500 }
    )
  }
}

