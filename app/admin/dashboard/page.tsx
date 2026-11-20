"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Receipt, Search } from "lucide-react"
import AdminProductList from "@/components/admin-product-list"
import AdminProductForm from "@/components/admin-product-form"
import AdminOrders from "@/components/admin-orders"

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
  minimum_stock?: number
  expiry_date?: string | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [showOrders, setShowOrders] = useState(false)

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
            <span className="hidden sm:inline text-sm text-gray-600">Admin Panel</span>
            <Button onClick={handleLogout} variant="ghost" className="text-gray-600 hover:text-red-600">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {showOrders ? "Customer Orders" : "Product Management"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {showOrders
                ? "Review customer details, bills, payment, and delivery status for every order."
                : "Track stock, expiry dates, and product availability from one dashboard."}
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button
                onClick={() => {
                  if (showOrders) {
                    setShowOrders(false)
                    return
                  }
                  setShowForm(!showForm)
                  if (showForm) setEditProduct(null)
                }}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {showForm && !showOrders ? "Cancel" : "Add Product"}
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  setShowOrders(false)
                  setFilterOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="h-4 w-4" />
                Search & Filter
              </Button>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={() => {
                if (showOrders) {
                  setShowOrders(false)
                  return
                }
                setShowForm(false)
                setEditProduct(null)
                setShowOrders(true)
              }}
              className={`w-full sm:w-auto shadow-lg hover:shadow-xl transition-all ${
                showOrders
                  ? "bg-slate-900 hover:bg-slate-800 text-white ring-2 ring-blue-200"
                  : "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              }`}
            >
              <Receipt className="h-4 w-4" />
              Customer Orders
            </Button>
          </div>
        </div>

        {showOrders ? (
          <AdminOrders />
        ) : (
          <>
            {showForm && <AdminProductForm onProductAdded={handleProductAdded} product={editProduct} />}
            <AdminProductList
              key={refreshKey}
              onEditProduct={handleEditProduct}
              filterOpen={filterOpen}
              onFilterOpenChange={setFilterOpen}
            />
          </>
        )}
      </div>
    </div>
  )
}
