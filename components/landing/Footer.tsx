"use client";

import React from "react";
import { Logo } from "@/components/ui/Logo";
import { FileText } from "lucide-react";
import GitHubStarsBadge from "@/components/ui/GitHubStarsBadge";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const supportLinks = [
    { label: "Help Center", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Status", href: "#" },
  ];

  return (
    <footer className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-t border-emerald-100">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col items-center gap-2">
          {/* Company Info */}
          <div className="flex items-center gap-3 mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-gray-600 mb-4 leading-relaxed max-w-md text-center">
            Professional invoice generation made simple. Create, customize, and
            send beautiful invoices in minutes.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <GitHubStarsBadge />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              All systems operational
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-100 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Invoicr. All rights reserved. Made by{" "}
              <a
                href="https://jellyouness.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                Jellouli Youness
              </a>
            </p>
            {/* <div className="flex items-center gap-6">
              <a
                href="/privacy"
                className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
              >
                Cookie Policy
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
