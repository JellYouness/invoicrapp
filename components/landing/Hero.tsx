"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Award,
  LayoutDashboard,
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  Circle,
  Palette,
  User,
  Receipt,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "../ui/Logo";

interface CompanyLogo {
  name: string;
  logo: string;
}

interface HeroProps {
  companyLogos?: CompanyLogo[];
}

const Hero = ({ companyLogos = [] }: HeroProps) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState("theme");
  const [passedSteps, setPassedSteps] = useState(["theme"]);

  const steps = ["theme", "client", "items", "preview"];

  // iterate currentStep value from steps array each 2s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const index = steps.indexOf(prev);
        return steps[(index + 1) % steps.length];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentStep === "theme") {
      setPassedSteps(["theme"]);
    } else {
      setPassedSteps((prev) =>
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );
    }
  }, [currentStep]);

  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 py-16 lg:py-0 overflow-hidden bg-transparent">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Trust badge */}
            {/* <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20 backdrop-blur-sm">
                <Award className="w-4 h-4 mr-2" />
                Trusted by 50,000+ professionals worldwide
              </span>
            </div> */}

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-white">
              Better invoices
              <br />
              <span className="bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">
                faster than ever
              </span>
              {/* <br />
              don't lose time */}
            </h1>

            {/* Description */}
            <p className="text-xl lg:text-lg xl:text-xl text-emerald-100 mb-8 lg:max-w-lg leading-relaxed">
              Streamline your billing process with our intuitive invoice generator.
              Create professional invoices in minutes, manage clients effortlessly,
              and get paid faster with less hassle.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 items-center justify-center lg:justify-start">
              {loading ? (
                <div className="flex items-center justify-center space-x-2 w-40">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : user ? (
                <Button
                  size="lg"
                  className="group text-lg px-8 py-4 h-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 border-0 font-semibold"
                  onClick={() => router.push("/dashboard")}
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="group text-lg px-8 py-4 h-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 border-0 font-semibold"
                    onClick={() => router.push("/auth")}
                  >
                    Start for free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </>
              )}
            </div>

            {/* Trust indicators */}
            {/* <div className="text-emerald-200 text-sm">
              Trusted by 3,700 enterprise brands and 1.3+ million websites and
              apps
            </div> */}

            {/* Company Logos */}
            {/* {companyLogos.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="flex flex-wrap items-center gap-6 opacity-60">
                  {companyLogos.slice(0, 3).map((company, index) => (
                    <img
                      key={index}
                      src={company.logo || "/placeholder.svg"}
                      alt={company.name}
                      className="h-8 brightness-0 invert opacity-70 hover:opacity-100 transition-all"
                    />
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative lg:block block">
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="max-w-[550px] mx-auto bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 hover:[.hero-card:rotate-6] transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Logo size="sm" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Left Side - Steps */}
                  <div className="flex-1 w-full space-y-3">
                    {/* Step 1 */}
                    <div
                      className={`flex items-center space-x-3 ${
                        passedSteps.includes("theme") ? "" : "opacity-50"
                      }`}
                    >
                      {currentStep === "theme" ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      ) : passedSteps.includes("theme") ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                      <div className="flex-1 text-sm">
                        <div
                          className={
                            currentStep === "theme"
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-900"
                          }
                        >
                          Choose Theme
                        </div>
                        <div
                          className={`text-xs ${
                            currentStep === "theme"
                              ? "text-emerald-500"
                              : "text-gray-500"
                          }`}
                        >
                          Professional Blue selected
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`flex items-center space-x-3 ${
                        passedSteps.includes("client") ? "" : "opacity-50"
                      }`}
                    >
                      {currentStep === "client" ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      ) : passedSteps.includes("client") ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                      <div className="flex-1 text-sm">
                        <div
                          className={
                            currentStep === "client"
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-900"
                          }
                        >
                          Client Information
                        </div>
                        <div
                          className={`text-xs ${
                            currentStep === "client"
                              ? "text-emerald-500"
                              : "text-gray-500"
                          }`}
                        >
                          Acme Corp added
                        </div>
                      </div>
                    </div>

                    {/* Step 3 - Current */}
                    <div
                      className={`flex items-center space-x-3 ${
                        passedSteps.includes("items") ? "" : "opacity-50"
                      }`}
                    >
                      {currentStep === "items" ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      ) : passedSteps.includes("items") ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                      <div className="flex-1 text-sm">
                        <div
                          className={
                            currentStep === "items"
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-900"
                          }
                        >
                          Invoice Items
                        </div>
                        <div
                          className={`text-xs ${
                            currentStep === "items"
                              ? "text-emerald-500"
                              : "text-gray-500"
                          }`}
                        >
                          Adding services...
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div
                      className={`flex items-center space-x-3 ${
                        passedSteps.includes("preview") ? "" : "opacity-50"
                      }`}
                    >
                      {currentStep === "preview" ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      ) : passedSteps.includes("preview") ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                      <div className="flex-1 text-sm">
                        <div
                          className={
                            currentStep === "preview"
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-900"
                          }
                        >
                          Preview & Send
                        </div>
                        <div
                          className={`text-xs ${
                            currentStep === "preview"
                              ? "text-emerald-500"
                              : "text-gray-500"
                          }`}
                        >
                          Pending
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600 mb-2">
                        Step {passedSteps.length} of 4
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full"
                          style={{
                            width: (passedSteps.length / 4) * 100 + "%",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Paper-sized Invoice */}
                  <div
                    className={`relative w-36 h-52 bg-white border rounded shadow-sm p-1.5 space-y-4 flex-shrink-0 ${
                      currentStep === "preview"
                        ? "border border-emerald-500"
                        : "border-gray-300"
                    }`}
                  >
                    {/* Header */}
                    <div
                      className={`flex justify-between items-start rounded-sm p-1 ${
                        currentStep === "theme"
                          ? "border border-emerald-500"
                          : ""
                      }`}
                    >
                      <div className="w-5 h-5 bg-emerald-500 rounded-md"></div>
                      <div className="w-8 h-3 bg-emerald-200 rounded animate-pulse"></div>
                    </div>

                    {/* Client info */}
                    <div
                      className={`space-y-0.5 p-1 rounded-sm ${
                        currentStep === "client"
                          ? "border border-emerald-500"
                          : ""
                      }`}
                    >
                      <div className="w-12 h-1.5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-8 h-1.5 bg-gray-100 rounded animate-pulse"></div>
                      <div className="w-12 h-1 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    {/* Items table */}
                    <div
                      className={`border rounded p-1 space-y-2 ${
                        currentStep === "items"
                          ? "border border-emerald-500"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="w-4 h-0.5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-2 h-0.5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-3 h-0.5 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-5 h-0.5 bg-gray-100 rounded animate-pulse"></div>
                        <div className="w-1 h-0.5 bg-gray-100 rounded animate-pulse"></div>
                        <div className="w-3 h-0.5 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-4 h-0.5 bg-gray-100 rounded animate-pulse"></div>
                        <div className="w-1.5 h-0.5 bg-gray-100 rounded animate-pulse"></div>
                        <div className="w-3 h-0.5 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-1 space-y-1 mb-4">
                      <div className="flex justify-between">
                        <div className="w-10 h-1 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-5 h-1 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-8 h-1 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-3 h-1 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-0.5">
                        <div className="w-2.5 h-1 bg-emerald-200 rounded animate-pulse"></div>
                        <div className="w-5 h-1 bg-emerald-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    {currentStep === "preview" && (
                      <div className="absolute -bottom-2 left-5 right-5 h-5 bg-emerald-500 rounded-md text-white flex justify-center items-center gap-1">
                        <CheckCircle className="w-3 h-3 font-bold" />
                        <span className="text-xs font-semibold">Done</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Floating cards */}
                <div className="hero-card absolute -top-14 -right-4 bg-white rounded-xl shadow-lg p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">Clients</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">1,247</div>
                  <div className="text-xs text-green-600">+23% growth</div>
                </div>

                <div className="hero-card absolute -bottom-6 -left-7 md:-left-20 bg-white rounded-xl shadow-lg p-4 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">Revenue</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">$47.2K</div>
                  <div className="text-xs text-emerald-600">This month</div>
                </div>
              </div>

              {/* Floating cards */}
              {/* <div className="absolute -top-14 -right-4 bg-white rounded-xl shadow-lg p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Clients</span>
                </div>
                <div className="text-xl font-bold text-gray-900">1,247</div>
                <div className="text-xs text-green-600">+23% growth</div>
              </div>

              <div className="absolute -bottom-6 -left-14 bg-white rounded-xl shadow-lg p-4 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                <div className="text-xl font-bold text-gray-900">$47.2K</div>
                <div className="text-xs text-emerald-600">This month</div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
