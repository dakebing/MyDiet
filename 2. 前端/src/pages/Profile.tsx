import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Pencil, Check, User, Shield, ArrowRightLeft, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { weightHistory } from '../data/mockData'

export default function Profile() {
  const { user, updateWeight, unit, setUnit, signOut } = useApp()
  const navigate = useNavigate()
  const [editingWeight, setEditingWeight] = useState(false)
  const [tempWeight, setTempWeight] = useState(user.weight)
  const [privacyGoal, setPrivacyGoal] = useState(true)
  const [privacyRecipe, setPrivacyRecipe] = useState(false)

  const saveWeight = () => {
    updateWeight(tempWeight)
    setEditingWeight(false)
  }

  const convertWeight = (kg: number) => unit === 'metric' ? `${kg} kg` : `${(kg * 2.205).toFixed(1)} lb`
  const convertHeight = (cm: number) => unit === 'metric' ? `${cm} cm` : `${Math.floor(cm / 2.54 / 12)}' ${Math.round(cm / 2.54 % 12)}"`

  const bmiColor = user.bmi < 18.5 ? '#22D3EE' : user.bmi < 25 ? '#4ADE80' : user.bmi < 30 ? '#F97316' : '#EF4444'
  const bmiLabel = user.bmi < 18.5 ? 'Underweight' : user.bmi < 25 ? 'Normal' : user.bmi < 30 ? 'Overweight' : 'Obese'

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-5">
          {/* Bio Card */}
          <div className="glass flex items-center gap-5 rounded-2xl p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4ADE80] to-[#22D3EE]">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-[22px] font-bold text-white">{user.name}</h1>
              <p className="text-[13px] text-white/40">{user.uid}</p>
              <div className="mt-2 flex gap-3">
                <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/50">{user.gender}</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/50">{user.age} years</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/50">{convertHeight(user.height)}</span>
              </div>
            </div>
            {/* Account actions */}
            <div className="flex flex-col gap-2">
              <button onClick={() => { signOut(); navigate('/login', { replace: true }) }}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[12px] text-white/60 transition hover:bg-white/10 hover:text-white">
                <ArrowRightLeft className="h-3.5 w-3.5" /> Change Account
              </button>
              <button onClick={() => { signOut(); navigate('/login', { replace: true }) }}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[12px] text-[#F87171]/60 transition hover:bg-[#F87171]/10 hover:text-[#F87171]">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-white">Health Metrics</h2>
              {/* Unit Toggle */}
              <div className="glass inline-flex rounded-full p-0.5">
                <button onClick={() => setUnit('metric')}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${unit === 'metric' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 'text-white/40'}`}>
                  kg/cm
                </button>
                <button onClick={() => setUnit('imperial')}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${unit === 'imperial' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 'text-white/40'}`}>
                  lb/ft
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {/* Current Weight */}
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-[11px] text-white/40">Current Weight</p>
                <div className="my-1 flex items-center justify-center gap-1">
                  {editingWeight ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={tempWeight} onChange={e => setTempWeight(+e.target.value)}
                        className="w-16 bg-transparent text-center text-[22px] font-bold text-white outline-none"
                        autoFocus onKeyDown={e => e.key === 'Enter' && saveWeight()} />
                      <button onClick={saveWeight} className="text-[#4ADE80]"><Check className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[22px] font-bold text-white">{convertWeight(user.weight)}</span>
                      <button onClick={() => { setEditingWeight(true); setTempWeight(user.weight) }}
                        className="text-white/30 hover:text-white"><Pencil className="h-3 w-3" /></button>
                    </>
                  )}
                </div>
              </div>

              {/* Target Weight */}
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-[11px] text-white/40">Target Weight</p>
                <p className="my-1 text-[22px] font-bold text-[#4ADE80]">{convertWeight(user.targetWeight)}</p>
              </div>

              {/* Days Remaining */}
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-[11px] text-white/40">Days Remaining</p>
                <p className="my-1 text-[22px] font-bold text-[#22D3EE]">{user.daysRemaining}</p>
              </div>

              {/* BMI */}
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-[11px] text-white/40">BMI</p>
                <p className="my-1 text-[22px] font-bold" style={{ color: bmiColor }}>{user.bmi}</p>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: bmiColor + '20', color: bmiColor }}>
                  {bmiLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Body Composition Chart */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-[16px] font-bold text-white">Body Composition History</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tickFormatter={(v: number) => v.toFixed(1)} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                    formatter={(value: number) => value.toFixed(1)} />
                  <Line type="monotone" dataKey="weight" stroke="#4ADE80" strokeWidth={2} dot={false} name="Weight (kg)" />
                  <Line type="monotone" dataKey="bodyFat" stroke="#F97316" strokeWidth={2} dot={false} name="Body Fat (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-4">
              <div className="flex items-center gap-2 text-[12px] text-white/50">
                <div className="h-2 w-4 rounded-full bg-[#4ADE80]" /> Weight
              </div>
              <div className="flex items-center gap-2 text-[12px] text-white/50">
                <div className="h-2 w-4 rounded-full bg-[#F97316]" /> Body Fat %
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[340px] shrink-0 space-y-5">
          {/* Preferences */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-[16px] font-bold text-white">Preferences & Restrictions</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/40">Allergens</p>
                <div className="flex flex-wrap gap-2">
                  {user.allergies.map(a => (
                    <span key={a} className="rounded-full bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400">{a}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/40">Restrictions</p>
                <div className="flex flex-wrap gap-2">
                  {user.restrictions.map(r => (
                    <span key={r} className="rounded-full bg-[#F97316]/10 px-3 py-1.5 text-[12px] font-medium text-[#F97316]">{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/40">Activity Level</p>
                <div className="rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-[14px] font-semibold text-[#22D3EE]">{user.activityLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Summary */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-[16px] font-bold text-white">Social Summary</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Posts', value: user.posts, color: '#4ADE80' },
                { label: 'Total Likes', value: user.totalLikes, color: '#F472B6' },
                { label: 'Saved', value: user.savedRecipes, color: '#FBBF24' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] text-white/40">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Followers & Following */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-[20px] font-bold text-[#22D3EE]">{user.followers}</p>
                <p className="text-[11px] text-white/40">Followers</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-[20px] font-bold text-[#A78BFA]">{user.following}</p>
                <p className="text-[11px] text-white/40">Following</p>
              </div>
            </div>
          </div>

          {/* Privacy & Settings */}
          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-white/60" />
              <h2 className="text-[16px] font-bold text-white">Privacy & Settings</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Show weight loss goal in community', checked: privacyGoal, onChange: () => setPrivacyGoal(v => !v) },
                { label: 'Share today\'s recipe publicly', checked: privacyRecipe, onChange: () => setPrivacyRecipe(v => !v) },
              ].map((toggle) => (
                <div key={toggle.label} className="flex items-center justify-between">
                  <span className="text-[13px] text-white/60">{toggle.label}</span>
                  <button onClick={toggle.onChange}
                    className={`relative h-6 w-11 rounded-full transition-colors ${toggle.checked ? 'bg-[#4ADE80]' : 'bg-white/15'}`}>
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${toggle.checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
