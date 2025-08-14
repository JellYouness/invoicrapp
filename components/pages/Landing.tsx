'use client'

import React from "react"
import Header from "@/components/landing/Header"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import Pricing from "@/components/landing/Pricing"
import Testimonials from "@/components/landing/Testimonials"
import FinalCTA from "@/components/landing/FinalCTA"
import Footer from "@/components/landing/Footer"

const Landing = () => {
  const companyLogos = [
    { name: "TechCorp", logo: "/abstract-tech-logo.png" },
    { name: "DesignStudio", logo: "/design-agency-logo.png" },
    { name: "StartupInc", logo: "/startup-logo.png" },
    { name: "ConsultingPro", logo: "/consulting-firm-logo.png" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero companyLogos={companyLogos} />
      <Features />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  )
};

export default Landing;