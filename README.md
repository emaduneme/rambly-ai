<div align="center">

<img src="public/rambly-git-readme image.png" alt="Rambly" width="100%" />

# Rambly

**Turn your messy voice recordings into clean, perfectly structured notes.**

*Think out loud. Get back clarity.*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)](https://vercel.com/)

</div>

---

## The Problem

Thinking is non-linear. Writing is linear. The gap between the two is where ideas die.

Most people — researchers, writers, students, thinkers — have more ideas than they can type. Voice is the fastest way to capture raw thought, but raw voice is messy. Rambly bridges that gap for people who think deeply and write seriously.

## How It Works

1. **Record** — Tap the mic and start talking. No friction, no setup.
2. **Choose a Context** — Tell Rambly *what kind* of writing this is (academic, blog, journal, work notes).
3. **Get structured output** — Rambly transcribes and transforms your ramble into clean, organized text in seconds.
4. **Save & revisit** — Every recording lives in your personal library, searchable and exportable.

## Key Features

- 🎤 **One-tap recording** — minimal UI, zero cognitive load
- 🧠 **Contextual processing** — assign contexts (e.g. *"dissertation"*, *"travel blog"*, *"morning journal"*) so Rambly adapts its output to your intent
- ✍️ **Fidelity control** — choose how much Rambly rewrites: from raw transcript to full polish
- 📚 **Note library** — search, revisit, and re-export past recordings
- 🌙 **Dark mode** — built-in from day one
- ⚡ **Fast** — voice → structured text in seconds, powered by Google Gemini


## Built With

| Tool | Role |
|---|---|
| **Google Antigravity** | Rapid prototyping and app scaffolding |
| **Claude Code** | Brainstorming and debugging |
| **Google Stitch** | UI/UX design |

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| **AI** | Google Gemini (audio transcription), Google Gemma via OpenRouter (text processing) |
| **Backend** | Vercel Serverless Functions |
| **Build** | Vite 6 |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Google Gemini API key](https://ai.google.dev/) (for audio transcription)
- An [OpenRouter API key](https://openrouter.ai/) (for Google Gemma processing without strict rate limits)

### Setup

```bash
# Clone the repo
git clone https://github.com/emaduneme/rambly-ai.git
cd rambly-ai

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Then add your API keys to .env:
# GEMINI_API_KEY=your_gemini_key_here
# OPENROUTER_API_KEY=your_openrouter_key_here

# Start the dev server
npm run dev
```

The app will be running at `http://localhost:3000`.

## Project Structure

```
rambly/
├── api/                  # Vercel serverless functions
│   ├── process.ts        # AI text processing endpoint
│   └── transcribe.ts     # Audio transcription endpoint
├── src/
│   ├── components/       # React UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities, AI client, storage
│   ├── App.tsx           # Main application
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── index.html            # HTML shell
```


## License

This project is currently unlicensed. All rights reserved.

---

<div align="center">
<sub>Rambly - Built for people who think deeply and write seriously.</sub>
</div>
