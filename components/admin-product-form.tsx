"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id?: string
  name?: string
  description?: string
  price?: number
  quantity?: number
  image_url?: string
  category_id?: string | number
  minimum_stock?: number
  expiry_date?: string | null
}

interface AdminProductFormProps {
  onProductAdded: () => void
  product?: Product | null
}

export default function AdminProductForm({ onProductAdded, product }: AdminProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
    imageUrl: "",
    minimumStock: "10",
    expiryDate: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        const cats = (data?.categories || []).map((c: any) => ({ id: String(c.id), name: c.name }))
        setCategories(cats)
        if (cats.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id }))
        }
      } catch (e) {
        // ignore silently, UI will still render
      }
    }
    loadCategories()
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        quantity: product.quantity?.toString() || "",
        categoryId: product.category_id?.toString() || "",
        imageUrl: product.image_url || "",
        minimumStock: product.minimum_stock?.toString() || "10",
        expiryDate: product.expiry_date ? String(product.expiry_date).slice(0, 10) : "",
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const isEditing = !!product?.id
      const url = isEditing ? `/api/admin/products/${product.id}` : "/api/admin/products"
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: Number.parseFloat(formData.price),
          quantity: Number.parseInt(formData.quantity || "0"),
          categoryId: Number(formData.categoryId),
          imageUrl: formData.imageUrl || null,
          minimumStock: Number.parseInt(formData.minimumStock || "10"),
          expiryDate: formData.expiryDate || null,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || (isEditing ? "Failed to update product" : "Failed to create product"))
      }

      toast({
        title: "Success",
        description: isEditing ? "Product updated successfully" : "Product added successfully",
      })

      setFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
        categoryId: categories[0]?.id || "",
        imageUrl: "",
        minimumStock: "10",
        expiryDate: "",
      })

      onProductAdded()
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : product?.id
              ? "Failed to update product"
              : "Failed to add product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 mb-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">{product?.id ? "Edit Product" : "Add New Product"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <Input
              type="text"
              placeholder="e.g., Fresh Apples"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (₹)</label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Available Stock</label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Minimum Stock Quantity</label>
            <Input
              type="number"
              min="0"
              placeholder="10"
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Low Stock is shown when available stock is at or below this amount.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expiry Date (optional)</label>
            <Input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty for products that do not expire.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            placeholder="Product description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (product?.id ? "Updating..." : "Adding...") : (product?.id ? "Update Product" : "Add Product")}
        </Button>
      </form>
    </Card>
  )
}
