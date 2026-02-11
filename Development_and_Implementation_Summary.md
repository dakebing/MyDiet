# Development & Implementation Summary

## 1. System Architecture and Components

MyDiet is a personalised diet-management web application built on a layered architecture with five subsystems: **Presentation**, **State Management**, **Backend Services**, **Data Persistence**, and **AI/ML Services**, each mapping directly to our project aims.

**Presentation Layer** — A React single-page application comprising six feature modules: (i) *Authentication* (landing, login, signup); (ii) *Homepage dashboard* with a date strip, ring-style calorie indicator, per-macro progress bars, today's meal cards derived from the weekly plan, and a streak counter; (iii) *Plan module* with a personalisation questionnaire, seven-day meal-plan dashboard, and a day-detail view supporting one-click meal swapping with macro-matched alternatives; (iv) *Identifier module* for camera/upload-based food recognition, delegating AI inference to the backend and appending confirmed items as extra meals; (v) *Community module* with recommended/trending feeds, tag-based filtering, full-text search, and threaded comments; and (vi) *Profile module* displaying BMI, weight trends (30-day chart), and preference settings. A shared `Layout` shell with a dark glassmorphic theme wraps all authenticated routes.

**State Management** — A centralised `AppContext` (React Context) serves as the single source of truth for user profile, nutrition records, weekly plan, streak, and community data. It exposes typed action functions (`toggleMealCheck`, `swapMeal`, `addExtraMeals`, `togglePostLike`, `addReplyToComment`) that currently persist to `localStorage` but are designed to swap seamlessly to REST API calls, keeping the migration path to production structurally straightforward.

**Backend Services** — A Node.js/Express RESTful API organised into six bounded services: Auth (JWT sessions, bcrypt hashing), User (profile CRUD, body-metric history), Plan (questionnaire intake, plan generation, meal-swap logic), Nutrition (daily records, macro aggregation, streak tracking), Identifier (image upload, AI pipeline orchestration, nutrient mapping), and Community (posts, threaded comments, likes, trending computation). Each exposes versioned endpoints and communicates with the data layer through Prisma ORM.

**Data Persistence** — PostgreSQL stores relational entities (users, weekly plans, meals/alternatives, extra meals, posts, self-referencing comments for nested replies) with ACID transactions and JSONB columns for flexible nutrition snapshots. Prisma ORM manages migrations and generates TypeScript types aligned with front-end interfaces. Redis provides auxiliary caching for session tokens, trending rankings (sorted sets), and rate limiting.

**AI/ML Services** — The food-identification pipeline uses a fine-tuned **YOLOv8** model (trained on Food-101 and ISIA Food-500) served via a Python FastAPI microservice. Detected items are mapped to USDA FoodData Central for detailed nutrient profiles. The meal-plan generator implements a **constraint-satisfaction approach** factoring in Mifflin–St Jeor caloric targets, macro splits, allergy exclusions, and variety rules, with pre-computed alternatives for instant swapping.

---

## 2. Component Interconnections

React Router enforces a public/private route split; authenticated routes render inside a `Layout` wrapper via a nested `<Outlet />`, so navigation chrome is rendered once. The root `AppProvider` makes global state available everywhere via `useApp()`, enforcing **unidirectional data flow**: pages read from context and dispatch actions; the context updates state and triggers targeted re-renders.

Key data paths: the Homepage and Plan modules share the same `weeklyPlan` structure, so checking a meal on the Homepage is instantly reflected in the Plan detail view. The Identifier feeds confirmed foods into the current day's `extraMeals` array, recalculating nutrition totals in real time so the Homepage progress ring updates without additional synchronisation. Community likes and comments update both feed lists in a single transaction. On the backend, the Identifier service orchestrates image upload → AI model inference (running in a separate container for GPU isolation) → USDA nutrient mapping → structured response, allowing the AI model to be updated or scaled independently.

---

## 3. Technologies and Tools

| Layer | Key Technologies |
|-------|-----------------|
| **Front-End** | React 19, TypeScript 5.7, Vite 6, React Router 7, Tailwind CSS 4, Framer Motion, Recharts, Lucide React |
| **Back-End** | Node.js 20 LTS, Express, TypeScript, JWT, bcrypt, multer, sharp |
| **Data** | PostgreSQL 16 (JSONB, full-text search via `tsvector`), Prisma ORM, Redis 7 |
| **AI/ML** | YOLOv8 (Ultralytics), Food-101 / ISIA Food-500 datasets, USDA FoodData Central API, Python FastAPI |
| **DevOps** | Git + GitHub (feature-branch workflow), GitHub Actions CI, Vercel (front-end hosting), Docker, ESLint + Prettier |

---

## 4. Justification of Key Choices

**React + TypeScript** — React's component model maps naturally to our feature modules (meal cards, progress rings, post cards), while TypeScript enforces consistent domain types (`Meal`, `DayPlan`, `Post`) across context, pages, and backend, reducing integration errors during collaborative development.

**Vite** — Native ES-module dev server provides sub-second HMR for rapid UI iteration; Rollup-based production builds deliver automatic code splitting and tree-shaking with minimal configuration.

**Tailwind CSS with glassmorphism** — Utility classes enforce consistent spacing and responsive behaviour without custom stylesheets; the glassmorphic aesthetic (backdrop-blur, dark gradients) creates a modern, premium feel while remaining accessible.

**PostgreSQL over NoSQL** — Our domain is inherently relational (users → plans → days → meals → alternatives; posts → comments → replies). PostgreSQL handles these with foreign keys, ACID transactions, and `tsvector` full-text search, avoiding the need for a separate search service.

**YOLOv8** — State-of-the-art balance of detection accuracy and inference speed for food-domain tasks. Running as a separate FastAPI microservice keeps GPU work isolated and independently scalable from the Node.js API.

**Constraint-satisfaction planning** — More robust and extensible than rule-based templates; enforces caloric targets, macro splits, allergy exclusions, and variety rules, with pre-computed alternatives enabling instant meal swapping.

---

## 5. Development Workflow

We follow a **feature-branch Git workflow**: each feature is developed on a dedicated branch, reviewed via pull request, and merged only after passing CI checks (lint, type-check, build) and peer review.

Development proceeds in phased increments:

| Phase | Scope |
|-------|-------|
| **1–2** (Weeks 1–4) | Routing, auth, layout shell; Homepage dashboard with nutrition tracking and streak |
| **3–4** (Weeks 5–8) | Plan module (questionnaire, weekly plan, meal swapping); Community module (feeds, comments, search, trending) |
| **5** (Weeks 9–10) | Profile, data visualisation, animation polish, persistence edge-cases |
| **6** (Weeks 11–13) | Backend (Node.js + Express + PostgreSQL + Prisma), REST API integration, replace `localStorage` with server persistence |
| **7** (Weeks 14–16) | AI food-identification pipeline (YOLOv8 fine-tuning, FastAPI serving, USDA nutrient mapping) |
| **8** (Weeks 17–18) | Constraint-satisfaction meal-plan generator, accessibility audit, performance optimisation, final testing |

Phases 1–5 (front-end prototype) are substantially complete; Phases 6–8 constitute the remaining work. Testing spans unit tests (Vitest) for context logic, component tests (React Testing Library) for interactive behaviour, API integration tests (Supertest), and end-to-end tests (Playwright) for critical user flows. Each phase ends with a team demo and retrospective.
