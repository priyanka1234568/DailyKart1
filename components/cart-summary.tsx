"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  price: number
  quantity: number
}

interface CartSummaryProps {
  userId: string
}

export default function CartSummary({ userId }: CartSummaryProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCartItems()
  }, [userId])

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`/api/cart?userId=${userId}`)
      const data = await response.json()
      setCartItems(data.items || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const tax = subtotal * 0.01
  const total = subtotal + tax

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          totalAmount: total,
        }),
      })

      if (!response.ok) throw new Error("Failed to create order")

      toast({
        title: "Success",
        description: "Order placed successfully",
      })

      // Clear cart and redirect
      localStorage.removeItem("cartItems")
      window.location.href = "/order-confirmation"
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Card className="p-6 h-fit sticky top-24">
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (1%)</span>
          <span className="font-semibold">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-border pt-4 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button onClick={handleCheckout} className="w-full" size="lg" disabled={cartItems.length === 0}>
          Proceed to Checkout
        </Button>
        <Button asChild variant="outline" className="w-full bg-transparent">
          <a href="/shop">Continue Shopping</a>
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          Items in cart: <span className="font-semibold text-foreground">{cartItems.length}</span>
        </p>
      </div>
    </Card>
  )
}
