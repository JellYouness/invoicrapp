import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Zap, Shield, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Professional Templates",
      description: "Choose from beautiful, professionally designed invoice themes that match your brand."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Lightning Fast",
      description: "Generate invoices in seconds with our intuitive step-by-step workflow."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security and automatic backups."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelance Designer",
      content: "This invoice generator saved me hours every week. The templates are beautiful and professional.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Consultant",
      content: "Finally, an invoice tool that doesn't overcomplicate things. Clean, fast, and effective.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">InvoiceGen</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Professional Invoices 
            <span className="text-primary block">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Create stunning, professional invoices in minutes with our intuitive generator. 
            Choose themes, add clients, and get paid faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="group">
                Start Creating Invoices
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Invoice Like a Pro
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your invoicing workflow and help you get paid faster.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow duration-300 bg-card border-border">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Create Invoices in 4 Simple Steps
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Choose Theme", desc: "Select a professional template" },
              { step: "2", title: "Client Info", desc: "Add your client's details" },
              { step: "3", title: "Add Items", desc: "List products or services" },
              { step: "4", title: "Generate", desc: "Download your invoice" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by Professionals
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-card border-border">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Create Professional Invoices?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of professionals who trust InvoiceGen for their billing needs.
          </p>
          <Link to="/auth">
            <Button size="lg" className="group">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">InvoiceGen</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 InvoiceGen. Professional invoicing made simple.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;