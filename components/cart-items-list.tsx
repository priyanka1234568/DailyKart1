"use client"

import { useEffect, useState } from "react"
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

interface CartItemsListProps {
  userId: string
  onItemRemoved: () => void
}

export default function CartItemsList({ userId, onItemRemoved }: CartItemsListProps) {
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
      setCartItems(data.cartItems)
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

  const handleRemoveItem = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error("Failed to remove item")

      toast({
        title: "Success",
        description: "Item removed from cart",
      })

      setCartItems(cartItems.filter((item) => item.product_id !== productId))
      onItemRemoved()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div>Loading cart...</div>

  if (cartItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
        <Button asChild>
          <a href="/shop">Continue Shopping</a>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {cartItems.map((item) => (
        <Card key={item.id} className="p-4 flex gap-4">
          <img
            src={item.image_url || "/placeholder.svg"}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-md"
          />
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">Price: ${Number(item.price).toFixed(2)}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Quantity: {item.quantity}</span>
            </div>
          </div>
          <div className="text-right flex flex-col justify-between">
            <p className="text-lg font-bold text-primary">${(Number(item.price) * item.quantity).toFixed(2)}</p>
            <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.product_id)}>
              Remove
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
