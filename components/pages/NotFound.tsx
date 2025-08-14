'use client'

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Home } from "lucide-react"

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <FileText className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">InvoiceGen</h1>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-6xl font-bold text-muted-foreground">404</h2>
          <h3 className="text-2xl font-semibold text-foreground">Page Not Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button className="group">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
