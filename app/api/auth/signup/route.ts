import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { getUserByEmail, createUser } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, userType } = await request.json()
    console.log("[v0] Signup attempt for email:", email)

    // Validation
    if (!email || !password || !fullName || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (userType !== "admin" && userType !== "user") {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const existingUser = await getUserByEmail(normalizedEmail)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = hashPassword(password)

    // Create user with normalized email
    const userId = await createUser(normalizedEmail, passwordHash, fullName, userType)
    console.log("[v0] User created with ID:", userId)

    // Send welcome email in the background so signup does not wait on Gmail
    console.log("[v0] Sending welcome email to:", normalizedEmail, "User type:", userType)
    void sendWelcomeEmail(normalizedEmail, fullName, userType).catch((emailError: any) => {
      console.error("[v0] ❌ Failed to send welcome email:", emailError?.message || emailError)
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: userId,
          email: email,
          fullName: fullName,
          userType: userType,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
