# Deployment Guide: ImmigraTrack

This guide will help you deploy the full stack (Frontend, API, and Database) for free.

## Prerequisites
1. A **GitHub** account.
2. A **Render.com** account (for API and Database).
3. A **Vercel.com** account (for Frontend).

---

## Step 1: Push Code to GitHub
Ensure all your project code is in a single GitHub repository.
1. Create a new repository on GitHub.
2. Push your local code:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

---

## Step 2: Deploy Database & API (Render)
We will use Render's **Blueprints** to set up both the API and the Database simultaneously.

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect the `render.yaml` file.
5. Click **Apply**.
   - This will create a **PostgreSQL** database and a **Web Service** for the API.
   - The API will automatically get a URL like `https://greencard-insights-api.onrender.com`.

> [!NOTE]
> Render's free PostgreSQL databases expire after **90 days**. For a "forever free" database, consider using **Neon.tech** and manually providing the `DATABASE_URL` in Render's environment variables.

---

## Step 3: Deploy Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Project Settings**:
   - **Framework Preset**: Angular.
   - **Root Directory**: `frontend`.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist/frontend` (This should be auto-detected).
5. **Environment Variables**:
   - None strictly required for build, as we've configured file replacements in `angular.json`.
6. Click **Deploy**.

Vercel will give you a domain like `https://greencard-insights-frontend.vercel.app`.

---

## Step 4: Final Connection (CORS)
To allow the frontend to talk to the API, you may need to update the `CORS` settings in the backend if you didn't use `*`.
In `backend/src/app.ts`, ensure CORS allows your Vercel URL.

---

## Step 5: Custom Domain (Optional & Free-ish)
- **Vercel**: Go to Settings > Domains to add a custom domain.
- **Render**: Go to Settings > Custom Domains.
- Both provide **Free SSL** automatically.

---

## Summary of Production URLs
| Component | Provider | URL |
|-----------|----------|-----|
| Frontend | Vercel | `your-app.vercel.app` |
| API | Render | `your-api.onrender.com` |
| Database | Render | Internal Connection |
