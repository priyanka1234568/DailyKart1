export type AvailabilityStatus = "in_stock" | "low_stock" | "out_of_stock"
export type ExpiryStatus = "none" | "expired" | "expiring_soon" | "not_expired"

export interface InventoryProduct {
  id: number | string
  name: string
  description?: string | null
  price: number
  quantity: number
  category_id: number | string
  category_name?: string | null
  image_url?: string | null
  minimum_stock?: number | null
  expiry_date?: string | Date | null
  availability?: AvailabilityStatus
  availability_label?: string
  expiry_status?: ExpiryStatus
  is_expired?: boolean
  is_expiring_soon?: boolean
  is_purchasable?: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

export function formatDateOnly(value: string | Date | null | undefined): string | null {
  if (!value) return null
  if (typeof value === "string") {
    const datePart = value.slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : null
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const day = String(value.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  return null
}

export function parseDateOnly(value: string | Date | null | undefined): Date | null {
  const formatted = formatDateOnly(value)
  if (!formatted) return null
  const [year, month, day] = formatted.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function getExpiryStatus(expiryDate: string | Date | null | undefined, now = new Date()): ExpiryStatus {
  const expiry = parseDateOnly(expiryDate)
  if (!expiry) return "none"

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (expiry < today) return "expired"

  const daysUntilExpiry = Math.round((expiry.getTime() - today.getTime()) / DAY_MS)
  if (daysUntilExpiry <= 7) return "expiring_soon"
  return "not_expired"
}

export function getAvailabilityStatus(quantity: number, minimumStock: number): AvailabilityStatus {
  const stock = Number(quantity) || 0
  const minStock = Number(minimumStock) || 0
  if (stock <= 0) return "out_of_stock"
  if (stock <= minStock) return "low_stock"
  return "in_stock"
}

export function availabilityLabel(status: AvailabilityStatus): string {
  if (status === "in_stock") return "In Stock"
  if (status === "low_stock") return "Low Stock"
  return "Out of Stock"
}

export function isPurchasable(quantity: number, expiryDate: string | Date | null | undefined): boolean {
  return (Number(quantity) || 0) > 0 && getExpiryStatus(expiryDate) !== "expired"
}

export function enrichProduct<T extends Record<string, any>>(product: T): T & InventoryProduct {
  const quantity = Number(product.quantity) || 0
  const minimumStock = Number(product.minimum_stock ?? 10)
  const expiryDate = formatDateOnly(product.expiry_date)
  const availability = getAvailabilityStatus(quantity, minimumStock)
  const expiryStatus = getExpiryStatus(expiryDate)

  return {
    ...product,
    quantity,
    minimum_stock: minimumStock,
    expiry_date: expiryDate,
    availability,
    availability_label: availabilityLabel(availability),
    expiry_status: expiryStatus,
    is_expired: expiryStatus === "expired",
    is_expiring_soon: expiryStatus === "expiring_soon",
    is_purchasable: isPurchasable(quantity, expiryDate),
  }
}

export function computeInventoryStats(products: Array<{ quantity: number; minimum_stock?: number | null }>) {
  return products.reduce(
    (stats, product) => {
      stats.total += 1
      const status = getAvailabilityStatus(Number(product.quantity) || 0, Number(product.minimum_stock ?? 10))
      if (status === "in_stock") stats.inStock += 1
      else if (status === "low_stock") stats.lowStock += 1
      else stats.outOfStock += 1
      return stats
    },
    { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 },
  )
}
