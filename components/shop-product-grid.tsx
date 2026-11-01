"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image_url: string
  is_purchasable?: boolean
  is_expired?: boolean
  availability_label?: string
}

interface ShopProductGridProps {
  categoryId: string | null
}

export default function ShopProductGrid({ categoryId }: ShopProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [categoryId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = categoryId ? `/api/products?categoryId=${categoryId}` : "/api/products"
      const response = await fetch(url)
      const data = await response.json()
      setProducts(data.products)

      // Initialize quantities
      const initialQuantities: Record<string, number> = {}
      data.products.forEach((product: Product) => {
        initialQuantities[product.id] = 1
      })
      setQuantities(initialQuantities)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      const user = localStorage.getItem("user")
      if (!user) {
        toast({
          title: "Error",
          description: "Please login first",
          variant: "destructive",
        })
        return
      }

      const userData = JSON.parse(user)
      const quantity = quantities[productId] || 1

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          productId,
          quantity,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to add to cart")

      toast({
        title: "Success",
        description: "Product added to cart",
      })

      setQuantities({ ...quantities, [productId]: 1 })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div>Loading products...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="p-4 flex flex-col">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-40 object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-grow">{product.description}</p>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-bold text-primary">${Number(product.price).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock</p>
              <p className="text-lg font-bold">{product.quantity}</p>
            </div>
          </div>

          <div className="flex gap-2 items-center mb-4">
            <Input
              type="number"
              min="1"
              max={product.quantity}
              value={quantities[product.id] || 1}
              onChange={(e) =>
                setQuantities({
                  ...quantities,
                  [product.id]: Math.min(Number.parseInt(e.target.value) || 1, product.quantity),
                })
              }
              className="w-16"
            />
            <Button
              onClick={() => handleAddToCart(product.id)}
              disabled={product.is_purchasable === false || product.quantity === 0}
              className="flex-1"
            >
              {product.is_expired ? "Expired" : product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
