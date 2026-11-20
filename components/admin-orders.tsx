"use client"

import { useEffect, useState } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  IndianRupee,
  Package,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react"

interface OrderSummary {
  id: number | string
  customerName: string
  email: string
  phone: string | null
  deliveryAddress: string | null
  orderDate: string
  expectedDelivery: string | null
  status: string
  paymentMethod: string
  paymentMethodLabel: string
  paymentStatus: string
  totalBill: number
}

interface OrderItem {
  id: number | string
  name: string
  quantity: number
  price: number
  lineTotal: number
  imageUrl?: string | null
}

interface OrderDetail extends OrderSummary {
  addressLine: string | null
  city: string | null
  zipCode: string | null
  itemsSubtotal: number
  items: OrderItem[]
}

interface OrderStats {
  totalOrders: number
  revenue: number
  pending: number
  delivered: number
}

const selectClassName =
  "w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

const statusStyles: Record<string, string> = {
  pending: "border-transparent bg-amber-100 text-amber-800",
  processing: "border-transparent bg-blue-100 text-blue-800",
  shipped: "border-transparent bg-indigo-100 text-indigo-800",
  delivered: "border-transparent bg-emerald-100 text-emerald-800",
  cancelled: "border-transparent bg-red-100 text-red-800",
}

function titleCase(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

function formatMoney(value: number) {
  return `₹${Number(value || 0).toFixed(2)}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatusBadge({ status }: { status: string }) {
  return <Badge className={statusStyles[status] || "border-transparent bg-slate-100 text-slate-800"}>{titleCase(status)}</Badge>
}

function PaymentBadge({ status }: { status: string }) {
  const paid = status === "paid"
  return (
    <Badge className={paid ? "border-transparent bg-emerald-100 text-emerald-800" : "border-transparent bg-amber-100 text-amber-800"}>
      {paid ? "Paid" : "Pending"}
    </Badge>
  )
}

export default function AdminOrders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [stats, setStats] = useState<OrderStats>({ totalOrders: 0, revenue: 0, pending: 0, delivered: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("all")
  const [orderStatus, setOrderStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 8
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<OrderDetail | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, paymentStatus, orderStatus])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          search: debouncedSearch,
          paymentStatus,
          orderStatus,
          page: String(page),
          pageSize: String(pageSize),
        })
        const res = await fetch(`/api/admin/orders?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load orders")
        if (cancelled) return
        setOrders(data.orders || [])
        setTotal(Number(data.total) || 0)
        setStats(data.stats || { totalOrders: 0, revenue: 0, pending: 0, delivered: 0 })
      } catch (error: any) {
        if (cancelled) return
        toast({
          title: "Error",
          description: error.message || "Failed to load customer orders",
          variant: "destructive",
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, paymentStatus, orderStatus, page])

  const openDetails = async (orderId: number | string) => {
    setDetailOpen(true)
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load order")
      setDetail(data.order)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load order details",
        variant: "destructive",
      })
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const summaryCards = [
    {
      label: "Total Orders",
      value: String(stats.totalOrders),
      icon: ShoppingBag,
      accent: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Revenue",
      value: formatMoney(stats.revenue),
      icon: IndianRupee,
      accent: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Orders",
      value: String(stats.pending),
      icon: Clock,
      accent: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
    },
    {
      label: "Delivered Orders",
      value: String(stats.delivered),
      icon: CheckCircle2,
      accent: "from-teal-500 to-emerald-600",
      bg: "bg-teal-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="rounded-2xl border-0 shadow-md overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${card.accent}`} />
            <div className="p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                {loading && orders.length === 0 ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold mt-1 truncate">{card.value}</p>
                )}
                {card.label === "Total Revenue" && (
                  <p className="text-xs text-muted-foreground mt-1">Excludes cancelled orders</p>
                )}
              </div>
              <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                <card.icon className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-0 shadow-md p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-2">Search orders</label>
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, or order ID"
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment Status</label>
            <select className={selectClassName} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="all">All payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Order Status</label>
            <select className={selectClassName} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No customer orders found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Orders placed at checkout will appear here with the customer and payment details.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Bill</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-semibold whitespace-nowrap">#{order.id}</TableCell>
                    <TableCell className="font-medium min-w-[140px]">{order.customerName}</TableCell>
                    <TableCell className="min-w-[180px]">{order.email || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.phone || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{formatMoney(order.totalBill)}</TableCell>
                    <TableCell className="min-w-[150px]">{order.paymentMethodLabel}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openDetails(order.id)}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t bg-slate-50/70">
          <p className="text-sm text-muted-foreground">
            Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground min-w-[88px] text-center">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-white sm:max-w-2xl max-h-[min(90vh,860px)] overflow-y-auto rounded-2xl border border-slate-200 p-0 shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-2 pr-12">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Truck className="h-5 w-5 text-blue-600" />
              Order #{detail?.id || ""}
            </DialogTitle>
            <DialogDescription>Customer, delivery, product, and payment summary for this order.</DialogDescription>
          </DialogHeader>

          {detailLoading || !detail ? (
            <div className="px-6 pb-6 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="px-6 pb-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={detail.status} />
                <PaymentBadge status={detail.paymentStatus} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Customer</p>
                  <p className="font-semibold">{detail.customerName}</p>
                  <p className="text-sm text-gray-600 mt-1 break-all">{detail.email || "Email not available"}</p>
                  <p className="text-sm text-gray-600 mt-1">{detail.phone || "Phone not recorded at checkout"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Delivery</p>
                  <p className="text-sm text-gray-700">
                    {detail.deliveryAddress || "Address not recorded at checkout"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Ordered: {formatDate(detail.orderDate)}</p>
                  <p className="text-sm text-gray-600 mt-1">Expected: {formatDate(detail.expectedDelivery)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 text-sm font-semibold">Ordered products</div>
                <div className="divide-y">
                  {detail.items.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No products were stored for this order.</p>
                  ) : (
                    detail.items.map((item) => (
                      <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty {item.quantity} × {formatMoney(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold whitespace-nowrap">{formatMoney(item.lineTotal)}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-green-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p className="font-medium">{detail.paymentMethodLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total bill</p>
                    <p className="text-xl font-bold text-green-700">{formatMoney(detail.totalBill)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
