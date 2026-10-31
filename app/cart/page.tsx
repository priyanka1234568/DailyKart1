"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string
}

interface User {
  id: string
  fullName: string
}

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)

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
      calculateTotal(data.items || [])
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

  const calculateTotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    setTotalAmount(total)
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      if (!user) return

      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId,
        }),
      })

      if (!response.ok) throw new Error("Failed to remove item")

      const updatedItems = cartItems.filter((item) => item.product_id !== productId)
      setCartItems(updatedItems)
      calculateTotal(updatedItems)

      toast({
        title: "Success",
        description: "Item removed from cart",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      if (!user || newQuantity < 1) return

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId,
          quantity: newQuantity,
        }),
      })

      if (!response.ok) throw new Error("Failed to update quantity")

      const updatedItems = cartItems.map((item) =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item,
      )
      setCartItems(updatedItems)
      calculateTotal(updatedItems)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }
    router.push("/billing")
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
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">DailyKart</div>
            <span className="text-sm text-gray-600">Grocery Store</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/shop")} className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Continue Shopping
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Shopping Cart</h1>

        {loading ? (
          <div>Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <Card className="p-8 text-center bg-white/90 backdrop-blur-sm shadow-lg border-2 border-blue-100">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Button onClick={() => router.push("/shop")} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
              Continue Shopping
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-green-600 rounded"></span>
                  Items in Cart ({cartItems.length})
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="flex gap-4 border-b pb-4 last:border-b-0">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{Number(item.price).toFixed(2)} each</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="ml-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 h-fit sticky top-24 bg-white/90 backdrop-blur-sm shadow-lg border-0">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-green-600 rounded"></span>
                  Order Summary
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (1%)</span>
                    <span className="font-medium">₹{(totalAmount * 0.01).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery</span>
                    <span className="font-medium">₹2.00</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
                    <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Total</span>
                    <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">₹{(totalAmount * 1.01 + 2).toFixed(2)}</span>
                  </div>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all">
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
