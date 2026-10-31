import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import ChatbotWrapper from '@/components/chatbot-wrapper'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'DailyKart - Grocery Store',
  description: 'Fresh groceries delivered to your doorstep',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50`}>
        {children}
        <ChatbotWrapper />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
