'use client'

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Crown, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular: boolean
}

interface PricingProps {
  pricingPlans?: PricingPlan[]
}

const Pricing = ({ pricingPlans }: PricingProps) => {
  const router = useRouter();
  const defaultPricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for freelancers getting started",
      features: [
        "Up to 8 invoices per month", 
        "6 beautiful invoice themes", 
        "Client management", 
        "Basic invoice customization",
        "PDF export"
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "$5",
      period: "/month",
      description: "Unlimited for growing businesses",
      features: [
        "Unlimited invoices",
        "All invoice themes",
        "Advanced customization",
        "Invoice analytics",
        "Advanced PDF options"
      ],
      popular: true,
    },
  ]

  const plansData = pricingPlans || defaultPricingPlans

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "Free":
        return <Zap className="h-6 w-6" />
      case "Pro":
        return <Crown className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  return (
    <section data-section="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-emerald-300/40 to-teal-300/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-teal-300/40 to-emerald-300/40 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            💰 Simple Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose the Plan That 
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">Fits Your Needs</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Start free and scale as you grow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plansData.map((plan, index) => (
            <Card
              key={index}
              className={`group relative p-6 bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                plan.popular 
                  ? "ring-2 ring-emerald-500 scale-105" 
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Most Popular
                  </div>
                </div>
              )}

              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              
              <div className="relative z-10">
                {/* Plan header */}
                <div className="text-center mb-6">
                  <div className="mb-2 mx-auto p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl w-fit group-hover:from-emerald-200 group-hover:to-teal-200 transition-all duration-300">
                    <div className="text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                      {getPlanIcon(plan.name)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600 group-hover:text-gray-800 transition-colors text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button 
                onClick={() => router.push("/auth")}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300"
                  }`}
                >
                  {plan.popular ? "Get Started" : "Start Free"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
