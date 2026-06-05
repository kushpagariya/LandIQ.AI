# LandIQ AI - Project Context

## Product Vision

LandIQ AI is an AI-powered agricultural land intelligence platform.

The platform helps buyers, investors, banks, NBFCs, and government agencies make safer land purchase decisions through:

* Market Valuation
* Ownership Intelligence
* Legal Risk Assessment
* Fraud Detection
* Geographic Intelligence
* Due Diligence Reporting

The goal is not simply to estimate land prices.

The goal is to reduce uncertainty before a land transaction.

The platform should feel like a combination of:

* Stripe Dashboard
* Palantir Foundry
* ArcGIS Intelligence
* Zerodha Console

The user experience should communicate:

* Trust
* Intelligence
* Transparency
* Risk Awareness
* Professionalism

---

# Problem Statement

Land buyers often struggle to determine:

* Whether a property is fairly priced
* Whether ownership records appear trustworthy
* Whether there are legal or transactional risks
* Whether the surrounding market supports the asking price

LandIQ AI provides an AI-assisted decision support system that generates valuation insights and risk intelligence before a purchase decision is made.

---

# Target Demo Scenario

A user enters property details.

The platform analyzes the property.

The system returns:

* Estimated Market Value
* Price Per Acre
* Price Classification
* Confidence Score
* Ownership Risk
* Legal Risk
* Fraud Indicators
* Geographic Insights
* Supporting Analytics

The final output should feel like an institutional-grade land intelligence report.

---

# Primary Goal

Optimize for:

1. Hackathon Demo Quality
2. Judge Experience
3. Investor Pitch Readiness
4. User Experience
5. Clean Engineering

Do NOT optimize for:

* Enterprise-scale architecture
* Premature optimization
* Microservices
* Unnecessary abstractions
* Overengineering

---

# Current Development Phase

Current Phase:

Frontend MVP

Focus on:

* Pixel-perfect UI
* Navigation
* Responsive layouts
* Mock data integration
* Smooth user experience
* Reusable components

Backend integration is not the priority right now.

Assume all APIs are mocked.

---

# Technology Stack

Frontend

* React
* Vite
* Tailwind CSS
* React Router DOM
* Framer Motion
* Recharts
* Lucide React

Backend

* FastAPI

Database

* PostgreSQL

Future Components

* Neo4j
* OCR Pipeline
* GIS Services
* Valuation Models
* Fraud Detection Models

---

# Repository Structure

```text
LandIQ-AI/

├── frontend/
│
│   ├── public/
│   │
│   ├── src/
│   │
│   │   ├── app/
│   │   ├── routes/
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing/
│   │   │   ├── PropertyAnalysis/
│   │   │   ├── Dashboard/
│   │   │   ├── Analytics/
│   │   │   ├── FraudDetection/
│   │   │   ├── PropertyLocation/
│   │   │   ├── Reports/
│   │   │   └── Settings/
│   │   │
│   │   ├── components/
│   │   │
│   │   │   ├── ui/
│   │   │   ├── cards/
│   │   │   ├── charts/
│   │   │   ├── forms/
│   │   │   ├── navigation/
│   │   │   ├── maps/
│   │   │   ├── reports/
│   │   │   └── loaders/
│   │   │
│   │   ├── layouts/
│   │   │
│   │   ├── hooks/
│   │   │
│   │   ├── services/
│   │   │   ├── api/
│   │   │   └── mock/
│   │   │
│   │   ├── context/
│   │   ├── constants/
│   │   ├── data/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── assets/
│   │   └── styles/
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── frontend/tailwind.config.ts
│
├── backend/
│
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── models/
│   │   ├── database/
│   │   ├── core/
│   │   └── utils/
│   │
│   ├── ml/
│   │   ├── valuation/
│   │   ├── fraud/
│   │   ├── ocr/
│   │   └── datasets/
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── main.py
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── datasets/
│   ├── design/
│   ├── pitch/
│   └── presentations/
│
├── .github/
│   └── workflows/
│
├── README.md
├── docs/context.md
├── .gitignore
└── LICENSE
```

---

# Frontend Architecture Rules

Architecture Flow:

Pages → Features → Components → UI

Keep business logic outside presentation components.

Pages should orchestrate.

Components should render.

Services should fetch data.

Utilities should contain reusable helper logic.

---

# Coding Standards

Always:

* Use functional React components
* Use hooks
* Prefer composition over duplication
* Create reusable UI primitives
* Use TypeScript-friendly patterns
* Keep components maintainable

Avoid:

* Massive page files
* Deep prop drilling
* Inline business logic
* Hardcoded repeated layouts
* Copy-paste components

---

# State Management

Prefer:

* React Context
* Custom Hooks

Do NOT introduce:

* Redux
* Zustand
* MobX

Unless explicitly required later.

---

# Mock First Development

Build everything using realistic mock data.

Every page should function without a backend.

Backend integration must be replaceable later without changing UI logic.

Pages should never directly call fetch().

Always use a service layer.

Example:

services/

* api/propertyApi.ts
* mock/mockPropertyApi.ts

---

# Hackathon Development Priority

Priority Order:

1. Pixel-perfect UI
2. Complete Navigation
3. Mock Data Integration
4. Smooth UX
5. Reusable Components
6. Code Quality
7. Performance Optimization

For the first implementation:

Ship working screens quickly.

Refactor later.

---

# Animation Philosophy

Use Framer Motion sparingly.

Allowed:

* Page transitions
* Dashboard entrance animations
* Loading states
* Hover interactions
* Animated counters

Avoid:

* Decorative motion
* Excessive effects
* Long animation sequences

Animations should communicate state.

---

# Design Philosophy

The UI should feel:

* Premium
* Government-grade
* Financial-grade
* Data-centric
* Modern

Keywords:

Trust

Accuracy

Intelligence

Analytics

Risk Awareness

Avoid:

* Neon themes
* Gaming aesthetics
* Startup clichés
* Excessive gradients
* Cartoon styling

---

# Core Reusable Components

Build these first:

UI

* Button
* Card
* Modal
* Badge
* Input
* Select
* Toggle
* Slider
* Tabs
* Tooltip

Business Components

* Sidebar
* Navbar
* StatCard
* MetricCard
* RiskCard
* PriceCard
* ConfidenceMeter
* ProgressGauge
* AnalyticsChart
* PropertyMap
* UploadZone
* ReportCard

Pages should compose these components.

---

# Mock Data Strategy

Use realistic Indian agricultural land examples.

Include:

* Maharashtra villages
* Talukas
* Land classifications
* Soil types
* Market prices
* Ownership information
* Risk scores

All generated data should feel believable during judging.

---

# Copilot Generation Rules

When generating code:

* Implement only features visible in the provided designs.
* Do not invent authentication systems.
* Do not invent admin dashboards.
* Do not invent role management.
* Do not invent enterprise settings.
* Do not create microservices.
* Do not create unnecessary abstractions.
* Do not add backend code unless explicitly requested.

If information is missing:

Use sensible mock data.

Prioritize visual accuracy.

---

# Success Criteria

The project is successful if a judge can:

1. Open the application.
2. Analyze a property.
3. Receive valuation results.
4. Understand the risks.
5. Explore analytics.
6. View fraud insights.
7. Open location intelligence.
8. Download a report.

Without needing a verbal explanation.

The product should tell its own story.
