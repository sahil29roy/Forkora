import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PathwayFeature } from '@/components/landing/PathwayFeature'
import { CoreFeatures } from '@/components/landing/CoreFeatures'
import { SimulationPreview } from '@/components/landing/SimulationPreview'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/layout/Footer'

export function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* 1. Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Product Value / How It Works */}
        <HowItWorks />

        {/* 4. Pathway Exploration Visual Feature */}
        <PathwayFeature />

        {/* 5. Core Differentiators */}
        <CoreFeatures />

        {/* 6. What-If Simulation Section */}
        <SimulationPreview />

        {/* 7. Final CTA */}
        <FinalCTA />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  )
}
