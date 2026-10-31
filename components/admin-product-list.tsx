"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image_url: string
  category_id?: string | number
}

interface AdminProductListProps {
  onEditProduct?: (product: Product) => void
}

export default function AdminProductList({ onEditProduct }: AdminProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [currentCategoryId, setCurrentCategoryId] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    // initial load of categories then products
    const init = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/products")
        const data = await res.json()
        const cats = (data?.categories || []).map((c: any) => ({ id: String(c.id), name: c.name }))
        setCategories(cats)
        const defaultCategoryId = cats[0]?.id || ""
        setCurrentCategoryId(defaultCategoryId)
        setProducts(data.products || [])
      } catch (error) {
        toast({ title: "Error", description: "Failed to load products", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const fetchProductsByCategory = async (categoryId: string) => {
    try {
      setLoading(true)
      const url = categoryId ? `/api/products?categoryId=${categoryId}` : "/api/products"
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string | number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      console.log(`Attempting to delete product with id: ${productId}`)
      
      const response = await fetch(`/api/admin/products/${String(productId)}`, { 
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete product")
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: result.archived 
          ? "Product marked as out of stock (has existing orders). Changes will appear in user panel immediately."
          : "Product deleted successfully. Changes will appear in user panel immediately.",
      })

      // Refresh the product list from the database
      const url = currentCategoryId ? `/api/products?categoryId=${currentCategoryId}` : "/api/products"
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error: any) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div>Loading products...</div>

  const filteredProducts = currentCategoryId
    ? products.filter((product) => String(product.category_id) === String(currentCategoryId))
    : products

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue={categories[0]?.id || ""}
        onValueChange={(value) => {
          setCurrentCategoryId(value)
          fetchProductsByCategory(value)
        }}
      >
        <TabsList className="mb-6">
          {categories.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((c) => (
          <TabsContent key={c.id} value={c.id}>
            <h2 className="text-2xl font-bold mb-6">{c.name}</h2>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4 flex flex-col">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-2 flex-grow">{product.description}</p>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-lg font-bold text-primary">₹{Number(product.price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock</p>
                <p className="text-lg font-bold">{product.quantity}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent"
                onClick={() => onEditProduct && onEditProduct(product)}
              >
                Edit
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(product.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
