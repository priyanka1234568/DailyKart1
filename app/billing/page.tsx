"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import PaymentModal from "@/components/payment-modal"

interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  is_expired?: boolean
  is_purchasable?: boolean
}

interface User {
  id: string
  fullName: string
  email: string
}

export default function BillingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    zipCode: "",
    phone: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod")

  const tax = totalAmount * 0.01
  const delivery = 2
  const finalTotal = totalAmount + tax + delivery

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchCartItems(parsedUser.id)
  }, [router])

  const fetchCartItems = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cart?userId=${userId}`)
      const data = await response.json()
      setCartItems(data.items || [])
      const total = (data.items || []).reduce((sum: number, item: CartItem) => sum + Number(item.price) * item.quantity, 0)
      setTotalAmount(total)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("[BILLING] Place order button clicked!")
    console.log("[BILLING] Form data:", formData)
    console.log("[BILLING] Payment method:", paymentMethod)

    if (!formData.address || !formData.city || !formData.zipCode || !formData.phone) {
      console.log("[BILLING] Validation failed - missing fields")
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (cartItems.length === 0) {
      console.log("[BILLING] Validation failed - empty cart")
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    if (cartItems.some((item: any) => item.is_expired || item.is_purchasable === false)) {
      toast({
        title: "Error",
        description: "Your cart contains an expired or unavailable product. Remove it before checkout.",
        variant: "destructive",
      })
      return
    }

    // If online payment selected, show payment modal
    if (paymentMethod === "online") {
      console.log("[BILLING] Online payment selected, showing payment modal")
      setShowPaymentModal(true)
      return
    }

    // For COD, proceed directly with order
    await processOrder()
  }

  const processOrder = async () => {
    try {
      setProcessing(true)

      console.log("[BILLING] Order data:", {
        userId: user?.id,
        items: cartItems,
        totalAmount: finalTotal,
        paymentMethod,
        shippingAddress: formData
      })

      // Create the order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          items: cartItems,
          totalAmount: finalTotal,
          shippingAddress: formData,
          paymentMethod: paymentMethod,
        }),
      })

      const orderData = await orderResponse.json()
      console.log("[BILLING] Order response:", orderData)

      if (!orderResponse.ok) throw new Error(orderData.error || "Failed to place order")

      toast({
        title: "Success",
        description: paymentMethod === "cod" 
          ? "Order placed successfully! Pay cash on delivery." 
          : "Order placed successfully! Payment confirmed.",
      })

      // Redirect to order confirmation
      router.push(`/order-confirmation?orderId=${orderData.orderId}&paymentMethod=${paymentMethod}`)

    } catch (error) {
      console.error("[BILLING] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

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
          <div className="flex items-center gap-4">
            <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Checkout
        </h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Billing Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-green-600 rounded"></span>
                  Shipping Address
                </h2>
                <form 
                  onSubmit={(e) => {
                    console.log("[BILLING] Form submitted!")
                    handlePlaceOrder(e)
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Address</label>
                    <Input
                      type="text"
                      name="address"
                      placeholder="Flat 101, Building A, Sector 5, MG Road"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        type="text"
                        name="city"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">PIN Code</label>
                      <Input
                        type="text"
                        name="zipCode"
                        placeholder="400001"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4 text-gray-800">Payment Method</label>
                    <div className="space-y-3">
                      <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === "cod" 
                          ? "border-green-500 bg-green-50" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}>
                        <input
                          type="radio"
                          id="cod"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value as "cod" | "online")}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="cod" className="text-sm font-medium text-gray-800 cursor-pointer">
                          Cash on Delivery (COD)
                        </label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === "online" 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}>
                        <input
                          type="radio"
                          id="online"
                          name="paymentMethod"
                          value="online"
                          checked={paymentMethod === "online"}
                          onChange={(e) => setPaymentMethod(e.target.value as "cod" | "online")}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="online" className="text-sm font-medium text-gray-800 cursor-pointer">
                          Online Payment
                        </label>
                      </div>
                    </div>
                    {paymentMethod === "cod" && (
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <span>💵</span>
                        Pay cash when your order is delivered
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={processing}
                    onClick={(e) => {
                      console.log("[BILLING] Button clicked!")
                      console.log("[BILLING] Event:", e)
                      console.log("[BILLING] Processing state:", processing)
                      console.log("[BILLING] Form data:", formData)
                      console.log("[BILLING] Cart items length:", cartItems.length)
                    }}
                  >
                    {processing ? "Processing..." : paymentMethod === "cod" ? "Place COD Order" : "Place Order"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 h-fit sticky top-24 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-green-600 rounded"></span>
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (1%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery</span>
                    <span className="font-medium">₹{delivery.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
                    <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Total</span>
                    <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {user && (
          <PaymentModal
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            amount={finalTotal}
            onPaymentSuccess={processOrder}
            userEmail={user.email}
            userName={user.fullName}
          />
        )}
      </div>
    </div>
  )
}
