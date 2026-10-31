import nodemailer from "nodemailer"

// Email template generator (shared with API route)
function generateEmailHTML(type: string, data: any): string {
  if (type === "order-confirmation") {
    const paidAmount = Number(data.totalAmount) || 0
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
              <h1>Order Confirmed - DailyKart</h1>
            </div>
            <div class="content">
              <p>Hi ${data.fullName || "there"},</p>
              <p>Thank you for shopping with DailyKart. Your order has been placed successfully.</p>
              <div class="alert-box">
                <p><strong>Order ID:</strong> ${data.orderId}</p>
                <p><strong>Amount:</strong> Rs. ${paidAmount.toFixed(2)}</p>
                <p><strong>Payment:</strong> ${data.paymentMethod || "Confirmed"}</p>
              </div>
              <p>Your groceries will be delivered within 24 hours. Keep this email as your order receipt.</p>
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

  if (type === "welcome") {
    const isAdmin = data.userType === "admin"
    const headerColor = isAdmin ? "#2c3e50" : "#27ae60"
    const title = isAdmin ? "Welcome Admin to DailyKart!" : "Welcome to DailyKart!"
    const message = isAdmin 
      ? `Welcome to the DailyKart Admin Panel! You now have access to manage products, view orders, and oversee the entire platform.`
      : `Welcome to DailyKart! We're excited to have you as part of our community.`
    const actionText = isAdmin
      ? `You can now access the Admin Dashboard to manage the platform.`
      : `You can now browse our fresh groceries and place orders for delivery within 24 hours.`
    const buttonHTML = isAdmin
      ? `<a href="http://localhost:3000/admin/dashboard" class="cta-button">Access Admin Dashboard</a>`
      : `<a href="http://localhost:3000/shop" class="cta-button">Start Shopping</a>`
    const closingText = isAdmin ? "Thank you for managing DailyKart!" : "Happy shopping!"
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${headerColor}; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .cta-button { display: inline-block; background-color: ${headerColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>Hi ${data.fullName},</p>
              <p>${message}</p>
              <p>${actionText}</p>
              <p>${buttonHTML}</p>
              <p>${closingText}</p>
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
    const isAdmin = data.userType === "admin"
    const headerColor = isAdmin ? "#2c3e50" : "#3498db"
    const title = isAdmin ? "Welcome Admin - Login Successful" : "Login Successful - DailyKart"
    const greeting = isAdmin 
      ? `Welcome back, Admin ${data.fullName}!`
      : `Hi ${data.fullName},`
    const message = isAdmin
      ? `You have successfully logged into the DailyKart Admin Panel.`
      : `You have successfully logged into your DailyKart account.`
    const closingText = isAdmin
      ? "Thank you for managing DailyKart!"
      : "Thank you for using DailyKart!"
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${headerColor}; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>${greeting}</p>
              <p>${message}</p>
              ${!isAdmin ? `
              <div class="alert-box">
                <p><strong>Security Notice:</strong></p>
                <p>If you did not log in, please contact our support team immediately and consider changing your password.</p>
              </div>
              ` : ''}
              <p>${closingText}</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 DailyKart. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  if (type === "payment-receipt") {
    const paidAmount = Number(data.amount) || 0
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
              <h1>Receipt - DailyKart</h1>
            </div>
            <div class="content">
              <p>Hi ${data.fullName},</p>
              <p>Your DailyKart order is confirmed. Please keep this email as your receipt.</p>
              <div class="alert-box">
                <p><strong>Reference:</strong> ${data.transactionId}</p>
                <p><strong>Amount:</strong> Rs. ${paidAmount.toFixed(2)}</p>
                <p><strong>Method:</strong> ${data.paymentMethodName}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              </div>
              <p>Your groceries will be delivered within 24 hours.</p>
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

// Get nodemailer transporter
async function getEmailTransporter() {
  const gmailUser = process.env.GMAIL_USER
  const gmailPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPassword) {
    throw new Error("Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local")
  }

  const cleanPassword = gmailPassword.replace(/\s/g, '')

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: cleanPassword,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  })
}

function htmlToText(htmlContent: string): string {
  return htmlContent
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Send email directly using nodemailer
async function sendEmail(to: string, subject: string, htmlContent: string) {
  const recipient = String(to || "").trim().toLowerCase()
  if (!recipient || !recipient.includes("@")) {
    throw new Error(`Invalid recipient email: ${to}`)
  }

  const transporter = await getEmailTransporter()
  const gmailUser = process.env.GMAIL_USER!

  const mailOptions = {
    from: `DailyKart <${gmailUser}>`,
    to: recipient,
    subject: subject,
    html: htmlContent,
    text: htmlToText(htmlContent),
  }

  const info = await transporter.sendMail(mailOptions)
  console.log(`[EMAIL] Email sent successfully to ${recipient}`)
  console.log(`[EMAIL] Message ID: ${info.messageId}`)
  console.log(`[EMAIL] Accepted: ${JSON.stringify(info.accepted)} Rejected: ${JSON.stringify(info.rejected)}`)
  return info
}

// Email service for sending notifications
export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  totalAmount: number,
  fullName: string = "there",
  paymentMethod: string = "Confirmed"
) {
  try {
    console.log(`[EMAIL] Attempting to send order receipt email to: ${email}`)
    const htmlContent = generateEmailHTML("order-confirmation", { orderId, totalAmount, fullName, paymentMethod })
    await sendEmail(email, "Order Confirmed - DailyKart", htmlContent)
    console.log(`[EMAIL] Order receipt email sent successfully to: ${email}`)
  } catch (error) {
    console.error("Error sending order confirmation email:", error)
    throw error
  }
}

export async function sendWelcomeEmail(email: string, fullName: string, userType: "admin" | "user" = "user") {
  try {
    console.log(`[EMAIL] Attempting to send welcome email to: ${email} (${userType})`)
    const subject = userType === "admin" ? "Welcome Admin to DailyKart" : "Welcome to DailyKart"
    const htmlContent = generateEmailHTML("welcome", { fullName, userType })
    await sendEmail(email, subject, htmlContent)
    console.log(`[EMAIL] Welcome email sent successfully to: ${email}`)
  } catch (error: any) {
    console.error("[EMAIL] Error sending welcome email:", error)
    console.error("[EMAIL] Error details:", error.message)
    throw error
  }
}

export async function sendLoginEmail(email: string, fullName: string, userType: "admin" | "user" = "user") {
  try {
    console.log(`[EMAIL] Attempting to send login email to: ${email} (${userType})`)
    const subject = userType === "admin" ? "Welcome Admin - Login Successful" : "Login Successful - DailyKart"
    const htmlContent = generateEmailHTML("login-success", { fullName, userType })
    await sendEmail(email, subject, htmlContent)
    console.log(`[EMAIL] Login email sent successfully to: ${email}`)
  } catch (error: any) {
    console.error("[EMAIL] Error sending login email:", error)
    console.error("[EMAIL] Error details:", error.message)
    throw error
  }
}

export async function sendPaymentConfirmationEmail(
  email: string,
  fullName: string,
  amount: number,
  transactionId: string,
  paymentMethod: string
) {
  try {
    const recipient = String(email || "").trim().toLowerCase()
    const customerName = fullName?.trim() || "Customer"
    const paidAmount = Number(amount) || 0

    console.log(`[EMAIL] Attempting to send payment confirmation email to: ${recipient}`)

    const upiMethodName = paymentMethod === "paytm" ? "Paytm" : paymentMethod === "gpay" ? "Google Pay" : "PhonePe"
    const htmlContent = generateEmailHTML("payment-receipt", {
      fullName: customerName,
      amount: paidAmount,
      transactionId,
      paymentMethodName: `UPI (${upiMethodName})`,
    })

    await sendEmail(recipient, "Receipt - DailyKart", htmlContent)
    console.log(`[EMAIL] Payment confirmation email sent successfully to: ${recipient}`)
    return { sent: true, to: recipient }
  } catch (error: any) {
    console.error("[EMAIL] Error sending payment confirmation email:", error)
    console.error("[EMAIL] Error details:", error.message)
    throw error
  }
}