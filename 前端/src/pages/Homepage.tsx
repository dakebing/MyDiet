import { useState, useCallback, useLayoutEffect, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { Check, Flame, Camera, Search, Utensils, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'

// ==================== Calendar Strip ====================
function CalendarStrip() {
  const { selectedDate, setSelectedDate } = useApp()
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 3 + i)
    return { date: d.getDate(), day: d.toLocaleDateString('en', { weekday: 'short' }), isToday: d.getDate() === today.getDate() }
  })

  return (
    <div className="glass flex items-center gap-2 rounded-2xl p-2">
      {days.map((d) => (
        <button key={d.date} onClick={() => setSelectedDate(d.date)}
          className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-3 transition-all ${
            selectedDate === d.date
              ? 'bg-[#4ADE80]/20 text-[#4ADE80] shadow-lg shadow-[#4ADE80]/10'
              : 'text-white/50 hover:bg-white/5'
          }`}>
          <span className="text-[11px] font-medium uppercase">{d.day}</span>
          <span className="text-[18px] font-bold">{d.date}</span>
          {d.isToday && <div className="h-1 w-1 rounded-full bg-[#4ADE80]" />}
        </button>
      ))}
    </div>
  )
}

// ==================== Progress Ring ====================
function ProgressRing() {
  const { nutrition } = useApp()
  const r = 80, circ = 2 * Math.PI * r

  const calPct = nutrition.calories.target > 0 ? nutrition.calories.current / nutrition.calories.target : 0
  const calOverflow = calPct > 1

  // Bug 4: Use a motion value so the ring animates smoothly FROM previous position
  const strokeOffset = useMotionValue(circ)
  const prevPctRef = useRef(0)

  useEffect(() => {
    const clampedPct = Math.min(calPct, 1)
    // Animate from the previous value to the new value (not from 0)
    const from = circ * (1 - prevPctRef.current)
    const to = circ * (1 - clampedPct)
    strokeOffset.set(from)
    animate(strokeOffset, to, { duration: 1.2, ease: 'easeOut' })
    prevPctRef.current = clampedPct
  }, [calPct, circ, strokeOffset])

  // Bug 5: Ring color — red when overflow
  const ringColor = calOverflow ? '#F87171' : '#4ADE80'

  return (
    <div className="glass flex flex-col items-center gap-6 rounded-2xl p-8 lg:flex-row lg:gap-12">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <motion.circle cx="100" cy="100" r={r} fill="none"
            stroke={ringColor} strokeWidth="12"
            strokeLinecap="round" strokeDasharray={circ}
            style={{ strokeDashoffset: strokeOffset }}
            transform="rotate(-90 100 100)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[32px] font-bold ${calOverflow ? 'text-[#F87171]' : 'text-white'}`}>
            {nutrition.calories.current}
          </span>
          <span className="text-[13px] text-white/50">/ {nutrition.calories.target} kcal</span>
        </div>
      </div>

      {/* Linear bars */}
      <div className="flex flex-1 flex-col gap-5 w-full">
        {[
          { label: 'Protein', ...nutrition.protein },
          { label: 'Carbs', ...nutrition.carbs },
          { label: 'Fats', ...nutrition.fats },
        ].map((item) => {
          const pct = item.target > 0 ? item.current / item.target : 0
          const overflow = pct > 1
          const barColor = overflow ? '#F87171' : item.color

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-white/70">{item.label}</span>
                <span className={overflow ? 'font-semibold text-[#F87171]' : 'text-white/50'}>
                  {item.current}g / {item.target}g
                  {overflow && ' ⚠'}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                  animate={{ width: `${Math.min(pct * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== Meal Card ====================
function MealCard({ mealType, label }: { mealType: 'breakfast' | 'lunch' | 'dinner'; label: string }) {
  const { meals, toggleMealCheck, isToday } = useApp()
  const meal = meals[mealType]

  const handleCheck = useCallback(() => {
    if (!isToday) return
    if (!meal.checked) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: ['#4ADE80', '#22D3EE', '#FBBF24'] })
    }
    toggleMealCheck(mealType)
  }, [meal.checked, mealType, toggleMealCheck, isToday])

  return (
    <motion.div className="glass group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/10"
      layout whileHover={{ scale: 1.01 }}>
      <img src={meal.image} alt={meal.name}
        className="h-[72px] w-[72px] rounded-xl object-cover" />
      <div className="flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</p>
        <p className="text-[15px] font-semibold text-white">{meal.name}</p>
        <p className="text-[12px] text-white/50">{meal.calories} kcal</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden gap-2 text-[11px] text-white/40 sm:flex">
          <span>P:{meal.protein}g</span>
          <span>C:{meal.carbs}g</span>
          <span>F:{meal.fats}g</span>
        </div>
        <button onClick={handleCheck}
          disabled={!isToday}
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
            meal.checked
              ? 'border-[#4ADE80] bg-[#4ADE80]/20 text-[#4ADE80]'
              : isToday
                ? 'border-white/20 text-white/30 hover:border-[#4ADE80]/50'
                : 'border-white/10 text-white/15 cursor-not-allowed'
          }`}>
          <Check className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ==================== Streak Badge ====================
function StreakBadge() {
  const { streak, streakCheckedToday, incrementStreak } = useApp()
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    if (!streakCheckedToday) {
      setAnimating(true)
      incrementStreak()
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 }, colors: ['#F97316', '#FBBF24', '#F472B6'] })
      setTimeout(() => setAnimating(false), 600)
    }
  }

  return (
    <button onClick={handleClick}
      className="glass flex items-center gap-2.5 rounded-full px-4 py-2 transition-all hover:bg-white/10">
      <motion.div animate={animating ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6 }}>
        <Flame className={`h-5 w-5 ${streakCheckedToday ? 'fill-[#F97316] text-[#F97316]' : 'text-[#F97316]'}`} />
      </motion.div>
      <span className="text-[13px] font-semibold text-[#F97316]">{streak} Days Streak</span>
    </button>
  )
}

// ==================== Floating Toolbar ====================
function FloatingToolbar() {
  const navigate = useNavigate()
  return (
    <div className="fixed right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3">
      <button onClick={() => navigate('/identifier')}
        className="glass flex h-12 w-12 items-center justify-center rounded-2xl text-white/60 transition-all hover:bg-white/15 hover:text-white">
        <Camera className="h-5 w-5" />
      </button>
      <button onClick={() => navigate('/community')}
        className="glass flex h-12 w-12 items-center justify-center rounded-2xl text-white/60 transition-all hover:bg-white/15 hover:text-white">
        <Search className="h-5 w-5" />
      </button>
    </div>
  )
}

// ==================== Homepage ====================
export default function Homepage() {
  const { user, resetToToday, isToday, selectedDate, extraMeals, removeExtraMeal } = useApp()

  // useLayoutEffect — synchronous before paint, no flash
  useLayoutEffect(() => {
    resetToToday()
  }, [resetToToday])

  const today = new Date().getDate()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Greeting + Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-white">Morning, {user.name}!</h1>
          <p className="text-[14px] text-white/50">Let&apos;s track your nutrition today</p>
        </div>
        <StreakBadge />
      </div>

      {/* Calendar */}
      <CalendarStrip />

      {/* Non-today hint */}
      {!isToday && (
        <div className="rounded-xl bg-[#F97316]/10 px-4 py-2 text-center text-[13px] text-[#F97316]">
          Viewing data for day {selectedDate} — meal check-in is only available today ({today})
        </div>
      )}

      {/* Progress */}
      <ProgressRing />

      {/* Meals */}
      <div className="space-y-3">
        <h2 className="text-[18px] font-bold text-white">{isToday ? "Today's" : `Day ${selectedDate}`} Meals</h2>
        <AnimatePresence>
          <MealCard mealType="breakfast" label="Breakfast" />
          <MealCard mealType="lunch" label="Lunch" />
          <MealCard mealType="dinner" label="Dinner" />
        </AnimatePresence>
      </div>

      {/* Extra Meals — from Identifier */}
      {extraMeals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-[#22D3EE]" />
            <h2 className="text-[18px] font-bold text-white">Extra Meals</h2>
            <span className="ml-1 rounded-full bg-[#22D3EE]/15 px-2 py-0.5 text-[11px] font-semibold text-[#22D3EE]">
              {extraMeals.length}
            </span>
          </div>
          {extraMeals.map((meal) => (
            <motion.div key={meal.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="glass flex items-center gap-4 rounded-2xl p-4">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-gradient-to-br from-[#22D3EE]/20 to-[#4ADE80]/20">
                <Utensils className="h-7 w-7 text-[#22D3EE]" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#22D3EE]/60">Identified Food</p>
                <p className="text-[15px] font-semibold text-white">{meal.name}</p>
                <p className="text-[12px] text-white/50">{meal.calories} kcal</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden gap-2 text-[11px] text-white/40 sm:flex">
                  <span>P:{meal.protein}g</span>
                  <span>C:{meal.carbs}g</span>
                  <span>F:{meal.fats}g</span>
                </div>
                <button onClick={() => removeExtraMeal(meal.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/30 transition hover:border-red-400/50 hover:text-red-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <FloatingToolbar />
    </div>
  )
}
