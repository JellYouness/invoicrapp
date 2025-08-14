'use client'

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

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
  const defaultPricingPlans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for freelancers and small businesses",
      features: ["Up to 50 invoices/month", "3 custom templates", "Basic analytics", "Email support"],
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for growing businesses and teams",
      features: [
        "Unlimited invoices",
        "Custom branding",
        "Advanced analytics",
        "Team collaboration",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large organizations with complex needs",
      features: [
        "Everything in Professional",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      popular: false,
    },
  ]

  const plansData = pricingPlans || defaultPricingPlans

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-secondary/30 via-primary/5 to-accent/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose the Plan That Fits Your Needs
          </h2>
          <p className="text-xl text-muted-foreground">Scale as you grow with flexible pricing options</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plansData.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 relative ${
                plan.popular 
                  ? "border-primary shadow-xl scale-105 bg-gradient-to-br from-card to-primary/5" 
                  : "border-border bg-card hover:border-primary/20"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                    : "variant-outline border-primary/30 text-primary hover:bg-primary/10"
                }`}
              >
                Start Free Trial
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
