import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const connection = await getDb()
    
    try {
      // Get user
      const user = await getUserByEmail(normalizedEmail)
      
      if (!user) {
        return NextResponse.json({ 
          found: false,
          message: "User not found in database",
          searchedEmail: normalizedEmail
        })
      }

      // Get all users for debugging
      const [allUsers]: any = await connection.execute("SELECT id, email, LENGTH(password_hash) as hash_length FROM users LIMIT 10")
      
      return NextResponse.json({
        found: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          hasPasswordHash: !!user.password_hash,
          passwordHashLength: user.password_hash?.length || 0,
          passwordHashPreview: user.password_hash?.substring(0, 30) + "..." || "none",
        },
        sampleUsers: allUsers,
        message: "User found. Check passwordHashLength - it should be 128 characters (64 bytes hex encoded)"
      })
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error("Test user error:", error)
    return NextResponse.json({ 
      error: error.message || "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

