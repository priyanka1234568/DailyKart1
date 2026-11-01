"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  AlertTriangle,
  CalendarClock,
  Eye,
  Package,
  PackageCheck,
  PackageX,
  Pencil,
  Search,
  Trash2,
} from "lucide-react"

interface Product {
  id: string | number
  name: string
  description: string
  price: number
  quantity: number
  image_url: string
  category_id?: string | number
  category_name?: string
  minimum_stock?: number
  expiry_date?: string | null
  availability?: "in_stock" | "low_stock" | "out_of_stock"
  availability_label?: string
  expiry_status?: "none" | "expired" | "expiring_soon" | "not_expired"
  is_expired?: boolean
  is_expiring_soon?: boolean
}

interface AdminProductListProps {
  onEditProduct?: (product: Product) => void
}

const emptyFilters = {
  search: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  availability: "",
  expiry: "",
  stockStatus: "",
}

function AvailabilityBadge({ product }: { product: Product }) {
  const status = product.availability
  const className =
    status === "in_stock"
      ? "border-transparent bg-emerald-100 text-emerald-800"
      : status === "low_stock"
        ? "border-transparent bg-orange-100 text-orange-800"
        : "border-transparent bg-red-100 text-red-800"
  return <Badge className={className}>{product.availability_label || "Out of Stock"}</Badge>
}

export default function AdminProductList({ onEditProduct }: AdminProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [stats, setStats] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(emptyFilters)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [viewTarget, setViewTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/products")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load products")
      setProducts(data.products || [])
      setCategories((data.categories || []).map((c: any) => ({ id: String(c.id), name: c.name })))
      setStats(data.stats || { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load products", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.search && !product.name.toLowerCase().includes(filters.search.trim().toLowerCase())) return false
      if (filters.categoryId && String(product.category_id) !== String(filters.categoryId)) return false
      if (filters.minPrice !== "" && Number(product.price) < Number(filters.minPrice)) return false
      if (filters.maxPrice !== "" && Number(product.price) > Number(filters.maxPrice)) return false
      if (filters.availability && product.availability !== filters.availability) return false
      if (filters.expiry && product.expiry_status !== filters.expiry) return false
      if (filters.stockStatus === "available" && Number(product.quantity) <= 0) return false
      if (filters.stockStatus === "unavailable" && Number(product.quantity) > 0) return false
      return true
    })
  }, [products, filters])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/products/${String(deleteTarget.id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      const errorData = await response.json()
      if (!response.ok) throw new Error(errorData.error || "Failed to delete product")

      toast({
        title: "Success",
        description: errorData.archived
          ? "Product marked as out of stock because it exists in previous orders."
          : "Product deleted successfully.",
      })
      setDeleteTarget(null)
      await loadProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const summaryCards = [
    {
      label: "Total Products",
      value: stats.total,
      icon: Package,
      accent: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "In Stock",
      value: stats.inStock,
      icon: PackageCheck,
      accent: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      accent: "from-orange-500 to-amber-600",
      bg: "bg-orange-50",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      icon: PackageX,
      accent: "from-red-500 to-rose-600",
      bg: "bg-red-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card
            key={card.label}
            className="rounded-2xl border-0 shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              if (card.label === "Total Products") setFilters({ ...emptyFilters })
              if (card.label === "In Stock") setFilters({ ...emptyFilters, availability: "in_stock" })
              if (card.label === "Low Stock") setFilters({ ...emptyFilters, availability: "low_stock" })
              if (card.label === "Out of Stock") setFilters({ ...emptyFilters, availability: "out_of_stock" })
            }}
          >
            <div className={`h-1.5 bg-gradient-to-r ${card.accent}`} />
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                )}
              </div>
              <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Search and Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search by Product Name</label>
            <Input
              placeholder="e.g. Tomato, Rice"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="w-full h-9 px-3 py-1 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              className="w-full h-9 px-3 py-1 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All availability</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Price (₹)</label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Maximum Price (₹)</label>
            <Input
              type="number"
              min="0"
              placeholder="500"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Expiry Date</label>
            <select
              value={filters.expiry}
              onChange={(e) => setFilters({ ...filters, expiry: e.target.value })}
              className="w-full h-9 px-3 py-1 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All expiry statuses</option>
              <option value="expired">Expired</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="not_expired">Not Expired</option>
              <option value="none">No Expiry Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Stock Status</label>
            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
              className="w-full h-9 px-3 py-1 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All stock</option>
              <option value="available">Has stock</option>
              <option value="unavailable">Zero stock</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => setFilters(emptyFilters)}>
            Clear Filters
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl shadow-md overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Product Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available Stock</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Availability Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium whitespace-normal min-w-[140px]">{product.name}</TableCell>
                  <TableCell>{product.category_name || "—"}</TableCell>
                  <TableCell>₹{Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.minimum_stock ?? 10}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{product.expiry_date || "—"}</span>
                      {product.is_expired && (
                        <Badge className="border-transparent bg-red-600 text-white">Expired</Badge>
                      )}
                      {product.is_expiring_soon && (
                        <Badge className="border-transparent bg-amber-100 text-amber-800">
                          <CalendarClock className="h-3 w-3" />
                          Expiring soon
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AvailabilityBadge product={product} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setViewTarget(product)} title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditProduct && onEditProduct(product)}
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(product)}
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewTarget?.name}</DialogTitle>
            <DialogDescription>Product details from inventory</DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <img
                src={viewTarget.image_url || "/placeholder.svg"}
                alt={viewTarget.name}
                className="w-full h-48 object-cover rounded-xl"
              />
              <p className="text-sm text-muted-foreground">{viewTarget.description || "No description provided."}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{viewTarget.category_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">₹{Number(viewTarget.price).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Available Stock</p>
                  <p className="font-medium">{viewTarget.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Minimum Stock</p>
                  <p className="font-medium">{viewTarget.minimum_stock ?? 10}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">{viewTarget.expiry_date || "Not set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Availability</p>
                  <AvailabilityBadge product={viewTarget} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will remove "${deleteTarget.name}" from inventory. If the product exists in previous orders, it will be marked out of stock instead.`
                : "This product will be removed from inventory."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
