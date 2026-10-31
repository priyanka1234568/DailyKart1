import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("[TEST] Testing database connection...")
    const connection = await getDb()
    
    // Test basic query
    const [rows] = await connection.execute("SELECT 1 as test")
    console.log("[TEST] Database test result:", rows)
    
    // Test orders table structure
    const [columns] = await connection.execute("DESCRIBE orders")
    console.log("[TEST] Orders table structure:", columns)
    
    connection.release()
    
    return NextResponse.json({ 
      success: true, 
      test: rows,
      ordersStructure: columns 
    })
  } catch (error) {
    console.error("[TEST] Database test error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


