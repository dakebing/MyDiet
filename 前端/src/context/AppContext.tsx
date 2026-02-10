import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { defaultUser, todayMeals, weeklyPlan, communityPosts, trendingPosts, type UserProfile, type DayMeals, type DayPlan, type Post, type Comment } from '../data/mockData'

interface NutritionData {
  calories: { current: number; target: number }
  protein: { current: number; target: number; color: string }
  carbs: { current: number; target: number; color: string }
  fats: { current: number; target: number; color: string }
}

export interface ExtraMeal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

// Per-date storage for nutrition & meals
interface DailyRecord {
  nutrition: NutritionData
  meals: DayMeals
  extraMeals: ExtraMeal[]
}

function getDateKey(date: number): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth()}-${date}`
}

// Empty nutrition (0 consumed) for fresh dates
function makeEmptyNutrition(): NutritionData {
  return {
    calories: { current: 0, target: 2200 },
    protein: { current: 0, target: 130, color: '#4ADE80' },
    carbs: { current: 0, target: 280, color: '#22D3EE' },
    fats: { current: 0, target: 73, color: '#F97316' },
  }
}

function makeFreshMeals(): DayMeals {
  return JSON.parse(JSON.stringify(todayMeals))
}

function makeDefaultRecord(): DailyRecord {
  return {
    nutrition: makeEmptyNutrition(),
    meals: makeFreshMeals(),
    extraMeals: [],
  }
}

interface AppContextType {
  user: UserProfile
  nutrition: NutritionData
  streak: number
  streakCheckedToday: boolean
  meals: DayMeals
  weeklyPlan: DayPlan[]
  planCompleted: boolean
  unit: 'metric' | 'imperial'
  selectedDate: number
  isToday: boolean
  isLoggedIn: boolean
  // Community state
  posts: Post[]
  trendingPostsList: Post[]
  setUser: (u: UserProfile) => void
  updateWeight: (w: number) => void
  toggleMealCheck: (mealType: 'breakfast' | 'lunch' | 'dinner') => void
  incrementStreak: () => void
  completePlan: () => void
  resetPlan: () => void
  setUnit: (u: 'metric' | 'imperial') => void
  setSelectedDate: (d: number) => void
  resetToToday: () => void
  addNutrition: (cal: number, p: number, c: number, f: number) => void
  swapMeal: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void
  selectMealAlternative: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner', altId: string) => void
  // Extra meals from Identifier
  extraMeals: ExtraMeal[]
  addExtraMeals: (meals: ExtraMeal[]) => void
  removeExtraMeal: (mealId: string) => void
  // Community
  addComment: (postId: string, comment: Comment) => void
  deleteComment: (postId: string, commentId: string) => void
  addReplyToComment: (postId: string, commentId: string, reply: Comment) => void
  updatePostComments: (postId: string, comments: Comment[]) => void
  refreshPosts: () => void
  // Auth
  signIn: () => void
  signUp: (name: string, email: string) => void
  signOut: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function loadState<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch { return fallback }
}

function saveState(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>(() => ({ ...defaultUser, ...loadState('mydiet_user', defaultUser) }))
  const [streak, setStreak] = useState(() => loadState('mydiet_streak', 0))
  const [streakCheckedToday, setStreakCheckedToday] = useState(() => loadState('mydiet_streak_today', false))
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('mydiet_logged_in') === 'true')
  const [plan, setPlan] = useState<DayPlan[]>(() => loadState('mydiet_plan', weeklyPlan))
  const [planCompleted, setPlanCompleted] = useState(() => loadState('mydiet_plan_done', false))
  const [unit, setUnitState] = useState<'metric' | 'imperial'>(() => loadState('mydiet_unit', 'metric'))
  const [selectedDate, setSelectedDateState] = useState(new Date().getDate())

  // Per-date records
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>(() =>
    loadState('mydiet_daily', {})
  )

  // Community posts with persistent comments
  const [posts, setPostsState] = useState<Post[]>(() => loadState('mydiet_posts', communityPosts))
  const [trendingPostsList, setTrendingPostsState] = useState<Post[]>(() => loadState('mydiet_tposts', trendingPosts))

  // Get current day's record (create default if not exist)
  const currentKey = getDateKey(selectedDate)
  const currentRecord = dailyRecords[currentKey] || makeDefaultRecord()
  const isToday = selectedDate === new Date().getDate()

  const updateDailyRecord = useCallback((dateKey: string, updater: (prev: DailyRecord) => DailyRecord) => {
    setDailyRecords(prev => {
      const existing = prev[dateKey] || makeDefaultRecord()
      const updated = { ...prev, [dateKey]: updater(existing) }
      saveState('mydiet_daily', updated)
      return updated
    })
  }, [])

  const setUser = useCallback((u: UserProfile) => {
    setUserState(u)
    saveState('mydiet_user', u)
  }, [])

  const updateWeight = useCallback((w: number) => {
    setUserState(prev => {
      const updated = { ...prev, weight: w, bmi: +(w / ((prev.height / 100) ** 2)).toFixed(1) }
      saveState('mydiet_user', updated)
      return updated
    })
  }, [])

  const toggleMealCheck = useCallback((mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const dateKey = getDateKey(selectedDate)
    updateDailyRecord(dateKey, (record) => {
      const meal = record.meals[mealType]
      const wasChecked = meal.checked
      const newMeals = { ...record.meals, [mealType]: { ...meal, checked: !wasChecked } }

      const sign = wasChecked ? -1 : 1
      const newNutrition = {
        ...record.nutrition,
        calories: { ...record.nutrition.calories, current: Math.max(0, record.nutrition.calories.current + sign * meal.calories) },
        protein: { ...record.nutrition.protein, current: Math.max(0, record.nutrition.protein.current + sign * meal.protein) },
        carbs: { ...record.nutrition.carbs, current: Math.max(0, record.nutrition.carbs.current + sign * meal.carbs) },
        fats: { ...record.nutrition.fats, current: Math.max(0, record.nutrition.fats.current + sign * meal.fats) },
      }

      return { ...record, nutrition: newNutrition, meals: newMeals }
    })
  }, [selectedDate, updateDailyRecord])

  const incrementStreak = useCallback(() => {
    if (!streakCheckedToday) {
      setStreak(s => {
        const n = s + 1
        saveState('mydiet_streak', n)
        return n
      })
      setStreakCheckedToday(true)
      saveState('mydiet_streak_today', true)
    }
  }, [streakCheckedToday])

  const completePlan = useCallback(() => {
    setPlanCompleted(true)
    saveState('mydiet_plan_done', true)
  }, [])

  const resetPlan = useCallback(() => {
    setPlanCompleted(false)
    saveState('mydiet_plan_done', false)
  }, [])

  const setUnit = useCallback((u: 'metric' | 'imperial') => {
    setUnitState(u)
    saveState('mydiet_unit', u)
  }, [])

  const setSelectedDate = useCallback((d: number) => {
    setSelectedDateState(d)
  }, [])

  // Bug 2: reset to today when navigating back
  const resetToToday = useCallback(() => {
    setSelectedDateState(new Date().getDate())
  }, [])

  const addNutrition = useCallback((cal: number, p: number, c: number, f: number) => {
    const dateKey = getDateKey(selectedDate)
    updateDailyRecord(dateKey, (record) => ({
      ...record,
      nutrition: {
        ...record.nutrition,
        calories: { ...record.nutrition.calories, current: record.nutrition.calories.current + cal },
        protein: { ...record.nutrition.protein, current: record.nutrition.protein.current + p },
        carbs: { ...record.nutrition.carbs, current: record.nutrition.carbs.current + c },
        fats: { ...record.nutrition.fats, current: record.nutrition.fats.current + f },
      },
    }))
  }, [selectedDate, updateDailyRecord])

  const swapMeal = useCallback((day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setPlan(prev => {
      const updated = prev.map(d => {
        if (d.day.toLowerCase() !== day.toLowerCase()) return d
        const alts = d.alternatives[mealType]
        if (alts.length === 0) return d
        const randomAlt = alts[Math.floor(Math.random() * alts.length)]
        return {
          ...d,
          meals: { ...d.meals, [mealType]: { ...randomAlt, checked: false } },
        }
      })
      saveState('mydiet_plan', updated)
      return updated
    })
  }, [])

  // Bug 1: Select a specific alternative to replace current meal
  const selectMealAlternative = useCallback((day: string, mealType: 'breakfast' | 'lunch' | 'dinner', altId: string) => {
    setPlan(prev => {
      const updated = prev.map(d => {
        if (d.day.toLowerCase() !== day.toLowerCase()) return d
        const alt = d.alternatives[mealType].find(a => a.id === altId)
        if (!alt) return d
        return {
          ...d,
          meals: { ...d.meals, [mealType]: { ...alt, checked: false } },
        }
      })
      saveState('mydiet_plan', updated)
      return updated
    })
  }, [])

  // Add extra meals (from Identifier)
  const addExtraMeals = useCallback((meals: ExtraMeal[]) => {
    const dateKey = getDateKey(new Date().getDate())
    updateDailyRecord(dateKey, (record) => ({
      ...record,
      extraMeals: [...(record.extraMeals || []), ...meals],
    }))
  }, [updateDailyRecord])

  // Remove a single extra meal and subtract its nutrition
  const removeExtraMeal = useCallback((mealId: string) => {
    const dateKey = getDateKey(selectedDate)
    updateDailyRecord(dateKey, (record) => {
      const meal = (record.extraMeals || []).find(m => m.id === mealId)
      if (!meal) return record
      const newExtra = (record.extraMeals || []).filter(m => m.id !== mealId)
      return {
        ...record,
        extraMeals: newExtra,
        nutrition: {
          ...record.nutrition,
          calories: { ...record.nutrition.calories, current: Math.max(0, record.nutrition.calories.current - meal.calories) },
          protein: { ...record.nutrition.protein, current: Math.max(0, record.nutrition.protein.current - meal.protein) },
          carbs: { ...record.nutrition.carbs, current: Math.max(0, record.nutrition.carbs.current - meal.carbs) },
          fats: { ...record.nutrition.fats, current: Math.max(0, record.nutrition.fats.current - meal.fats) },
        },
      }
    })
  }, [selectedDate, updateDailyRecord])

  // Bug 6: prepend new comment so it appears at the top
  const addComment = useCallback((postId: string, comment: Comment) => {
    setPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: [comment, ...p.comments] } : p)
      saveState('mydiet_posts', updated)
      return updated
    })
    setTrendingPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: [comment, ...p.comments] } : p)
      saveState('mydiet_tposts', updated)
      return updated
    })
  }, [])

  // Bug 5: delete own comment
  const deleteCommentRecursive = (comments: Comment[], commentId: string): Comment[] => {
    return comments
      .filter(c => c.id !== commentId)
      .map(c => c.replies ? { ...c, replies: deleteCommentRecursive(c.replies, commentId) } : c)
  }

  const deleteComment = useCallback((postId: string, commentId: string) => {
    setPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: deleteCommentRecursive(p.comments, commentId) } : p)
      saveState('mydiet_posts', updated)
      return updated
    })
    setTrendingPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: deleteCommentRecursive(p.comments, commentId) } : p)
      saveState('mydiet_tposts', updated)
      return updated
    })
  }, [])

  // Bug 6: nested reply — add reply as a child of the target comment
  const addReplyRecursive = (comments: Comment[], targetId: string, reply: Comment): Comment[] => {
    return comments.map(c => {
      if (c.id === targetId) {
        return { ...c, replies: [...(c.replies || []), reply] }
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: addReplyRecursive(c.replies, targetId, reply) }
      }
      return c
    })
  }

  const addReplyToComment = useCallback((postId: string, commentId: string, reply: Comment) => {
    setPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: addReplyRecursive(p.comments, commentId, reply) } : p)
      saveState('mydiet_posts', updated)
      return updated
    })
    setTrendingPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: addReplyRecursive(p.comments, commentId, reply) } : p)
      saveState('mydiet_tposts', updated)
      return updated
    })
  }, [])

  const updatePostComments = useCallback((postId: string, comments: Comment[]) => {
    setPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments } : p)
      saveState('mydiet_posts', updated)
      return updated
    })
    setTrendingPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments } : p)
      saveState('mydiet_tposts', updated)
      return updated
    })
  }, [])

  // Bug 4: Refresh — shuffle posts order
  const refreshPosts = useCallback(() => {
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
    setPostsState(prev => {
      const shuffled = shuffle(prev)
      saveState('mydiet_posts', shuffled)
      return shuffled
    })
    setTrendingPostsState(prev => {
      const shuffled = shuffle(prev)
      saveState('mydiet_tposts', shuffled)
      return shuffled
    })
  }, [])

  // Sign in — set session flag (keeps existing data)
  const signIn = useCallback(() => {
    localStorage.setItem('mydiet_logged_in', 'true')
    setIsLoggedIn(true)
  }, [])

  // Sign up — NEW account: clear all data, reset everything to zero
  const signUp = useCallback((name: string, email: string) => {
    // Clear all persisted data
    localStorage.removeItem('mydiet_daily')
    localStorage.removeItem('mydiet_streak')
    localStorage.removeItem('mydiet_streak_today')
    localStorage.removeItem('mydiet_plan')
    localStorage.removeItem('mydiet_plan_done')
    localStorage.removeItem('mydiet_unit')
    localStorage.removeItem('mydiet_posts')
    localStorage.removeItem('mydiet_tposts')

    // Reset user to a fresh profile with the new name
    const freshUser: UserProfile = {
      ...defaultUser,
      name: name || 'New User',
      uid: `UID-${Date.now()}`,
      age: 0,
      gender: '',
      height: 0,
      weight: 0,
      targetWeight: 0,
      goal: 'lose',
      activityLevel: '',
      allergies: [],
      restrictions: [],
      bmi: 0,
      daysRemaining: 0,
      posts: 0,
      totalLikes: 0,
      savedRecipes: 0,
      followers: 0,
      following: 0,
    }
    saveState('mydiet_user', freshUser)
    setUserState(freshUser)

    // Reset all in-memory state
    setStreak(0)
    saveState('mydiet_streak', 0)
    setStreakCheckedToday(false)
    saveState('mydiet_streak_today', false)
    setDailyRecords({})
    setPlanCompleted(false)
    saveState('mydiet_plan_done', false)
    setPlan(weeklyPlan)
    saveState('mydiet_plan', weeklyPlan)
    setPostsState(communityPosts)
    saveState('mydiet_posts', communityPosts)
    setTrendingPostsState(trendingPosts)
    saveState('mydiet_tposts', trendingPosts)
    setUnitState('metric')
    saveState('mydiet_unit', 'metric')

    // Mark as logged in
    localStorage.setItem('mydiet_logged_in', 'true')
    localStorage.setItem('mydiet_user_email', email)
    setIsLoggedIn(true)
  }, [])

  // Sign out — clear session but keep data in localStorage for sign-back-in
  const signOut = useCallback(() => {
    localStorage.removeItem('mydiet_logged_in')
    setIsLoggedIn(false)
  }, [])

  return (
    <AppContext.Provider value={{
      user, nutrition: currentRecord.nutrition, streak, streakCheckedToday,
      meals: currentRecord.meals, weeklyPlan: plan,
      planCompleted, unit, selectedDate, isToday, isLoggedIn,
      posts, trendingPostsList,
      extraMeals: currentRecord.extraMeals || [],
      setUser, updateWeight, toggleMealCheck, incrementStreak,
      completePlan, resetPlan, setUnit, setSelectedDate, resetToToday,
      addNutrition, swapMeal, selectMealAlternative, addExtraMeals, removeExtraMeal,
      addComment, deleteComment, addReplyToComment, updatePostComments, refreshPosts,
      signIn, signUp, signOut,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
