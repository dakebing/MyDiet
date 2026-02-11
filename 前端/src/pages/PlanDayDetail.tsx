import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Get this week's dates (Mon-Sun)
function getWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function PlanDayDetail() {
  const { day } = useParams<{ day: string }>()
  const navigate = useNavigate()
  const { weeklyPlan, swapMeal, selectMealAlternative } = useApp()

  const dayPlan = weeklyPlan.find(d => d.day.toLowerCase() === day?.toLowerCase())
  if (!dayPlan) return <div className="text-white/50">Day not found</div>

  // Compute the date for this day of the week
  const weekDates = getWeekDates()
  const dayIndex = dayNames.findIndex(d => d.toLowerCase() === day?.toLowerCase())
  const dayDate = dayIndex >= 0 ? weekDates[dayIndex] : null
  const dateLabel = dayDate ? `${dayDate.getMonth() + 1}.${dayDate.getDate()}` : ''

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/plan')}
          className="glass flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[24px] font-bold text-white">
            {dayPlan.day} Detail{' '}
            {dateLabel && <span className="text-[16px] font-normal text-white/40">({dateLabel})</span>}
          </h1>
          <p className="text-[14px] text-white/50">View and customize your meals</p>
        </div>
      </div>

      {/* Meal Cards */}
      {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
        <MealDetailCard key={mealType} dayPlan={dayPlan} mealType={mealType}
          onSwap={() => swapMeal(dayPlan.day, mealType)}
          onSelectAlt={(altId) => selectMealAlternative(dayPlan.day, mealType, altId)} />
      ))}
    </div>
  )
}

function MealDetailCard({ dayPlan, mealType, onSwap, onSelectAlt }: {
  dayPlan: ReturnType<typeof useApp>['weeklyPlan'][0]
  mealType: 'breakfast' | 'lunch' | 'dinner'
  onSwap: () => void
  onSelectAlt: (altId: string) => void
}) {
  const [showAlts, setShowAlts] = useState(false)
  const meal = dayPlan.meals[mealType]
  const alternatives = dayPlan.alternatives[mealType]
  const label = mealType.charAt(0).toUpperCase() + mealType.slice(1)

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {/* Main meal */}
      <div className="flex gap-6 p-6">
        <img src={meal.image} alt={meal.name} className="h-48 w-64 rounded-xl object-cover" />
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
            <h3 className="mb-3 text-[20px] font-bold text-white">{meal.name}</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Calories', value: `${meal.calories}`, unit: 'kcal', color: '#4ADE80' },
                { label: 'Protein', value: `${meal.protein}`, unit: 'g', color: '#4ADE80' },
                { label: 'Carbs', value: `${meal.carbs}`, unit: 'g', color: '#22D3EE' },
                { label: 'Fats', value: `${meal.fats}`, unit: 'g', color: '#F97316' },
              ].map((n) => (
                <div key={n.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-[18px] font-bold" style={{ color: n.color }}>{n.value}</p>
                  <p className="text-[10px] text-white/40">{n.unit}</p>
                  <p className="text-[11px] text-white/50">{n.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <motion.button onClick={onSwap} whileTap={{ rotate: 180 }}
              className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white/70 transition hover:text-white">
              <RefreshCw className="h-4 w-4" /> Swap
            </motion.button>
            <button onClick={() => setShowAlts(!showAlts)}
              className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white/70 transition hover:text-white">
              Alternatives {showAlts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <AnimatePresence>
        {showAlts && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="border-t border-white/5">
            <div className="grid grid-cols-3 gap-4 p-6">
              {alternatives.map((alt) => (
                <div key={alt.id} className="group rounded-xl bg-white/5 p-3 transition hover:bg-white/10">
                  <img src={alt.image} alt={alt.name} className="mb-2 h-28 w-full rounded-lg object-cover" />
                  <p className="truncate text-[13px] font-semibold text-white">{alt.name}</p>
                  <p className="mb-2 text-[11px] text-white/40">{alt.calories} kcal · P:{alt.protein}g · C:{alt.carbs}g · F:{alt.fats}g</p>
                  <button
                    onClick={() => onSelectAlt(alt.id)}
                    className="w-full rounded-lg bg-[#4ADE80]/10 py-1.5 text-[12px] font-semibold text-[#4ADE80] transition hover:bg-[#4ADE80]/20">
                    Select
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
