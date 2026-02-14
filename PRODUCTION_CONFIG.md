# Production Configuration Reference

## Backend Environment Variables

### Required Variables (Render)

```bash
# Environment
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/whiteboard-game?retryWrites=true&w=majority

# Security
JWT_SECRET=your_64_character_random_hex_string_here

# CORS
CLIENT_URL=https://your-frontend.vercel.app
```

### How to Generate JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Frontend Environment Variables

### Required Variables (Vercel)

```bash
# API Endpoint (includes /api)
VITE_API_URL=https://your-backend.onrender.com/api

# Socket.io Endpoint (NO /api)
VITE_SOCKET_URL=https://your-backend.onrender.com
```

### Important Notes

1. **VITE_API_URL** includes `/api` suffix
2. **VITE_SOCKET_URL** does NOT include `/api`
3. Both must start with `VITE_` for Vite to expose them
4. Set for all environments: Production, Preview, Development

---

## MongoDB Atlas Configuration

### Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.<id>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Example

```
mongodb+srv://gameadmin:MySecurePass123@cluster0.abc123.mongodb.net/whiteboard-game?retryWrites=true&w=majority
```

### Network Access

**MUST** allow access from anywhere:
- IP Address: `0.0.0.0/0`
- This allows Render to connect (dynamic IPs)

### Database User Permissions

- Role: **Read and write to any database**
- Or specific: **readWrite** on `whiteboard-game` database

---

## Render Configuration

### Web Service Settings

| Setting | Value |
|---------|-------|
| Environment | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

### Auto-Deploy

- Enabled by default
- Deploys on every push to `main` branch
- Can disable in Settings → Build & Deploy

---

## Vercel Configuration

### Build Settings

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Root Directory

- **Monorepo**: Set to `frontend`
- **Separate repo**: Leave blank or `./`

---

## CORS Configuration

Already configured in `server.js`:

```javascript
// Express CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Socket.io CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
```

**Important**: `CLIENT_URL` must match your Vercel URL exactly.

---

## Socket.io Production Configuration

### Backend (Already Configured)

```javascript
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
```

### Frontend (Already Configured)

```javascript
// src/socket/socketService.js
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);
```

### Troubleshooting Socket.io

If WebSocket fails, add transport fallback:

```javascript
const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});
```

---

## Package.json Scripts

### Backend

```json
{
  "scripts": {
    "start": "NODE_ENV=production node server.js",
    "dev": "NODE_ENV=development nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Frontend

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Health Check Endpoints

### Backend Health Check

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-14T05:30:00.000Z"
}
```

**Test**:
```bash
curl https://your-backend.onrender.com/api/health
```

---

## Security Best Practices

### ✅ Already Implemented

1. **JWT Authentication**: Tokens for user sessions
2. **Password Hashing**: bcryptjs for secure passwords
3. **Input Validation**: express-validator on routes
4. **CORS**: Restricted to frontend domain
5. **Environment Variables**: Secrets not in code

### 🔒 Additional Recommendations

1. **Rate Limiting** (Optional):
   ```bash
   npm install express-rate-limit
   ```

2. **Helmet.js** (Optional):
   ```bash
   npm install helmet
   ```

3. **Strong JWT Secret**: Use 32+ byte random string

---

## Monitoring & Logs

### Render Logs

**Access**: Dashboard → Your Service → Logs

**What to Monitor**:
- MongoDB connection status
- Server startup messages
- Socket.io connections
- API request errors
- Uncaught exceptions

### Vercel Logs

**Access**: Dashboard → Deployments → View Logs

**What to Monitor**:
- Build success/failure
- Runtime errors
- Function invocations (if using serverless)

### MongoDB Atlas Metrics

**Access**: Atlas Dashboard → Metrics

**What to Monitor**:
- Connection count
- Operation execution time
- Storage usage
- Network traffic

---

## Free Tier Limitations

### Render Free Tier

- ✅ 512 MB RAM
- ✅ Shared CPU
- ✅ WebSocket support
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 750 hours/month (enough for 1 service)
- ⚠️ Cold start: 30-60 seconds

### Vercel Free Tier

- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Preview deployments

### MongoDB Atlas Free Tier (M0)

- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ No credit card required
- ⚠️ Limited to 100 connections
- ⚠️ No backups

---

## Scaling Considerations

### When to Upgrade

**Render**:
- If cold starts are unacceptable
- If you need more than 512 MB RAM
- If you need dedicated CPU

**MongoDB Atlas**:
- If you exceed 512 MB storage
- If you need backups
- If you need more connections

**Vercel**:
- If you exceed 100 GB bandwidth
- If you need analytics
- If you need team collaboration

---

## Environment-Specific Configurations

### Development

```bash
# Backend .env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whiteboard-collab
JWT_SECRET=dev_secret_key
CLIENT_URL=http://localhost:5173

# Frontend .env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Production

```bash
# Backend (Render)
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char-hex>
CLIENT_URL=https://your-app.vercel.app

# Frontend (Vercel)
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## Deployment Workflow

### Automatic Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Render auto-deploys** (3-5 minutes)
3. **Vercel auto-deploys** (2-3 minutes)

### Manual Deployment

**Render**:
- Dashboard → Your Service → Manual Deploy → Deploy latest commit

**Vercel**:
- Dashboard → Deployments → Redeploy

---

## Rollback Procedure

### Vercel Rollback

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Render Rollback

1. Go to Events tab
2. Find previous successful deploy
3. Click "Rollback to this version"

---

## Custom Domain Setup (Optional)

### Vercel Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records (Vercel provides instructions)
4. Update `CLIENT_URL` on Render to your custom domain

### Render Custom Domain

1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records
4. Update `VITE_API_URL` and `VITE_SOCKET_URL` on Vercel

---

## Testing Checklist

### Backend Tests

- [ ] Health endpoint responds
- [ ] MongoDB connection successful
- [ ] JWT authentication works
- [ ] CORS headers correct
- [ ] Socket.io accepts connections

### Frontend Tests

- [ ] Build completes without errors
- [ ] Environment variables loaded
- [ ] API calls succeed
- [ ] Socket.io connects
- [ ] No console errors

### Integration Tests

- [ ] User registration works
- [ ] User login works
- [ ] Room creation works
- [ ] Room joining works
- [ ] Game flow works end-to-end
- [ ] Multiplayer sync works
- [ ] Leaderboard updates

---

## Common Error Messages

### "MongoServerSelectionError"

**Cause**: Can't connect to MongoDB

**Fix**:
- Check `MONGODB_URI` is correct
- Verify IP whitelist includes `0.0.0.0/0`
- Check database user credentials

### "JsonWebTokenError"

**Cause**: Invalid JWT token

**Fix**:
- Ensure `JWT_SECRET` is same on all instances
- Check token format in requests
- Verify token not expired

### "CORS policy error"

**Cause**: Frontend origin not allowed

**Fix**:
- Verify `CLIENT_URL` matches Vercel URL exactly
- No trailing slashes
- Redeploy backend after changing

### "WebSocket connection failed"

**Cause**: Socket.io can't connect

**Fix**:
- Check `VITE_SOCKET_URL` is correct (no `/api`)
- Verify Render supports WebSockets (it does)
- Check browser console for specific error

---

## Performance Optimization

### Backend

1. **Enable compression**:
   ```bash
   npm install compression
   ```

2. **Add MongoDB indexes**:
   ```javascript
   // In User model
   userSchema.index({ email: 1 });
   
   // In Room model
   roomSchema.index({ roomId: 1 });
   ```

### Frontend

1. **Code splitting** (Vite does this automatically)
2. **Lazy loading routes**:
   ```javascript
   const Room = lazy(() => import('./pages/Room'));
   ```

3. **Optimize images** (if any)

---

## Backup Strategy

### MongoDB Atlas

**Free tier**: No automatic backups

**Manual backup**:
```bash
mongodump --uri="mongodb+srv://..." --out=./backup
```

### Code

**Always in Git**:
- Push regularly to GitHub
- Use branches for features
- Tag releases

---

## Support Resources

- **Render Status**: https://status.render.com
- **Vercel Status**: https://www.vercel-status.com
- **MongoDB Atlas Status**: https://status.mongodb.com
- **Socket.io Docs**: https://socket.io/docs/v4/
