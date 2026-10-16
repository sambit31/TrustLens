import { motion } from 'framer-motion'
import { ScanText, Activity, FileCheck, Lightbulb } from 'lucide-react'
import Hero from '../components/Hero.jsx'
import FeatureCard from '../components/FeatureCard.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import StatsSection from '../components/StatsSection.jsx'
import ConfusionMatrix from '../components/ConfusionMatrix.jsx'
import TechStack from '../components/TechStack.jsx'

const features = [
  {
    icon: ScanText,
    title: 'Fake News Detection',
    description: 'Analyze article text using machine-learning based linguistic patterns.',
    gradient: 'bg-gradient-to-br from-primary to-secondary',
  },
  {
    icon: Activity,
    title: 'Confidence Analysis',
    description: 'Understand how strongly the model supports each prediction.',
    gradient: 'bg-gradient-to-br from-secondary to-accent',
  },
  {
    icon: FileCheck,
    title: 'Document Risk Analysis',
    description: 'Analyze uploaded documents for suspicious text and structural signals.',
    gradient: 'bg-gradient-to-br from-accent to-primary',
  },
  {
    icon: Lightbulb,
    title: 'Explainable Results',
    description: 'Understand the signals behind an analysis instead of receiving a black-box result.',
    gradient: 'bg-gradient-to-br from-primary via-secondary to-accent',
  },
]

export default function Home() {
  return (
    <>
      <Hero />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-14"
          >
            <span className="text-sm font-semibold text-primary">Trust signals</span>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
              One lens. Multiple trust signals.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <StatsSection />
      <ConfusionMatrix />
      <TechStack />
    </>
  )
}
