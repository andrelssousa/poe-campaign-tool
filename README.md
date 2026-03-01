# PoE Campaign Tool

A high-performance Path of Exile campaign tracker built with **Next.js 16 (App Router + Turbopack)**, **TypeScript**, **Zustand (persist)**, and **TailwindCSS**.  
Focused on clean server/client separation, hydration safety, and a progression-first UX (XP-style leveling + progress bars).

## Tech Stack

- Next.js 16.1.6 (App Router, Turbopack)
- TypeScript
- Zustand (persist middleware)
- TailwindCSS
- Server Components + Client Components separation
- Server-only JSON loading via `fs` (data from `/data/generated`)
- Custom i18n (en / pt-BR)
- Toast system + HydrationGate utilities

## Key Features

- Overall campaign progress bar + per-act progress bars
- XP-style leveling and progress feedback
- Completion badge and % display
- Progress glow animation on updates
- Acts page (server → client props flow)
- Tracker panel for quest completion
- Hydration-safe persisted state (Zustand)

## Architecture Notes

- **Server-only data access**: JSON is read only in Server Components (no `node:fs` in client components).
- **Client components receive data via props**.
- **Hydration handling** is designed to prevent infinite update loops and mismatch issues.

## Getting Started

Install dependencies:

```bash
npm install