'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

const Header = () => {
  const router = useRouter()

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">InvoiceGen</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="font-medium" onClick={() => router.push("/auth")}>
            Sign In
          </Button>
          <Button className="font-medium" onClick={() => router.push("/auth")}>
            Get Started for Free
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
