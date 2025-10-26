AI Resume Builder

Monorepo with `frontend` (Vite React + Tailwind) and `backend` (Express + TypeScript). Features: AI ATS scoring, tailoring, upload parsing, local drafts, and scaffolding for auth/payments.

Prerequisites
- Node 18+
- OpenAI API key
- (Optional) Supabase project
- (Optional) Stripe account

Setup
1. Copy env example and fill values.
```bash
cp .env.example .env
```
2. Install deps.
```bash
npm --prefix backend i && npm --prefix frontend i
```
3. Run backend and frontend in two terminals.
```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

Environment
Create `.env` at repo root or inside `backend` and `frontend` as needed.

- Backend
```
PORT=4000
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=sk-...
SUPABASE_URL=
SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
```
- Frontend `.env`
```
VITE_API_URL=http://localhost:4000
```

Notes
- Current storage is in-memory/localStorage. Replace with Supabase tables for production.
- Upload parsing supports PDF and DOCX.
- AI endpoints: `/api/ai/ats-score`, `/api/ai/tailor`, `/api/ai/suggest-skills`.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
