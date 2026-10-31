"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
}

interface Category {
  id: string
  name: string
}

interface User {
  id: string
  fullName: string
  userType: string
}

export default function ShopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"))
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Shop page mounted")
    const userData = localStorage.getItem("user")
    if (!userData) {
      console.log("[v0] No user data, redirecting to home")
      router.push("/")
      return
    }
    const parsedUser = JSON.parse(userData)
    console.log("[v0] User loaded:", parsedUser.email)
    setUser(parsedUser)
  }, [router])

  useEffect(() => {
    if (user) {
      console.log("[v0] Fetching categories and products")
      fetchCategories()
      fetchProducts()
    }
  }, [user, selectedCategory])

  const fetchCategories = async () => {
    try {
      console.log("[v0] Fetching categories")
      const response = await fetch("/api/categories")
      const data = await response.json()
      console.log("[v0] Categories fetched:", data.categories?.length || 0)
      setCategories(data.categories || [])
    } catch (error) {
      console.error("[v0] Failed to load categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = selectedCategory ? `/api/products?categoryId=${selectedCategory}` : "/api/products"
      console.log("[v0] Fetching products from:", url)
      const response = await fetch(url)
      const data = await response.json()
      console.log("[v0] Products fetched:", data.products?.length || 0)
      setProducts(data.products || [])

      const initialQuantities: Record<string, number> = {}
      data.products?.forEach((product: Product) => {
        initialQuantities[product.id] = 1
      })
      setQuantities(initialQuantities)
    } catch (error) {
      console.error("[v0] Failed to load products:", error)
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
      if (!user) return

      const quantity = quantities[productId] || 1
      console.log("[v0] Adding to cart - Product:", productId, "Quantity:", quantity)

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId,
          quantity,
        }),
      })

      if (!response.ok) throw new Error("Failed to add to cart")

      console.log("[v0] Product added to cart successfully")
      toast({
        title: "Success",
        description: "Product added to cart",
      })

      setQuantities({ ...quantities, [productId]: 1 })
    } catch (error) {
      console.error("[v0] Failed to add to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    console.log("[v0] Logging out")
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
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">DailyKart</div>
            <span className="text-sm text-gray-600">Grocery Store</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">👋 Welcome, {user.fullName}</span>
            <Button variant="outline" onClick={() => router.push("/cart")} className="border-blue-600 text-blue-600 hover:bg-blue-50">
              🛒 My Cart
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-red-600">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">🛒 Shop Fresh Groceries</h1>
          <p className="text-gray-600">Discover our wide range of fresh and organic products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="md:col-span-1">
            <Card className="p-6 h-fit sticky top-24 bg-white/90 backdrop-blur-sm shadow-lg border-2 border-blue-100">
              <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-green-600 rounded"></span>
                📂 Categories
              </h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  className={`w-full justify-start ${selectedCategory === null ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}
                  onClick={() => {
                    setSelectedCategory(null)
                    router.push("/shop")
                  }}
                >
                  🛍️ All Products
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === String(category.id) ? "default" : "outline"}
                    className={`w-full justify-start ${selectedCategory === String(category.id) ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}
                    onClick={() => {
                      setSelectedCategory(String(category.id))
                      router.push(`/shop?category=${category.id}`)
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main - Products */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No products found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="p-5 flex flex-col hover:shadow-xl transition-all hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-2 border-blue-100">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-blue-200"
                    />
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>

                    <div className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">₹{Number(product.price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Stock</p>
                        <p className="text-2xl font-bold text-green-600">{product.quantity}</p>
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
                        className="w-20 text-center border-blue-300 focus:border-blue-500"
                      />
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.quantity === 0}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                      >
                        {product.quantity === 0 ? "❌ Out of Stock" : "🛒 Add to Cart"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
