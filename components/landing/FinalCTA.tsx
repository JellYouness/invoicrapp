'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"

const FinalCTA = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-t border-primary/20">
      <div className="container mx-auto text-center max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
          Join Thousands of Satisfied Users Today!
        </h2>
        <p className="text-xl text-muted-foreground mb-12">
          Start your free trial and experience the difference professional invoicing can make for your business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="group text-lg px-8 py-4 h-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all">
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">No credit card required • 14-day free trial</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
