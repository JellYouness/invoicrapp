"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { showSuccess, showError } from "@/hooks/use-toast";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Send,
  Search,
  AlertCircle,
} from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}


export const HelpSupport = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Using enhanced toast helpers

  const faqItems: FAQItem[] = [
    {
      id: "1",
      question: "How do I create my first invoice?",
      answer: "To create your first invoice, click on 'Create Invoice' in the sidebar. Follow the 4-step wizard: select a theme, enter client information, add invoice items, and preview your invoice. You can save it as a draft or generate the final invoice.",
      category: "getting-started",
    },
    {
      id: "2",
      question: "Can I customize my invoice themes?",
      answer: "Yes! Invoice Wiz Craft offers 6 professional themes (Professional Blue, Elegant Green, Creative Purple, Vibrant Orange, Modern Teal, and Elegant Rose). You can set a default theme in Settings > Invoice Defaults.",
      category: "invoices",
    },
    {
      id: "3",
      question: "How do I manage my clients?",
      answer: "Go to the 'Clients' section in the sidebar to add, edit, and manage your client information. You can store contact details, addresses, and payment terms for each client to speed up invoice creation.",
      category: "clients",
    },
    {
      id: "4",
      question: "Where can I view my invoice history?",
      answer: "Click on 'Invoice History' in the sidebar to see all your created invoices. You can filter by status (draft, sent, paid, overdue), search by client name or invoice number, and perform actions like editing or updating status.",
      category: "invoices",
    },
    {
      id: "5",
      question: "How do I set up my company information?",
      answer: "Go to Settings > Company to add your business details including company name, logo, contact information, and address. This information will automatically appear on all your invoices.",
      category: "settings",
    },
    {
      id: "6",
      question: "Can I customize invoice numbering?",
      answer: "Yes! In Settings > Numbering, you can set a custom prefix (like 'INV'), choose the number format, and set the starting counter. The system will automatically increment invoice numbers.",
      category: "settings",
    },
    {
      id: "7",
      question: "What payment terms can I set?",
      answer: "You can choose from various payment terms including Net 15, Net 30, Net 60, Due on Receipt, or custom terms. Set default payment terms in Settings > Invoice Defaults.",
      category: "payments",
    },
    {
      id: "8",
      question: "How do I track invoice status?",
      answer: "Invoice statuses include Draft, Sent, Paid, Overdue, and Cancelled. You can update these manually in the Invoice History section. Future updates will include automatic tracking.",
      category: "invoices",
    },
    {
      id: "9",
      question: "Is my data secure?",
      answer: "Yes! We use Supabase for secure data storage with row-level security (RLS) policies. Your data is encrypted and only accessible by you. We follow industry-standard security practices.",
      category: "security",
    },
    {
      id: "10",
      question: "Can I export my invoices?",
      answer: "Currently, you can generate PDF versions of your invoices from the preview screen. We're working on additional export formats and bulk export features.",
      category: "invoices",
    },
  ];


  const filteredFAQs = faqItems.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    showSuccess(
      "Message sent successfully!",
      "We'll get back to you within 24 hours."
    );

    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      priority: "medium",
    });
    setIsSubmitting(false);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with Invoice Wiz Craft and find answers to common questions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            24/7 Support
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Contact
          </TabsTrigger>
        </TabsList>

        {/* FAQ Section */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find quick answers to common questions about Invoice Wiz Craft
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQs.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse our guides section
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Contact Section */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Send us a message and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((prev) => ({ ...prev, message: e.target.value }))
                      }
                      placeholder="Describe your issue or question..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Other Ways to Reach Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@invoicewizcraft.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri, 9 AM - 6 PM EST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">Check our FAQ section first for quick answers</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">Include your account email when contacting support</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">Describe your issue with as much detail as possible</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};
