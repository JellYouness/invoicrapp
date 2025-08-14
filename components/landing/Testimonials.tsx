'use client'

import React from "react"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

interface TestimonialsProps {
  testimonials?: Testimonial[]
}

const Testimonials = ({ testimonials }: TestimonialsProps) => {
  const defaultTestimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelance Designer",
      content:
        "InvoiceGen transformed my workflow completely. I've saved 10+ hours per week and my clients love the professional look.",
      rating: 5,
      avatar: "/professional-woman-diverse.png",
    },
    {
      name: "Mike Chen",
      role: "Agency Owner",
      content:
        "The real-time collaboration features are game-changing. Our team can work together seamlessly on client projects.",
      rating: 5,
      avatar: "/professional-man.png",
    },
    {
      name: "Emily Rodriguez",
      role: "Consultant",
      content:
        "The analytics insights helped me optimize my pricing strategy. Revenue increased by 40% in just 3 months.",
      rating: 5,
      avatar: "/professional-woman-consultant.png",
    },
  ]

  const testimonialsData = testimonials || defaultTestimonials

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Loved by Professionals Worldwide</h2>
          <p className="text-xl text-muted-foreground">See what our customers have to say about their experience</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <Card 
              key={index} 
              className="p-8 bg-card border-border hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-accent fill-current" />
                ))}
              </div>
              <p className="text-foreground mb-6 italic leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
