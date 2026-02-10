import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ChevronRight, Pencil, RotateCcw, X, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

// ==================== Questionnaire (2-1) ====================
function PlanQuestionnaire() {
  const { setUser, user, completePlan } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    goal: 'lose' as string,
    targetWeight: 0,
    age: 0,
    gender: '',
    height: 0,
    weight: 0,
    activity: '',
    allergies: '',
    restrictions: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.age || form.age <= 0) newErrors.age = 'Age is required'
    if (!form.gender) newErrors.gender = 'Gender is required'
    if (!form.height || form.height <= 0) newErrors.height = 'Height is required'
    if (!form.weight || form.weight <= 0) newErrors.weight = 'Weight is required'
    if (!form.activity) newErrors.activity = 'Activity Level is required'
    if (form.goal !== 'maintain' && (!form.targetWeight || form.targetWeight <= 0)) {
      newErrors.targetWeight = 'Target Weight is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const bmi = +(form.weight / ((form.height / 100) ** 2)).toFixed(1)
    setUser({
      ...user,
      goal: form.goal as 'lose' | 'gain' | 'maintain',
      targetWeight: form.targetWeight,
      age: form.age,
      gender: form.gender,
      height: form.height,
      weight: form.weight,
      activityLevel: form.activity,
      allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
      restrictions: form.restrictions.split(',').map(s => s.trim()).filter(Boolean),
      bmi,
    })
    completePlan()
    navigate('/plan')
  }

  const ringClass = (field: string) =>
    errors[field]
      ? 'ring-1 ring-[#F87171]/60 focus:ring-[#F87171]'
      : 'ring-1 ring-white/10 focus:ring-[#4ADE80]/50'

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-[28px] font-bold text-white">Personalize Your Plan</h1>
      <p className="mb-8 text-[14px] text-white/50">Tell us about yourself so we can create the perfect meal plan.</p>

      <form onSubmit={handleSubmit} className="glass space-y-6 rounded-2xl p-8">
        {/* Goal */}
        <div>
          <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Your Goal</label>
          <div className="flex gap-3">
            {(['lose', 'gain', 'maintain'] as const).map((g) => (
              <button key={g} type="button" onClick={() => { setForm(f => ({ ...f, goal: g })); setErrors(e => { const n = { ...e }; delete n.targetWeight; return n }) }}
                className={`flex-1 rounded-xl py-3 text-[14px] font-semibold capitalize transition-all ${
                  form.goal === g ? 'bg-[#4ADE80]/20 text-[#4ADE80] ring-1 ring-[#4ADE80]/40' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}>
                {g === 'lose' ? 'Fat Loss' : g === 'gain' ? 'Gain Weight' : 'Maintain'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {form.goal !== 'maintain' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Target Weight (kg)</label>
              <input type="number" value={form.targetWeight || ''} onChange={e => { setForm(f => ({ ...f, targetWeight: +e.target.value })); setErrors(er => { const n = { ...er }; delete n.targetWeight; return n }) }}
                placeholder="e.g. 65"
                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition ${ringClass('targetWeight')}`} />
              {errors.targetWeight && <p className="mt-1 text-[12px] text-[#F87171]">{errors.targetWeight}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Age</label>
            <input type="number" value={form.age || ''} onChange={e => { setForm(f => ({ ...f, age: +e.target.value })); setErrors(er => { const n = { ...er }; delete n.age; return n }) }}
              placeholder="e.g. 25"
              className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition ${ringClass('age')}`} />
            {errors.age && <p className="mt-1 text-[12px] text-[#F87171]">{errors.age}</p>}
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Height (cm)</label>
            <input type="number" value={form.height || ''} onChange={e => { setForm(f => ({ ...f, height: +e.target.value })); setErrors(er => { const n = { ...er }; delete n.height; return n }) }}
              placeholder="e.g. 175"
              className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition ${ringClass('height')}`} />
            {errors.height && <p className="mt-1 text-[12px] text-[#F87171]">{errors.height}</p>}
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Weight (kg)</label>
            <input type="number" value={form.weight || ''} onChange={e => { setForm(f => ({ ...f, weight: +e.target.value })); setErrors(er => { const n = { ...er }; delete n.weight; return n }) }}
              placeholder="e.g. 70"
              className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition ${ringClass('weight')}`} />
            {errors.weight && <p className="mt-1 text-[12px] text-[#F87171]">{errors.weight}</p>}
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Gender</label>
            <select value={form.gender} onChange={e => { setForm(f => ({ ...f, gender: e.target.value })); setErrors(er => { const n = { ...er }; delete n.gender; return n }) }}
              className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none transition ${ringClass('gender')}`}>
              <option value="" disabled className="bg-[#1a1a2e] text-white/50">Select gender</option>
              <option value="Male" className="bg-[#1a1a2e] text-white">Male</option>
              <option value="Female" className="bg-[#1a1a2e] text-white">Female</option>
              <option value="Other" className="bg-[#1a1a2e] text-white">Other</option>
            </select>
            {errors.gender && <p className="mt-1 text-[12px] text-[#F87171]">{errors.gender}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Activity Level</label>
          <select value={form.activity} onChange={e => { setForm(f => ({ ...f, activity: e.target.value })); setErrors(er => { const n = { ...er }; delete n.activity; return n }) }}
            className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none transition ${ringClass('activity')}`}>
            <option value="" disabled className="bg-[#1a1a2e] text-white/50">Select activity level</option>
            {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map(a => (
              <option key={a} value={a} className="bg-[#1a1a2e] text-white">{a}</option>
            ))}
          </select>
          {errors.activity && <p className="mt-1 text-[12px] text-[#F87171]">{errors.activity}</p>}
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Allergies (comma separated)</label>
          <input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
            placeholder="e.g. Peanuts, Shellfish"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Dietary Restrictions</label>
          <input value={form.restrictions} onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))}
            placeholder="e.g. Vegetarian, Low Sodium"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
        </div>

        <button type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-4 text-[16px] font-bold text-white transition-transform hover:scale-[1.02]">
          Generate My Plan
        </button>
      </form>
    </div>
  )
}

// ==================== Edit Modal Wrapper ====================
function EditModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-2xl bg-[#1a1a2e] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-white">{title}</h3>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

// ==================== Dashboard (2-2) ====================
function PlanDashboard() {
  const { user, setUser, updateWeight, weeklyPlan, swapMeal, resetPlan } = useApp()
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)

  // Bug 4: Edit modal states
  const [editStats, setEditStats] = useState(false)
  const [editGoal, setEditGoal] = useState(false)
  const [editRestrictions, setEditRestrictions] = useState(false)

  // Temp forms for editing
  const [statsForm, setStatsForm] = useState({ height: user.height, weight: user.weight })
  const [goalForm, setGoalForm] = useState({ goal: user.goal as string, targetWeight: user.targetWeight })
  const [restrictionsForm, setRestrictionsForm] = useState({
    allergies: user.allergies.join(', '),
    restrictions: user.restrictions.join(', '),
  })

  const handleSwapDay = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    swapMeal(day, mealType)
    setRefreshKey(k => k + 1)
  }

  const saveStats = () => {
    const bmi = +(statsForm.weight / ((statsForm.height / 100) ** 2)).toFixed(1)
    setUser({ ...user, height: statsForm.height, weight: statsForm.weight, bmi })
    setEditStats(false)
  }

  const saveGoal = () => {
    setUser({ ...user, goal: goalForm.goal as 'lose' | 'gain' | 'maintain', targetWeight: goalForm.targetWeight })
    setEditGoal(false)
  }

  const saveRestrictions = () => {
    setUser({
      ...user,
      allergies: restrictionsForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
      restrictions: restrictionsForm.restrictions.split(',').map(s => s.trim()).filter(Boolean),
    })
    setEditRestrictions(false)
  }

  return (
    <div className="flex gap-6">
      {/* Left Sidebar */}
      <div className="w-[280px] shrink-0 space-y-4">
        {/* User Stats */}
        <div className="glass space-y-4 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-white">My Stats</h3>
            <button onClick={() => { setStatsForm({ height: user.height, weight: user.weight }); setEditStats(true) }}
              className="flex items-center gap-1 rounded-lg bg-[#4ADE80]/10 px-2 py-1 text-[11px] font-medium text-[#4ADE80] transition-all duration-200 hover:scale-110 hover:bg-[#4ADE80]/20 hover:shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <Pencil className="h-3 w-3" /> Update
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Height', value: `${user.height} cm` },
              { label: 'Weight', value: `${user.weight} kg` },
              { label: 'BMI', value: `${user.bmi}`, color: user.bmi < 25 ? '#4ADE80' : '#F97316' },
            ].map((s) => (
              <div key={s.label} className="flex justify-between text-[13px]">
                <span className="text-white/50">{s.label}</span>
                <span className="font-semibold" style={s.color ? { color: s.color } : undefined}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Goal */}
        <div className="glass space-y-3 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-white">Current Goal</h3>
            <button onClick={() => { setGoalForm({ goal: user.goal, targetWeight: user.targetWeight }); setEditGoal(true) }}
              className="flex items-center gap-1 rounded-lg bg-[#4ADE80]/10 px-2 py-1 text-[11px] font-medium text-[#4ADE80] transition-all duration-200 hover:scale-110 hover:bg-[#4ADE80]/20 hover:shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <Pencil className="h-3 w-3" /> Update
            </button>
          </div>
          <div className="rounded-xl bg-[#4ADE80]/10 px-4 py-3 text-center">
            <p className="text-[14px] font-semibold text-[#4ADE80] capitalize">
              {user.goal === 'lose' ? 'Fat Loss' : user.goal === 'gain' ? 'Gain Weight' : 'Maintain'}
            </p>
            {user.goal !== 'maintain' && (
              <p className="text-[12px] text-white/50">Target: {user.targetWeight} kg</p>
            )}
          </div>
        </div>

        {/* Restrictions */}
        <div className="glass space-y-3 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-white">Restrictions</h3>
            <button onClick={() => {
              setRestrictionsForm({ allergies: user.allergies.join(', '), restrictions: user.restrictions.join(', ') })
              setEditRestrictions(true)
            }}
              className="flex items-center gap-1 rounded-lg bg-[#4ADE80]/10 px-2 py-1 text-[11px] font-medium text-[#4ADE80] transition-all duration-200 hover:scale-110 hover:bg-[#4ADE80]/20 hover:shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <Pencil className="h-3 w-3" /> Update
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...user.allergies, ...user.restrictions].length > 0
              ? [...user.allergies, ...user.restrictions].map(tag => (
                <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/60">{tag}</span>
              ))
              : <span className="text-[12px] text-white/30">No restrictions set</span>
            }
          </div>
        </div>

        {/* Refactor */}
        <button onClick={() => resetPlan()}
          className="glass group flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-semibold text-[#F97316] transition-all duration-200 hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_16px_rgba(249,115,22,0.2)]">
          <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" /> Refactor Plan
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 space-y-5">
        <h2 className="text-[20px] font-bold text-white">Weekly Meal Plan</h2>

        <motion.div key={refreshKey} className="space-y-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {weeklyPlan.map((day) => (
            <div key={day.day} className="glass cursor-pointer rounded-2xl p-5 transition-all hover:bg-white/10"
              onClick={() => navigate(`/plan/day/${day.day.toLowerCase()}`)}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-white">{day.day}</h3>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['breakfast', 'lunch', 'dinner'] as const).map((mt) => {
                  const meal = day.meals[mt]
                  return (
                    <div key={mt} className="group relative rounded-xl bg-white/5 p-3">
                      <img src={meal.image} alt={meal.name} className="mb-2 h-24 w-full rounded-lg object-cover" />
                      <p className="truncate text-[12px] font-medium text-white">{meal.name}</p>
                      <p className="text-[11px] text-white/40">{meal.calories} kcal</p>
                      <button onClick={(e) => { e.stopPropagation(); handleSwapDay(day.day, mt) }}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/60 opacity-0 transition group-hover:opacity-100">
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ==================== Edit Modals ==================== */}
      <AnimatePresence>
        {/* Edit Stats Modal */}
        {editStats && (
          <EditModal title="Update Stats" onClose={() => setEditStats(false)}>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Height (cm)</label>
                <input type="number" value={statsForm.height || ''} onChange={e => setStatsForm(f => ({ ...f, height: +e.target.value }))}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
              </div>
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Weight (kg)</label>
                <input type="number" value={statsForm.weight || ''} onChange={e => setStatsForm(f => ({ ...f, weight: +e.target.value }))}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditStats(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-[14px] font-semibold text-white/70 transition hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={saveStats}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-3 text-[14px] font-semibold text-white transition hover:scale-[1.02]">
                  Save
                </button>
              </div>
            </div>
          </EditModal>
        )}

        {/* Edit Goal Modal */}
        {editGoal && (
          <EditModal title="Update Goal" onClose={() => setEditGoal(false)}>
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Goal</label>
                <div className="flex gap-2">
                  {(['lose', 'gain', 'maintain'] as const).map((g) => (
                    <button key={g} type="button" onClick={() => setGoalForm(f => ({ ...f, goal: g }))}
                      className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold capitalize transition-all ${
                        goalForm.goal === g ? 'bg-[#4ADE80]/20 text-[#4ADE80] ring-1 ring-[#4ADE80]/40' : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}>
                      {g === 'lose' ? 'Fat Loss' : g === 'gain' ? 'Gain Weight' : 'Maintain'}
                    </button>
                  ))}
                </div>
              </div>
              {goalForm.goal !== 'maintain' && (
                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Target Weight (kg)</label>
                  <input type="number" value={goalForm.targetWeight || ''} onChange={e => setGoalForm(f => ({ ...f, targetWeight: +e.target.value }))}
                    className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditGoal(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-[14px] font-semibold text-white/70 transition hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={saveGoal}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-3 text-[14px] font-semibold text-white transition hover:scale-[1.02]">
                  Save
                </button>
              </div>
            </div>
          </EditModal>
        )}

        {/* Edit Restrictions Modal */}
        {editRestrictions && (
          <EditModal title="Update Restrictions" onClose={() => setEditRestrictions(false)}>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Allergies (comma separated)</label>
                <input value={restrictionsForm.allergies} onChange={e => setRestrictionsForm(f => ({ ...f, allergies: e.target.value }))}
                  placeholder="e.g. Peanuts, Shellfish"
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
              </div>
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Dietary Restrictions (comma separated)</label>
                <input value={restrictionsForm.restrictions} onChange={e => setRestrictionsForm(f => ({ ...f, restrictions: e.target.value }))}
                  placeholder="e.g. Vegetarian, Low Sodium"
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditRestrictions(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-[14px] font-semibold text-white/70 transition hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={saveRestrictions}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-3 text-[14px] font-semibold text-white transition hover:scale-[1.02]">
                  Save
                </button>
              </div>
            </div>
          </EditModal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== Plan Page (Router) ====================
export default function PlanPage() {
  const { planCompleted } = useApp()
  return planCompleted ? <PlanDashboard /> : <PlanQuestionnaire />
}
