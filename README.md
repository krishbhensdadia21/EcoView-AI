# EcoView AI – AI-Powered E-Waste Intelligence Platform

It is an intelligent AI-powered web platform that helps users identify electronic waste, evaluate device condition, estimate material recovery value, and receive sustainability recommendations through computer vision and environmental analytics. Built using **Python, FastAPI, React, Tailwind CSS, Groq LLaMA Vision, Chart.js and AI-powered recommendation systems**, the platform promotes responsible e-waste management while providing actionable insights for citizens, recyclers, NGOs, and government agencies.

## Features

- ♻️ AI-powered e-waste identification from uploaded device images
- 📸 Instant electronic device detection using computer vision
- 🤖 Smart AI recommendations: Reuse, Repair, Refurbish or Recycle
- 📊 E-Waste Health Score with sustainability metrics
- 🪪 Digital Product Passport generation for device tracking
- 💰 Material Recovery Estimator for valuable recyclable materials
- 🌍 Environmental impact calculation (CO₂ and water savings)
- 🤝 Recycler, NGO, and sustainability partner matching
- 📈 Government dashboard for e-waste monitoring and analytics
- 📍 Regional e-waste hotspot visualization and insights
- ⚡ Fast image analysis powered by Groq LLaMA Vision
- 📱 Responsive modern web interface

## Tech Stack

- *Python*
- *FastAPI*
- *React.js*
- *Tailwind CSS*
- *JavaScript*
- *Groq API*
- *LLaMA Vision*
- *Chart.js*
- *REST APIs*
- *Firebase*

## Core Functionalities

- **AI Device Detection Engine** – Identifies electronic devices from uploaded images
- **Condition Assessment Module** – Estimates device age and evaluates current condition
- **Smart Recommendation System** – Suggests Reuse, Repair, Refurbish, or Recycle actions
- **Digital Product Passport** – Generates a unique sustainability identity for every device
- **E-Waste Health Scoring** – Calculates reuse, repairability, refurbishment, and recycling scores
- **Material Recovery Estimator** – Estimates recoverable copper, aluminum, gold, silver, and plastic
- **Environmental Impact Calculator** – Measures carbon emissions avoided and water saved
- **Partner Matching Engine** – Connects users with nearby recyclers, NGOs, and collection centers
- **Government Analytics Dashboard** – Provides real-time e-waste intelligence and insights
- **Hotspot Monitoring System** – Tracks regional e-waste generation patterns

## API Endpoints

### Backend (FastAPI)
- `POST /scan/analyze` – Upload device image for AI analysis
- `GET /scan/{passport_id}` – Retrieve previously scanned device data
- `GET /dashboard/stats` – Government dashboard aggregated statistics
- `POST /marketplace/match` – Find recycling partners for a device
- `GET /` – API root endpoint
- `GET /health` – Health check
- `GET /docs` – Interactive Swagger API documentation

### Frontend (React)
- `/` – Home page
- `/scan` – Device upload and analysis page
- `/results` – Scan results with recommendations
- `/dashboard` – Government analytics dashboard

## Project Highlights

- 🚀 Built a complete AI-powered e-waste management platform
- ♻️ Encourages sustainable disposal and circular economy practices
- 🤖 Uses LLaMA Vision for intelligent device recognition
- 📊 Generates actionable sustainability recommendations
- 💰 Estimates material recovery value from discarded electronics
- 🌍 Quantifies environmental benefits through impact metrics
- 🤝 Connects users with verified recycling ecosystem partners
- 🏛 Provides governments with real-time e-waste analytics
- 📈 Visualizes device categories and regional e-waste hotspots
- 🎯 Supports citizens, NGOs, recyclers, institutions, and policymakers

## Workflow

1. User uploads an image of an electronic device
2. AI analyzes and identifies the device
3. Device condition and estimated age are evaluated
4. Sustainability scores are generated
5. Smart recommendation is provided:
   - Reuse
   - Repair
   - Refurbish
   - Recycle
6. Material recovery value is estimated
7. Environmental impact savings are calculated
8. Nearby recycling and sustainability partners are recommended
9. Results contribute to the government analytics dashboard

## Sustainability Impact

- 🌱 Promotes responsible e-waste disposal
- ♻️ Encourages device reuse and refurbishment
- 💰 Maximizes material recovery from electronic waste
- 🌍 Reduces carbon footprint through recycling
- 💧 Conserves water through circular economy practices
- 📊 Enables data-driven policy decisions for governments

## Target Users

- Individual consumers
- Educational institutions
- NGOs
- E-waste recyclers
- Sustainability organizations
- Government agencies
- Smart city administrators
- Environmental researchers

---

## UI/UX polish pass

The existing theme — mint/white palette, leaf wordmark, bold rounded
sans-serif, color-coded icons, current page layouts — was kept exactly as
designed. Nothing was redesigned or recolored. The following execution
gaps were fixed:

- **Mobile navigation** — the navbar had no mobile menu and would
  overflow/break below ~880px. Added a hamburger toggle with a proper
  dropdown menu, active-state highlighting, and the same CTA button.
- **Navbar CTA** — added a "Start Scanning" button to the desktop nav so
  there's always a clear next action, matching common nav patterns.
- **Hero visual weight** — added a small "Powered by Groq" trust badge
  above the headline and a trust-signal strip below the CTA, so the hero
  isn't mostly empty space.
- **Feature card icon chips** — feature icons now sit in a soft tinted
  background matching their own color, giving the grid more visual
  structure instead of bare icons floating above text.
- **Card hover treatment** — every white card across Home, Scan,
  Dashboard, Results, and Insights now uses the `.card-hover` lift effect
  that was already defined in `index.css` but unused everywhere.
  Buttons that previously had a flat `hover:bg-*` now also lift slightly
  on hover for a more tactile feel, with disabled states correctly
  excluded from the lift.
- **Page header consistency** — Home, Scan, Dashboard, Insights, and
  Assistant now all open with the same small category badge + heading
  pattern, so the six pages read as one product rather than six
  separately built screens.
- **Dashboard loading state** — replaced the plain "Loading…" text with
  skeleton placeholders (using the existing `.skeleton` class) that match
  the eventual layout.

No copy, colors, fonts, icons, or page structure were changed beyond
what's listed above.
