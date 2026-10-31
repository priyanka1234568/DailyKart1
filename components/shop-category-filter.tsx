"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
}

interface ShopCategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
}

export default function ShopCategoryFilter({ selectedCategory, onCategoryChange }: ShopCategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading categories...</div>

  return (
    <Card className="p-4 h-fit sticky top-24">
      <h3 className="font-semibold mb-4">Categories</h3>
      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => onCategoryChange(null)}
        >
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </Card>
  )
}
