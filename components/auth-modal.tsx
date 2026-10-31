"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface AuthModalProps {
  open: boolean
  type: "login" | "signup" | null
  onOpenChange: (open: boolean) => void
  onTypeChange?: (type: "login" | "signup") => void
}

export default function AuthModal({ open, type, onOpenChange, onTypeChange }: AuthModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [userType, setUserType] = useState<"user" | "admin">("user")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const { toast } = useToast()

  const switchType = (nextType: "login" | "signup", keepError = false) => {
    if (!keepError) setFormError("")
    onTypeChange?.(nextType)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError("")

    try {
      const endpoint = type === "login" ? "/api/auth/login" : "/api/auth/signup"
      const payload = type === "login" ? { email, password } : { email, password, fullName, userType }

      console.log("[v0] Sending auth request to:", endpoint)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("[v0] Auth response:", data)

      if (!response.ok) {
        const message =
          response.status === 409
            ? "This email already has an account. Please login instead."
            : data.error || "Something went wrong"
        setFormError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        if (response.status === 409) {
          switchType("login", true)
        }
        return
      }

      toast({
        title: "Success",
        description: type === "login" ? "Logged in successfully" : "Account created successfully",
      })

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user))
      console.log("[v0] User stored in localStorage, redirecting to dashboard")

      onOpenChange(false)
      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Auth error:", error)
      const message = "An error occurred. Please try again."
      setFormError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open || !type) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-1">DailyKart</div>
            <h2 className="text-2xl font-bold text-gray-900">{type === "login" ? "Login" : "Sign Up"}</h2>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-900 text-xl font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {type === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-2">Account Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="user"
                    checked={userType === "user"}
                    onChange={(e) => setUserType(e.target.value as "user" | "admin")}
                  />
                  <span>Customer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="admin"
                    checked={userType === "admin"}
                    onChange={(e) => setUserType(e.target.value as "user" | "admin")}
                  />
                  <span>Admin</span>
                </label>
              </div>
            </div>
          )}

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{formError}</p>
          )}

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all" disabled={loading}>
            {loading ? "Loading..." : type === "login" ? "Login" : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          {type === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchType(type === "login" ? "signup" : "login")}
            className="text-blue-600 hover:text-green-600 font-semibold hover:underline"
          >
            {type === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </Card>
    </div>
  )
}
