"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface User {
  id: string
  email: string
  fullName: string
  userType: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Dashboard page mounted")
    const userData = localStorage.getItem("user")
    console.log("[v0] User data from localStorage:", userData ? "found" : "not found")

    if (!userData) {
      console.log("[v0] No user data, redirecting to home")
      router.push("/")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      console.log("[v0] User parsed successfully:", parsedUser.email)
      setUser(parsedUser)
    } catch (error) {
      console.error("[v0] Error parsing user data:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    console.log("[v0] Logging out user")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">DailyKart</div>
            <span className="text-sm text-gray-600">Grocery Store</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.fullName}</span>
            <Link href="/cart">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">My Cart</Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">Welcome to DailyKart</h1>
          <p className="text-xl text-gray-600">Browse our fresh groceries by category</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/shop?category=1">
            <Card className="p-8 text-center cursor-pointer hover:shadow-xl transition-all hover:-translate-y-2 h-full bg-white/90 backdrop-blur-sm border-2 border-blue-100">
              <div className="text-6xl mb-4">🍎</div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">Fruits</h3>
              <p className="text-gray-600 mb-4">Fresh and juicy fruits</p>
              <Button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                Browse Fruits
              </Button>
            </Card>
          </Link>

          <Link href="/shop?category=2">
            <Card className="p-8 text-center cursor-pointer hover:shadow-xl transition-all hover:-translate-y-2 h-full bg-white/90 backdrop-blur-sm border-2 border-green-100">
              <div className="text-6xl mb-4">🥕</div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">Vegetables</h3>
              <p className="text-gray-600 mb-4">Fresh green vegetables</p>
              <Button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                Browse Vegetables
              </Button>
            </Card>
          </Link>

          <Link href="/shop?category=3">
            <Card className="p-8 text-center cursor-pointer hover:shadow-xl transition-all hover:-translate-y-2 h-full bg-white/90 backdrop-blur-sm border-2 border-blue-100">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">Grains</h3>
              <p className="text-gray-600 mb-4">Healthy grains and cereals</p>
              <Button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                Browse Grains
              </Button>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
