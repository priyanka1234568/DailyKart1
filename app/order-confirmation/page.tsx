"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Package, Mail, CreditCard, Truck } from "lucide-react"

interface User {
  id: string
  email: string
  fullName: string
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const paymentMethod = searchParams.get("paymentMethod") || "cod"

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              DailyKart
            </div>
            <span className="text-sm text-gray-600">Grocery Store</span>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
            Logout
          </Button>
        </div>
      </nav>

      {/* Confirmation Content */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="p-8 text-center shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          {/* Success Icon with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 shadow-lg">
                <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your order. Your groceries will be delivered within 24 hours.
          </p>

          {/* Order Details Card */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg mb-8 text-left border border-blue-100 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Order Details</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <p className="font-semibold text-gray-900">
                  Order ID: <span className="text-blue-600">{orderId || "N/A"}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-700">
                  Payment Method: <span className="font-semibold text-green-700">
                    {paymentMethod === "online" ? "Online Payment (UPI)" : "Cash on Delivery"}
                  </span>
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-gray-700">
                  Estimated Delivery: <span className="font-semibold text-orange-700">24 hours</span>
                </p>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <Mail className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-gray-700">
                  Confirmation email sent to <span className="font-semibold text-purple-700">{user.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              onClick={() => router.push("/shop")} 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => router.push("/dashboard")} 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all duration-200 px-8"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
