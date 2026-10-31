import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth"
import { getUserByEmail } from "@/lib/db"
import { sendLoginEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("[v0] Login attempt for email:", email)
    console.log("[v0] Password provided (length):", password ? password.length : 0)

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Normalize email to lowercase and trim password
    const normalizedEmail = email.toLowerCase().trim()
    const trimmedPassword = password.trim()

    console.log("[v0] Normalized email:", normalizedEmail)
    console.log("[v0] Searching for user...")

    const user = await getUserByEmail(normalizedEmail)
    console.log("[v0] User found:", user ? "yes" : "no")
    
    if (user) {
      console.log("[v0] User email in DB:", user.email)
      console.log("[v0] User ID:", user.id)
      console.log("[v0] User full name:", user.full_name)
      console.log("[v0] Password hash exists:", !!user.password_hash)
      console.log("[v0] Password hash length:", user.password_hash?.length || 0)
      console.log("[v0] Password hash (first 20 chars):", user.password_hash?.substring(0, 20) || "none")
    }

    if (!user) {
      console.log("[v0] ❌ User not found for email:", normalizedEmail)
      return NextResponse.json({ 
        error: "Invalid email or password. Please check your credentials and try again.",
        hint: "Make sure you're using the correct email address."
      }, { status: 401 })
    }

    if (!user.password_hash) {
      console.log("[v0] ❌ User has no password hash")
      return NextResponse.json({ 
        error: "Account setup incomplete. Please sign up again.",
      }, { status: 401 })
    }

    console.log("[v0] Verifying password...")
    const isPasswordValid = verifyPassword(trimmedPassword, user.password_hash)
    console.log("[v0] Password verification result:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("[v0] ❌ Password verification failed")
      console.log("[v0] Attempting to re-hash for comparison...")
      
      // Try one more time with exact password (no trim) in case password has intentional spaces
      const isPasswordValidNoTrim = verifyPassword(password, user.password_hash)
      console.log("[v0] Password valid (without trim):", isPasswordValidNoTrim)
      
      if (!isPasswordValidNoTrim) {
        return NextResponse.json({ 
          error: "Invalid email or password. Please check your credentials and try again.",
          hint: "Make sure your password is correct. Passwords are case-sensitive."
        }, { status: 401 })
      }
    }

    // Send login notification in the background so login does not wait on Gmail
    void sendLoginEmail(user.email, user.full_name, user.user_type).catch((emailError: any) => {
      console.error("[v0] Failed to send login email:", emailError?.message || emailError)
    })

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          isVerified: user.is_verified,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
