"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  fullName: string
  userType: "admin" | "user"
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  return (
    <nav className="border-b border-green-200 bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">DailyKart</div>
          <span className="text-sm text-gray-600">Fresh Groceries</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <Link href={user.userType === "admin" ? "/admin/dashboard" : "/shop"}>
                <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                  {user.userType === "admin" ? "📊 Dashboard" : "🛒 Shop"}
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
