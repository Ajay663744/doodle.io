# Whiteboard Collaboration Game - Deployment Files

## Important Files for Deployment

### Backend
- `.env.production.example` - Template for Render environment variables
- `package.json` - Updated with production scripts and Node.js engine requirements

### Frontend  
- `.env.example` - Template for local development
- `.env.production.example` - Template for Vercel environment variables

### Documentation
- `DEPLOYMENT_GUIDE.md` - Complete step-by-step deployment instructions
- `PRODUCTION_CONFIG.md` - Configuration reference and troubleshooting

## Quick Start

1. Read `DEPLOYMENT_GUIDE.md` for step-by-step instructions
2. Follow the guide to deploy to MongoDB Atlas, Render, and Vercel
3. Refer to `PRODUCTION_CONFIG.md` for configuration details

## Environment Variables

### Backend (Render)
```
NODE_ENV=production
MONGODB_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<generate_with_crypto>
CLIENT_URL=<your_vercel_url>
```

### Frontend (Vercel)
```
VITE_API_URL=<your_render_url>/api
VITE_SOCKET_URL=<your_render_url>
```

## Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Multiplayer tested with 2+ users

## Support

See `DEPLOYMENT_GUIDE.md` for troubleshooting and common issues.
