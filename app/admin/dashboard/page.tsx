"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import AdminProductList from "@/components/admin-product-list"
import AdminProductForm from "@/components/admin-product-form"

interface User {
  id: string
  userType: "admin" | "user"
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image_url: string
  category_id?: string | number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.userType !== "admin") {
      router.push("/shop")
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleProductAdded = () => {
    setShowForm(false)
    setEditProduct(null)
    setRefreshKey((prev) => prev + 1)
  }

  const handleEditProduct = (product: Product) => {
    setEditProduct(product)
    setShowForm(true)
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Admin Navbar */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">DailyKart Admin</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin Panel</span>
            <Button onClick={handleLogout} variant="ghost" className="text-gray-600 hover:text-red-600">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Product Management</h1>
          <Button onClick={() => setShowForm(!showForm)} size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all">
            {showForm ? "Cancel" : "Add New Product"}
          </Button>
        </div>

        {/* Add/Edit Product Form */}
        {showForm && <AdminProductForm onProductAdded={handleProductAdded} product={editProduct} />}

        {/* Products List */}
        <AdminProductList key={refreshKey} onEditProduct={handleEditProduct} />
      </div>
    </div>
  )
}
