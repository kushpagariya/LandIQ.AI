# LandIQ AI - Project Context

## Product Vision

LandIQ AI is an AI-powered agricultural land intelligence platform.

The goal is not simply to estimate land prices.

The goal is to help buyers, investors, banks, NBFCs, and government agencies make safer land purchase decisions by combining:

* Market valuation
* Ownership intelligence
* Legal risk indicators
* Fraud detection
* Geographic intelligence
* Professional due diligence reporting

The platform should feel like a combination of:

* Stripe Dashboard
* Palantir Foundry
* ArcGIS Intelligence
* Zerodha Console

The experience should communicate trust, intelligence, and professionalism.

---

# Target Demo Scenario

A user enters land details.

The platform analyzes the property.

The system returns:

* Estimated Market Value
* Price Classification
* Confidence Score
* Ownership Risk
* Legal Risk
* Fraud Indicators
* Supporting Analytics

The result should feel like an institutional-grade land intelligence report.

---

# Primary Design Goal

Optimize for:

1. Hackathon Demo Quality
2. Judge Experience
3. Investor Pitch Readiness
4. Clean Engineering Architecture

Do NOT optimize for:

* Enterprise complexity
* Premature microservices
* Overengineering

---

# Frontend Architecture Rules

Use:

* React
* Vite
* Tailwind CSS
* React Router
* Framer Motion
* Recharts

Architecture:

Pages → Features → Components → UI

Business logic should remain outside presentation components.

Keep components focused and reusable.

Avoid monolithic files.

---

# Coding Standards

Always:

* Use functional components
* Use hooks
* Use composition over duplication
* Create reusable components
* Use TypeScript-friendly patterns
* Keep code maintainable

Avoid:

* Deep prop drilling
* Massive page components
* Hardcoded repeated layouts
* Inline business logic

---

# Folder Structure

src/

app/
routes/

pages/
Landing/
PropertyAnalysis/
Dashboard/
Analytics/
FraudDetection/
Reports/
Settings/

components/

ui/
cards/
charts/
forms/
navigation/
maps/
reports/

layouts/

hooks/

services/

api/
mock/

data/

utils/

types/

assets/

---

# State Management

Prefer:

* React Context
* Custom Hooks

Do not introduce Redux unless absolutely necessary.

---

# Mock First Development

Build the frontend assuming backend APIs are unavailable.

Every page should work with realistic mock data.

Backend integration should be a drop-in replacement later.

---

# Hackathon Development Priority

Priority Order:

1. Pixel-perfect UI
2. Complete navigation
3. Mock data integration
4. Smooth user experience
5. Reusable components
6. Code quality
7. Performance optimization

For the initial implementation, prioritize shipping working screens over perfect abstraction.

Refactoring can happen after all screens are implemented.

---

# Animation Philosophy

Use Framer Motion sparingly.

Animations should communicate state.

Examples:

* Page transitions
* Dashboard load
* Counter animations
* Hover states
* Loading indicators

Avoid decorative animations.

---

# Design Philosophy

The UI should feel:

* Premium
* Government-grade
* Financial-grade
* Data-heavy
* Modern

Keywords:

Trust
Accuracy
Intelligence
Risk Awareness
Analytics

Avoid:

* Startup clichés
* Neon themes
* Gaming aesthetics
* Excessive gradients
* Oversized illustrations

---

# Core Reusable Components

Build reusable primitives first.

Examples:

* Button
* Card
* Modal
* Badge
* Input
* Select
* Toggle
* Slider
* StatCard
* RiskCard
* ConfidenceMeter
* PriceCard
* AnalyticsChart
* ReportCard

Pages should compose these components.

---

# Mock Data Strategy

Use realistic Indian agricultural land examples.

Include:

* Maharashtra villages
* Talukas
* Land prices
* Risk scores
* Ownership data

All mock responses should appear believable during judging.

---

# Success Criteria

The project is successful if a judge can:

1. Open the application.
2. Analyze a property.
3. Receive valuation results.
4. Understand the risks.
5. Explore supporting analytics.
6. Download a report.

Without needing an explanation from the team.

The product should tell its own story.
