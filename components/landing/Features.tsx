'use client'

import React from "react"
import { Card } from "@/components/ui/card"
import { FileText, Users, TrendingUp } from "lucide-react"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface FeaturesProps {
  features?: Feature[]
}

const Features = ({ features }: FeaturesProps) => {
  const defaultFeatures = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "User-Friendly Interface",
      description: "Simplify your daily tasks with our intuitive design that gets you from idea to invoice in minutes.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Real-Time Collaboration",
      description: "Work seamlessly with your team and clients with shared workspaces and instant updates.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Data-Driven Insights",
      description: "Make informed decisions with our comprehensive analytics and reporting dashboard.",
    },
  ]

  const featuresData = features || defaultFeatures

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Everything You Need to Scale</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful features designed to streamline your workflow and help you focus on what matters most - growing
            your business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-xl transition-all duration-300 bg-card border-border group hover:border-primary/30 hover:shadow-primary/10"
            >
              <div className="mb-6 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg w-fit group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
