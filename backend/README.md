# Whiteboard Collaboration Backend

Real-time collaborative whiteboard backend built with Node.js, Express, MongoDB, and Socket.io.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your values
   ```

4. **Start MongoDB**
   - Local: Make sure MongoDB is running on `mongodb://localhost:27017`
   - Atlas: Update `MONGODB_URI` in `.env` with your connection string

5. **Run the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Custom middleware (auth, etc.)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── sockets/         # Socket.io event handlers
│   └── utils/           # Utility functions
├── server.js            # Main server file
├── .env.example         # Environment variables template
└── package.json
```

## 🔑 Environment Variables

Create a `.env` file with the following:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/whiteboard-collab
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:5173
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Rooms
- `POST /api/rooms` - Create new room (protected)
- `GET /api/rooms` - Get all rooms (protected)
- `GET /api/rooms/:roomId` - Get room by ID (protected)

### Health Check
- `GET /api/health` - Server health status

## 🔌 Socket.io Events

### Client → Server
- `join-room` - Join a whiteboard room
- `leave-room` - Leave a room
- `draw` - Send drawing data
- `clear-canvas` - Clear the canvas

### Server → Client
- `user-joined` - Notify when user joins
- `user-left` - Notify when user leaves
- `draw` - Receive drawing data
- `clear-canvas` - Clear canvas event
- `room-joined` - Confirmation of joining room

## 🧪 Testing the API

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Create a room (replace TOKEN):**
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"My Whiteboard"}'
```

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📝 Notes

- All room routes require authentication
- JWT tokens expire after 7 days
- Room IDs are auto-generated (6 alphanumeric characters)
- Passwords are hashed before storage
- CORS is configured for frontend at `CLIENT_URL`

## 🔜 Next Steps

1. Build the React frontend
2. Implement canvas drawing logic
3. Add drawing history/persistence
4. Implement undo/redo functionality
5. Add user avatars and presence indicators
