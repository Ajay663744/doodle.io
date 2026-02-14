# 🚀 Production Deployment Guide - Quick Start

## Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Render account (free)
- Vercel account (free)

---

## Step-by-Step Deployment

### 📊 STEP 1: Setup MongoDB Atlas (5 minutes)

1. **Create Account & Cluster**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Click "Build a Database"
   - Choose **M0 FREE** tier
   - Select cloud provider (AWS recommended)
   - Choose region closest to you
   - Click "Create Cluster"

2. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `gameadmin` (or your choice)
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` (required for Render)
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string:
     ```
     mongodb+srv://gameadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `whiteboard-game`
   - Final format:
     ```
     mongodb+srv://gameadmin:YourPassword123@cluster0.xxxxx.mongodb.net/whiteboard-game?retryWrites=true&w=majority
     ```
   - **SAVE THIS** - you'll need it for Render

---

### 🔧 STEP 2: Prepare Your Code

1. **Generate JWT Secret**
   
   Open terminal in your backend folder and run:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Copy the output (64-character string). **SAVE THIS** - you'll need it for Render.

2. **Update .gitignore**
   
   Ensure both backend and frontend have `.env` in `.gitignore`:
   
   **Backend .gitignore:**
   ```
   node_modules/
   .env
   .env.local
   .env.production
   ```
   
   **Frontend .gitignore:**
   ```
   node_modules/
   dist/
   .env
   .env.local
   .env.production
   ```

3. **Push to GitHub**
   
   ```bash
   # In your project root (whiteboard-collab)
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   
   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

### 🖥️ STEP 3: Deploy Backend to Render (10 minutes)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub (recommended)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Web Service**
   - **Name**: `whiteboard-game-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` (if monorepo) or leave blank
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable"
   
   Add these 4 variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string from Step 1 |
   | `JWT_SECRET` | Your generated secret from Step 2 |
   | `CLIENT_URL` | `https://PLACEHOLDER.vercel.app` (we'll update this later) |

5. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Once deployed, copy your backend URL:
     ```
     https://whiteboard-game-backend.onrender.com
     ```
   - **SAVE THIS URL** - you'll need it for Vercel

6. **Verify Backend**
   
   Open in browser:
   ```
   https://your-backend-url.onrender.com/api/health
   ```
   
   Should see:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2026-02-14T..."
   }
   ```

---

### 🌐 STEP 4: Deploy Frontend to Vercel (5 minutes)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend` (if monorepo) or `./`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)

4. **Add Environment Variables**
   
   Before deploying, click "Environment Variables"
   
   Add these 2 variables (use your Render backend URL from Step 3):
   
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://your-backend.onrender.com` |
   
   **IMPORTANT**: 
   - `VITE_API_URL` includes `/api` at the end
   - `VITE_SOCKET_URL` does NOT include `/api`
   - Apply to: Production, Preview, Development (check all)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Once deployed, copy your frontend URL:
     ```
     https://your-app-name.vercel.app
     ```

---

### 🔄 STEP 5: Update Backend with Frontend URL

1. **Go Back to Render**
   - Open Render dashboard
   - Go to your backend web service
   - Click "Environment" (left sidebar)

2. **Update CLIENT_URL**
   - Find `CLIENT_URL` variable
   - Click "Edit"
   - Replace `https://PLACEHOLDER.vercel.app` with your actual Vercel URL:
     ```
     https://your-app-name.vercel.app
     ```
   - Click "Save Changes"

3. **Render will auto-redeploy** (takes 2-3 minutes)

---

## ✅ Testing Your Deployment

### Test 1: Open Your App
- Go to your Vercel URL: `https://your-app-name.vercel.app`
- Should see login/register page
- No errors in browser console (F12)

### Test 2: Register & Login
- Click "Register"
- Create account
- Should redirect to dashboard
- Check browser console - should see "Socket connected"

### Test 3: Create Room
- Click "Create Room"
- Enter room name
- Click "Create"
- Should enter room lobby

