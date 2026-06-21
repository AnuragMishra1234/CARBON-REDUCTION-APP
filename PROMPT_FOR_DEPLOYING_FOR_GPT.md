# 🚀 PROMPT FOR DEPLOYING CARBON AI — FOR GPT

> Copy the prompt below and give it to ChatGPT (GPT-4o recommended).
> It will guide you step-by-step through deploying your Carbon AI app on Vercel (frontend) and Render (backend).

---

## ✅ PASTE THIS PROMPT TO GPT:

---

```
I have a full-stack web app called **Carbon AI** — a sustainability/carbon footprint tracking platform.

**Tech Stack:**
- Frontend: React + Vite (in `/client` folder)
- Backend: Node.js + Express + MongoDB Atlas (in `/server` folder)
- AI: Groq SDK for AI coaching

**Deployment Targets:**
- Frontend → **Vercel**
- Backend → **Render** (free tier)
- Database → **MongoDB Atlas** (free tier)

**My project is already set up for deployment. Here's what's been configured:**
- `vercel.json` in the root (points to `client/`, outputs `client/dist/`)
- `render.yaml` in the root (blueprint for the backend server)
- `client/src/lib/api.js` — central axios instance using `VITE_API_URL` env var
- `server/.env.example` — shows what env vars the backend needs
- `client/.env.example` — shows `VITE_API_URL` for the frontend

**What I need your help with (step by step):**

1. **MongoDB Atlas Setup**
   - How to create a free cluster on https://cloud.mongodb.com
   - How to create a database user with a strong password
   - How to whitelist all IPs (0.0.0.0/0) for Render access
   - How to get the connection string (`MONGODB_URI`)

2. **Render Deployment (Backend)**
   - How to sign up/log in at https://render.com
   - How to create a new "Web Service" from my GitHub repo
   - Settings to use:
     - Root Directory: `server`
     - Build Command: `npm install`
     - Start Command: `node server.js`
     - Environment: Node
   - What environment variables to add in the Render dashboard:
     - `NODE_ENV` = `production`
     - `PORT` = `10000`
     - `MONGODB_URI` = (paste from Atlas)
     - `JWT_SECRET` = (a random 64-character string — ask GPT to generate one)
     - `JWT_EXPIRES_IN` = `7d`
     - `GROQ_API_KEY` = (from https://console.groq.com)
     - `CLIENT_URL` = (my Vercel URL — I'll get this after deploying frontend)
   - How to verify the backend is running using the health endpoint `/api/health`

3. **Vercel Deployment (Frontend)**
   - How to sign up/log in at https://vercel.com
   - How to import my GitHub repository
   - Settings to use in Vercel:
     - Framework Preset: **Vite**
     - Root Directory: `client`
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
   - What environment variable to add in Vercel dashboard:
     - `VITE_API_URL` = (my Render backend URL, e.g. `https://carbon-ai-backend.onrender.com`)
   - How to trigger a redeploy after adding env vars

4. **Cross-linking the two services**
   - After both are deployed, go back to Render and update `CLIENT_URL` to my Vercel URL
   - How to redeploy the backend after updating env vars

5. **Final Verification Checklist**
   - Check `https://<render-url>/api/health` returns `{ "status": "ok" }`
   - Open my Vercel URL and try to register a new account
   - Log in and check that the dashboard loads data
   - Test the AI Coach feature

6. **Common Issues & Fixes**
   - CORS errors (what to do if browser console shows CORS errors)
   - MongoDB connection failed (check IP whitelist and URI format)
   - Vite build fails (check `VITE_API_URL` is set before deploying)
   - Render service sleeping on free tier (how to use UptimeRobot to keep it awake)

Please walk me through each step with clear instructions, screenshots descriptions, and exact values to paste where needed.
```

---

## 📋 QUICK REFERENCE — Values You'll Fill In

| Variable | Where to Get It | Where to Set It |
|----------|----------------|-----------------|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers | Render Dashboard |
| `JWT_SECRET` | Ask GPT to generate random 64-char string | Render Dashboard |
| `GROQ_API_KEY` | https://console.groq.com/keys | Render Dashboard |
| `CLIENT_URL` | Your Vercel deployment URL | Render Dashboard |
| `VITE_API_URL` | Your Render service URL | Vercel Dashboard |

---

## 🗂️ Project Structure Summary (For Reference)

```
CARBON/
├── vercel.json          ← Vercel config (builds client/)
├── render.yaml          ← Render blueprint (deploys server/)
├── .gitignore
├── client/              ← React + Vite app (→ Vercel)
│   ├── .env.example     ← VITE_API_URL goes here
│   ├── src/
│   │   └── lib/
│   │       └── api.js   ← Central axios with VITE_API_URL
│   └── vite.config.js
└── server/              ← Express + MongoDB (→ Render)
    ├── .env.example     ← All server env vars listed here
    ├── server.js        ← Main server (CORS + routes)
    └── package.json
```

---

## ⚡ BEFORE YOU DEPLOY — Local Checklist

- [ ] Push all code to GitHub (public or private repo)
- [ ] Have your Groq API key ready from https://console.groq.com
- [ ] MongoDB Atlas cluster created and connection string copied
- [ ] Sign up on both Vercel (vercel.com) and Render (render.com)

---

## 🛟 IF SOMETHING BREAKS — Quick Fixes

**Build fails on Vercel:**
> Make sure `VITE_API_URL` is set in Vercel → Settings → Environment Variables BEFORE deploying

**API returns 502 on Render:**
> Wait 30-60 seconds — Render free tier cold starts. Check logs in Render dashboard.

**Login doesn't work (CORS error):**
> Go to Render → Environment → set `CLIENT_URL` to your exact Vercel URL (no trailing slash)
> Then manually trigger a redeploy on Render.

**MongoDB connection fails:**
> In MongoDB Atlas → Network Access → Add `0.0.0.0/0` to allow all IPs

---

*Generated for Carbon AI Platform — Full-Stack Deployment Guide*
