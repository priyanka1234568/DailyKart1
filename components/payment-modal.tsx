"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  amount: number
  onPaymentSuccess: () => void
  userEmail: string
  userName: string
}

export default function PaymentModal({ open, onClose, amount, onPaymentSuccess, userEmail, userName }: PaymentModalProps) {
  const [selectedUPI, setSelectedUPI] = useState<"paytm" | "gpay" | "phonepe" | null>(null)
  const [upiId, setUpiId] = useState("")
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    if (!selectedUPI) {
      toast({
        title: "Error",
        description: "Please select a UPI payment method",
        variant: "destructive",
      })
      return
    }

    if (!upiId.trim()) {
      toast({
        title: "Error",
        description: "Please enter your UPI ID",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    // Simulate payment processing (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500))

    try {
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          upiMethod: selectedUPI,
          upiId,
          userEmail,
          userName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment failed")
      }

      toast({
        title: "Payment Successful!",
        description: data.emailSent
          ? `Payment of ₹${amount.toFixed(2)} confirmed. Email sent to ${data.emailTo}`
          : `Payment of ₹${amount.toFixed(2)} confirmed, but the confirmation email was not sent${data.emailError ? `: ${data.emailError}` : ""}`,
      })

      onPaymentSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Complete Payment</DialogTitle>
          <DialogDescription>
            Pay securely using UPI (This is a demo - no real payment will be processed)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Display */}
          <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">₹{amount.toFixed(2)}</p>
          </div>

          {/* UPI Payment Methods */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Select UPI App</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedUPI("paytm")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedUPI === "paytm"
                    ? "border-green-600 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="text-4xl mb-2">📱</div>
                <div className="font-semibold text-sm">Paytm</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUPI("gpay")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedUPI === "gpay"
                    ? "border-green-600 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="text-4xl mb-2">💳</div>
                <div className="font-semibold text-sm">Google Pay</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUPI("phonepe")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedUPI === "phonepe"
                    ? "border-green-600 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="text-4xl mb-2">📲</div>
                <div className="font-semibold text-sm">PhonePe</div>
              </button>
            </div>
          </div>

          {/* UPI ID Input */}
          <div>
            <label className="block text-sm font-medium mb-2">UPI ID</label>
            <Input
              type="text"
              placeholder="yourname@paytm / yourname@okaxis / yourname@ybl"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="border-green-300 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter any UPI ID (This is a demo)</p>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={processing || !selectedUPI || !upiId.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing Payment...
              </span>
            ) : (
              `Pay ₹${amount.toFixed(2)}`
            )}
          </Button>

          {/* Demo Notice */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              ⚠️ <strong>Demo Mode:</strong> This is a fake payment. No money will be charged.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

