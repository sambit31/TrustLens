import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function ProbabilityChart({ fake, real }) {
  const data = [
    { name: 'Fake', value: fake },
    { name: 'Real', value: real },
  ]

  return (
    <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-center">
      <div className="space-y-5">
        <ProbabilityBar label="Fake Probability" value={fake} color="#EF4444" />
        <ProbabilityBar label="Real Probability" value={real} color="#10B981" />
      </div>

      <div className="relative w-36 h-36 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={44}
              outerRadius={64}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              isAnimationActive
              animationDuration={900}
            >
              <Cell fill="#EF4444" />
              <Cell fill="#10B981" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-lg text-ink">{fake.toFixed(0)}%</span>
          <span className="text-[10px] text-muted">fake signal</span>
        </div>
      </div>
    </div>
  )
}

function ProbabilityBar({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-semibold" style={{ color }}>{value.toFixed(2)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
