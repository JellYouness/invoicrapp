'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Award } from "lucide-react"
import { useRouter } from "next/navigation"

interface CompanyLogo {
  name: string
  logo: string
}

interface HeroProps {
  companyLogos?: CompanyLogo[]
}

const Hero = ({ companyLogos = [] }: HeroProps) => {
  const router = useRouter()

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto text-center max-w-5xl">
        <div className="">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary text-sm font-medium mb-8 border border-primary/20">
            <Award className="w-4 h-4 mr-2" />
            Trusted by 50,000+ professionals worldwide
          </span>
        </div>
        <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
          Transform Your
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">Invoicing Workflow</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Streamline your tasks and boost productivity with our all-in-one solution. Create professional invoices in
          minutes, collaborate with your team, and get paid faster than ever.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="group text-lg px-8 py-4 h-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all" 
            onClick={() => router.push("/auth")}
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Company Logos */}
        {companyLogos.length > 0 && (
          <div className="border-t border-border pt-12">
            <p className="text-sm text-muted-foreground mb-8">Trusted by leading companies</p>
            <div className="flex justify-center items-center space-x-12 opacity-60">
              {companyLogos.map((company, index) => (
                <img
                  key={index}
                  src={company.logo || "/placeholder.svg"}
                  alt={company.name}
                  className="h-8 grayscale hover:grayscale-0 transition-all"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero
