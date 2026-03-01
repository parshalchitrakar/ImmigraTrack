# Deployment Guide: ImmigraTrack (Neon + Vercel + Render)

This guide is tailored for your choice of **Neon.tech** (Database), **Vercel** (Frontend), and **Render** (API).

## Prerequisites
1. A **GitHub** account.
2. A **Neon.tech** account (Free serverless Postgres).
3. A **Render.com** account (Free Node.js hosting).
4. A **Vercel.com** account (Free Frontend hosting).

---

## Step 1: Set up Neon Database
1. Create a project at [Neon.tech](https://neon.tech/).
2. Create a database named `immigratrack`.
3. In the Neon Dashboard, go to **SQL Editor** and run the contents of `database/schema.sql` and `database/seed.sql`.
4. Copy the **Connection String** (it starts with `postgres://...`).

---

## Step 2: Deploy API (Render)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. **Settings**:
   - **Name**: `immigratrack-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - `DATABASE_URL`: (Paste your Neon connection string here)
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.

---

## Step 3: Deploy Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Project Settings**:
   - **Framework Preset**: Angular.
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend` (Auto-detected).
5. Click **Deploy**.

---

## Step 4: Update Production URL
Once Render gives you your API URL (e.g., `https://immigratrack-api.onrender.com`), update it in:
- `frontend/src/environments/environment.prod.ts` 

Then git push to trigger a fresh Vercel build.

---

## Summary of Production Stack
| Component | Provider | Why? |
|-----------|----------|------|
| **Frontend** | Vercel | Fast, global CDN, great Angular support. |
| **API**      | Render | Easy Node.js deployment, handles Cron jobs well. |
| **Database** | Neon   | Serverless Postgres, generous free tier, won't expire. |

