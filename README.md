# PoE Campaign Tool

A lightweight campaign progress tracker for **Path of Exile 1 (PoE1)**.

Designed to help players track quest completion and act progression (Acts 1–10) during league starts or fresh playthroughs.  
The tool provides overall campaign progress, per-act tracking, and XP-style visual feedback.

> This project is focused on campaign progression tracking. It is not a build planner or trade tool.

---

## Features

- Overall campaign progress bar
- Per-act progress tracking
- Percentage completion display
- XP-style leveling progression UI
- Persistent local progress (browser storage)
- English / Portuguese (pt-BR) support

---

## Why This Exists

Path of Exile campaign progression can feel opaque during fast league starts.  
This tool aims to provide:

- Clear visual feedback
- Structured act-based tracking
- Simple, distraction-free interface

No accounts. No backend. Fully client-driven state.

---

## Tech Stack

- **Next.js 16 (App Router + Turbopack)**
- **TypeScript**
- **Zustand (persist middleware)**
- **TailwindCSS**
- Server Components + Client Components separation
- Server-only JSON data loading (`fs` from `/data/generated`)
- Custom i18n solution (en / pt-BR)
- Hydration-safe persisted state handling

---

## Architecture Highlights

- Server-only data access (no `node:fs` usage in client components)
- Strict client/server separation
- Persisted Zustand store with hydration guard
- Clean prop-based data flow from Server Components
- No backend dependency

---

## Development

Install dependencies:

```bash
npm install