### Test 4: Multiplayer (CRITICAL)
1. **Open app in 2 different browsers** (e.g., Chrome + Firefox)
2. **Browser 1**: Login as User 1, create room
3. **Browser 2**: Login as User 2, join same room
4. **Browser 1**: Start game
5. **Both browsers should**:
   - See game start simultaneously
   - See same timer countdown
   - Drawing in Browser 1 appears in Browser 2
   - Guesses appear for both users

### Test 5: Check Logs

**Render Logs:**
- Go to Render dashboard → Your service → Logs
- Should see:
  - "MongoDB connected successfully"
  - "Server running in production mode"
  - No error messages

**Vercel Logs:**
- Go to Vercel dashboard → Your project → Deployments
- Click latest deployment
- Should show "Build Completed"

---

## 🐛 Troubleshooting

### ❌ "Failed to fetch" or CORS errors

**Problem**: Frontend can't reach backend

**Solutions**:
1. Check `CLIENT_URL` on Render matches Vercel URL exactly
2. No trailing slash in URLs
3. Redeploy backend after changing `CLIENT_URL`

**Verify**:
```bash
# Check CORS headers
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/health
```

---

### ❌ Socket.io not connecting

**Problem**: "WebSocket connection failed" in console

**Solutions**:
1. Verify `VITE_SOCKET_URL` on Vercel (no `/api` suffix)
2. Check Render logs for WebSocket errors
3. Ensure Socket.io versions match (both 4.8.1)

**Verify**:
- Open browser console
- Should see: "Socket connected" or similar
- Should NOT see: "Transport error" or "WebSocket failed"

---

### ❌ Backend is slow (30-60 seconds)

**Problem**: First request takes forever

**This is NORMAL on Render free tier**:
- Service spins down after 15 minutes of inactivity
- First request "wakes it up" (cold start)
- Subsequent requests are fast

**Not a bug** - this is expected behavior.

---

### ❌ MongoDB connection timeout

**Problem**: "MongoServerError: connection timeout"

**Solutions**:
1. Check IP whitelist includes `0.0.0.0/0`
2. Verify username/password in `MONGODB_URI`
3. Check connection string format
4. Ensure database user has read/write permissions

**Verify**:
- Go to MongoDB Atlas → Network Access
- Should see `0.0.0.0/0` in IP Access List

---

### ❌ Environment variables not working

**Problem**: App uses localhost in production

**Solutions**:
1. Verify variables are set on Vercel/Render
2. Variable names are case-sensitive
3. Vite variables MUST start with `VITE_`
4. Redeploy after adding variables

**Verify on Vercel**:
- Project Settings → Environment Variables
- Should see `VITE_API_URL` and `VITE_SOCKET_URL`

**Verify on Render**:
- Environment tab
- Should see all 4 variables

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] `.env` files in `.gitignore`
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string saved
- [ ] JWT secret generated

### Backend (Render)
- [ ] Web service created
- [ ] Environment variables set (4 total)
- [ ] Deployment successful
- [ ] Health check works
- [ ] Logs show MongoDB connected

### Frontend (Vercel)
- [ ] Project imported
- [ ] Environment variables set (2 total)
- [ ] Build successful
- [ ] Site loads without errors
- [ ] Socket connected (check console)

### Final Testing
- [ ] Can register user
- [ ] Can login
- [ ] Can create room
- [ ] Can join room (test with 2 browsers)
- [ ] Game starts for both users
- [ ] Drawing synchronizes
- [ ] Guessing works
- [ ] Timer works
- [ ] Scores update
- [ ] Leaderboard displays

---

## 🎉 Success!

Your Multiplayer Drawing Guess Game is now live!

**Share your game**:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

**Next Steps**:
- Share with friends to test multiplayer
- Monitor Render logs for errors
- Check MongoDB Atlas metrics
- Consider custom domain (Vercel supports free)

---

## 📞 Need Help?

**Common Resources**:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Socket.io: https://socket.io/docs/v4/

**Check Logs**:
- Render: Dashboard → Your Service → Logs
- Vercel: Dashboard → Deployments → Latest → View Logs
- Browser: F12 → Console tab
