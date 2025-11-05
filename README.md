# Bullshit Detector

BullshitDetector/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── AppLayout.tsx
│   ├── contexts/
│   │   ├── AppContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── ModelContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── UserModeContext.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── VoterMode.tsx
│   │   ├── ProfessionalMode.tsx
│   │   ├── SentimentPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── SettingsPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
**Detect political spin, corporate jargon, and plain-old nonsense in real time.**

![Demo](https://placehold.co/1200x600?text=Bullshit+Detector+Demo)

---

## Features

| Mode | Description |
|------|-------------|
| **Voter Mode** | Simple, opinion-free fact checks. |
| **Professional Mode** | Deep-dive analysis with sources & citations. |
| **Sentiment Dashboard** | Real-time sentiment trends. |
| **History** | Review past analyses. |
| **Dark / Light Theme** | Fully customizable. |
| **Onboarding** | First-time user guidance. |

---

## Quick Start

```bash
git clone https://github.com/BullshitDetector/BullshitDetector.git
cd BullshitDetector
pnpm install   # or npm i / yarn
pnpm dev       # starts Vite dev server
