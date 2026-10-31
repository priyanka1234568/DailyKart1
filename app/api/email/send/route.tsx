import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Email template generator
function generateEmailHTML(type: string, data: any): string {
  if (type === "order-confirmation") {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .order-details { background-color: white; padding: 15px; border-left: 4px solid #27ae60; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DailyKart - Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Thank you for your order!</p>
              <div class="order-details">
                <p><strong>Order ID:</strong> ${data.orderId}</p>
                <p><strong>Total Amount:</strong> ₹${data.totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> Confirmed</p>
              </div>
              <p>Your groceries will be delivered within 24 hours. You can track your order using the Order ID above.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 DailyKart. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  if (type === "welcome") {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .cta-button { display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to DailyKart!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.fullName},</p>
              <p>Welcome to DailyKart! We're excited to have you as part of our community.</p>
              <p>You can now browse our fresh groceries and place orders for delivery within 24 hours.</p>
              <p>
                <a href="https://dailykart.example.com/shop" class="cta-button">Start Shopping</a>
              </p>
              <p>Happy shopping!</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 DailyKart. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  if (type === "login-success") {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3498db; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Login Successful - DailyKart</h1>
            </div>
            <div class="content">
              <p>Hi ${data.fullName},</p>
              <p>You have successfully logged into your DailyKart account.</p>
              <div class="alert-box">
                <p><strong>Security Notice:</strong></p>
                <p>If you did not log in, please contact our support team immediately and consider changing your password.</p>
              </div>
              <p>Thank you for using DailyKart!</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 DailyKart. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  return ""
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, type, data } = await request.json()

    if (!to || !subject || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate email HTML
    const htmlContent = generateEmailHTML(type, data)

    // Gmail SMTP Configuration - Read from environment variables
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPassword) {
      console.warn("[EMAIL] Gmail credentials not configured")
      return NextResponse.json({ 
        error: "Email service not configured",
        email: to 
      }, { status: 500 })
    }

    // Remove any spaces from the password (safety measure)
    const cleanPassword = gmailPassword.replace(/\s/g, '')

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,  // From environment variable
        pass: cleanPassword,  // Password with spaces removed automatically
      },
    })

    // Send email
    const mailOptions = {
      from: `DailyKart <${gmailUser}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log(`[EMAIL] Email sent successfully to ${to}`)
    console.log(`[EMAIL] Message ID: ${info.messageId}`)

    return NextResponse.json({
      message: "Email sent successfully",
      email: to,
      messageId: info.messageId,
    }, { status: 200 })
  } catch (error: any) {
    console.error("Error sending email:", error)
    return NextResponse.json({ 
      error: error.message || "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}