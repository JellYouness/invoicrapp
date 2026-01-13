'use client'

import React from "react"
import { Card } from "@/components/ui/card"
import { FileText, Users, TrendingUp, Zap, Shield, Clock, Palette, Globe, BarChart3, CheckCircle, Plus, Edit3, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface AppFeature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  screenshot: React.ReactNode
}

interface FeaturesProps {
  features?: AppFeature[]
}

const Features = ({ features }: FeaturesProps) => {
  const router = useRouter()
  const defaultFeatures: AppFeature[] = [
    {
      id: "invoice-generation",
      title: "Invoice Generation & Customization",
      description: "Create professional invoices step-by-step with our intuitive wizard. Choose themes, add client info, customize fields, and preview before sending.",
      icon: <FileText className="h-6 w-6" />,
      screenshot: (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full text-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Create Invoice</span>
            </div>
            <div className="text-sm text-gray-500">Step 2 of 4</div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-600">Theme</span>
            </div>
            <div className="flex-1 h-0.5 bg-emerald-200 mx-2"></div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Client</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
              <span className="text-xs text-gray-400">Items</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
              <span className="text-xs text-gray-400">Preview</span>
            </div>
          </div>
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Client Name</label>
              <div className="mt-1 h-8 bg-emerald-50 border border-emerald-200 rounded px-3 flex items-center">
                <span className="text-xs sm:text-sm text-emerald-700">Acme Corporation</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 h-8 bg-gray-50 border border-gray-200 rounded px-3 flex items-center">
                  <span className="text-xs sm:text-sm text-gray-600">contact@acme.com</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 h-8 bg-gray-50 border border-gray-200 rounded px-3 flex items-center">
                  <span className="text-xs sm:text-sm text-gray-600">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
            <div className="">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <div className="mt-1 h-16 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                <div className="text-sm text-gray-600">123 Business St</div>
                <div className="text-sm text-gray-600">New York, NY 10001</div>
              </div>
            </div>
          </div>
          
          {/* Mini Invoice Preview */}
          <div className="hidden md:block mt-6 p-3 bg-gray-50 rounded border">
            <div className="text-xs text-gray-500 mb-2">Live Preview</div>
            <div className="bg-white rounded p-2 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <div className="text-xs text-gray-600">#INV-001</div>
              </div>
              <div className="space-y-1">
                <div className="w-16 h-1 bg-emerald-200 rounded"></div>
                <div className="w-12 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "client-management",
      title: "Client Management",
      description: "Organize and manage all your clients in one place. Store contact information, track payment history, and maintain professional relationships.",
      icon: <Users className="h-6 w-6" />,
      screenshot: (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Clients</span>
            </div>
            <button className="flex items-center space-x-1 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm">
              <Plus className="w-3 h-3" />
              <span>Add Client</span>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="h-8 bg-gray-50 border border-gray-200 rounded px-3 flex items-center">
              <span className="text-sm text-gray-500">Search clients...</span>
            </div>
          </div>
          
          {/* Client List */}
          <div className="space-y-3">
            {/* Client 1 - Active */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">Acme Corporation</div>
                  <div className="text-xs sm:text-sm text-gray-600">contact@acme.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Active</span>
                <button className="p-1 hover:bg-emerald-100 rounded">
                  <Edit3 className="w-3 h-3 text-emerald-600" />
                </button>
              </div>
            </div>
            
            {/* Client 2 */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">T</span>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">TechStart Inc</div>
                  <div className="text-xs sm:text-sm text-gray-600">hello@techstart.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit3 className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Client 3 */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">G</span>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">Global Solutions</div>
                  <div className="text-xs sm:text-sm text-gray-600">info@globalsol.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Paid</span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit3 className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="hidden md:grid mt-6 grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">24</div>
              <div className="text-xs text-gray-500">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">18</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">$47.2K</div>
              <div className="text-xs text-gray-500">Total Value</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "analytics",
      title: "Analytics & Insights",
      description: "Get powerful insights into your business performance. Track revenue, monitor payment patterns, and make data-driven decisions.",
      icon: <BarChart3 className="h-6 w-6" />,
      screenshot: (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <select className="text-sm border border-gray-200 rounded px-2 py-1">
                <option>Last 30 days</option>
              </select>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-emerald-700">$47.2K</div>
                  <div className="text-sm text-emerald-600">Total Revenue</div>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-xs text-emerald-600 mt-1">+23% from last month</div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700">156</div>
                  <div className="text-sm text-blue-600">Invoices Sent</div>
                </div>
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-xs text-blue-600 mt-1">+12 this week</div>
            </div>
          </div>
          
          {/* Chart Placeholder */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-3">Revenue Trend</div>
            <div className="h-24 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 relative overflow-hidden">
              {/* Simulated Chart Line */}
              <svg className="w-full h-full" viewBox="0 0 200 60">
                <path
                  d="M10,45 Q50,35 90,25 T170,15"
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                  className="drop-shadow-sm"
                />
                {/* Data Points */}
                <circle cx="10" cy="45" r="2" fill="#10b981" />
                <circle cx="90" cy="25" r="2" fill="#10b981" />
                <circle cx="170" cy="15" r="2" fill="#10b981" />
              </svg>
              <div className="absolute bottom-1 left-3 text-xs text-gray-500">Jan</div>
              <div className="absolute bottom-1 right-3 text-xs text-gray-500">Mar</div>
            </div>
          </div>
          
          {/* Payment Status */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Payment Status</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Paid</span>
                </div>
                <span className="text-sm font-medium text-gray-900">89 (67%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-sm font-medium text-gray-900">34 (26%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Overdue</span>
                </div>
                <span className="text-sm font-medium text-gray-900">9 (7%)</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const featuresData = features || defaultFeatures

  return (
    <section id="features" className="py-16 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-emerald-50/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            ✨ App Features
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">
            See Invoicr in{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Action</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover how our powerful features work together to create the perfect invoicing experience.
          </p>
        </div>

        {/* Feature Showcases */}
        <div className="space-y-16">
          {featuresData.map((feature, index) => (
            <div key={feature.id} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-16`}>
              {/* Content Side */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <div className="text-emerald-600">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 to-transparent"></div>
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center space-x-4 pt-4">
                  <button onClick={() => router.push("/auth")} className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>Try Feature</span>
                  </button>
                  {/* <button className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                    Learn more →
                  </button> */}
                </div>
              </div>
              
              {/* Screenshot Side */}
              <div className="flex-1 max-w-lg rounded-xl border-2 border-emerald-500">
                <div className="relative">
                  {/* Browser Frame */}
                  <div className="bg-gray-100 rounded-t-xl p-3 ">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="flex-1 bg-white rounded ml-4 px-3 py-1">
                        <div className="text-xs text-gray-500">invoicrapp.com/{feature.id}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Screenshot Content */}
                  <div className="bg-gray-50 rounded-b-xl p-1 shadow-2xl">
                    <div className="h-96 overflow-hidden rounded-lg">
                      {feature.screenshot}
                    </div>
                  </div>
                  
                  {/* Floating Badge */}
                  {/* <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    ✨ Live Demo
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
