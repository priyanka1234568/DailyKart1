"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import AuthModal from "@/components/auth-modal"

export default function HomePage() {
  const [authModal, setAuthModal] = useState<{ open: boolean; type: "login" | "signup" | null }>({
    open: false,
    type: null,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">DailyKart</div>
            <span className="text-sm text-gray-600">Grocery Store</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setAuthModal({ open: true, type: "login" })} className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Login
            </Button>
            <Button onClick={() => setAuthModal({ open: true, type: "signup" })} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
              Sign Up
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = "/admin/login"} className="text-gray-600 hover:text-blue-600">
              Admin
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Bright Vibrant Grocery Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          }}
        ></div>
        
        {/* Very light gradient overlay for brightness */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-green-50/30"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur-sm text-blue-700 rounded-full text-sm font-semibold mb-4 border border-blue-200 shadow-lg">
              Fresh & Organic
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight drop-shadow-md">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent drop-shadow-sm">DailyKart</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 mb-10 max-w-2xl mx-auto drop-shadow-sm font-medium">
            Your one-stop solution for fresh groceries delivered to your doorstep within 1 hour
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setAuthModal({ open: true, type: "signup" })}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              🛒 Start Shopping
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose DailyKart?</h2>
            <p className="text-lg text-gray-600">Discover the benefits of shopping with us</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-all hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-2 border-blue-100">
              <div className="text-6xl mb-4">🥬</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Fresh Produce</h3>
              <p className="text-gray-600">Handpicked fresh fruits, vegetables, and grains delivered daily to ensure quality</p>
            </Card>
            <Card className="p-8 text-center hover:shadow-xl transition-all hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-2 border-green-100">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery to your home within 1 hour of ordering</p>
            </Card>
            <Card className="p-8 text-center hover:shadow-xl transition-all hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-2 border-blue-100">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with regular discounts and special offers for our customers</p>
            </Card>
          </div>
        </div>
      </section>

     

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-green-600">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)',
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Shop?</h2>
          <p className="text-xl mb-10 text-green-50">Create an account or login to start shopping for fresh groceries</p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setAuthModal({ open: true, type: "signup" })}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              ✨ Create Account
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setAuthModal({ open: true, type: "login" })}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg font-semibold"
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        open={authModal.open}
        type={authModal.type}
        onOpenChange={(open) => setAuthModal({ ...authModal, open })}
        onTypeChange={(nextType) => setAuthModal({ open: true, type: nextType })}
      />
    </div>
  )
}
