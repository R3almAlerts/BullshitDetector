# Bullshit Detector

**Real-time political claim checker powered by xAI's Grok.**

Paste any statement, headline, or claim — get instant **Bullshit**, **Mostly True**, or **Neutral** verdict with **real-time sentiment analysis**.

**No backend. No tracking. All local.**

---

## Features

| Feature | Status |
|-------|--------|
| **Voter Mode** – Instant verdicts | Done |
| **Sentiment Dashboard** – Public opinion % | Done |
| **Professional Mode** – Coming soon | In Progress |
| **History** – Save & search past checks | Done |
| **Settings** – Dark mode, model, API key | Done |
| **xAI API** – Grok 3 (free) / Grok 4 (Premium) | Done |
| **Local JSON DB** – `bullshit-detector-db.json` | Done |
| **Zero backend** – Runs fully offline | Done |

---

## Live Demo

[https://bullshit-detector.vercel.app](https://bullshit-detector.vercel.app) *(coming soon)*

---

## Tech Stack

- **React** + **Vite**
- **Tailwind CSS**
- **TypeScript**
- **xAI API** (`api.x.ai`)
- **Local JSON DB** (no `localStorage`)
- **Vite dev server** with `fs.allow`

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/BullshitDetector.git
cd BullshitDetector
pnpm install