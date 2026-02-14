# Whiteboard Collab - Frontend

React frontend for the Real-Time Collaborative Whiteboard application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Backend server running on `http://localhost:5000`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── services/        # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── roomService.js
│   ├── socket/          # Socket.io client
│   │   └── socketService.js
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── App.jsx          # Main app with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables
└── package.json
```

## 🔧 Features Implemented

### ✅ Authentication
- User registration with validation
- User login with JWT
- Protected routes
- Persistent authentication (localStorage)
- Auto-redirect based on auth status

### ✅ Dashboard
- Welcome message with user name
- Create new room with custom name
- Join existing room by ID
- List of available rooms
- Real-time room navigation

### ✅ API Integration
- Centralized Axios instance
- Automatic JWT token attachment
- Global error handling
- Request/response interceptors

### ✅ Socket.io Setup
- Socket connection initialization
- Connection/disconnection handling
- Room join/leave functions
- Ready for drawing events (Phase 3)

## 🎨 UI/UX

- **Tailwind CSS** for styling
- **Responsive design** for all screen sizes
- **Modern gradient backgrounds**
- **Smooth transitions and hover effects**
- **Loading states** for async operations
- **Error/success messages** with visual feedback

## 🔌 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📱 Pages

### Login (`/login`)
- Email and password fields
- Form validation
- Error handling
- Link to register page
- Auto-redirect if already logged in

### Register (`/register`)
- Name, email, password fields
- Password confirmation
- Form validation
- Error handling
- Link to login page
- Auto-redirect if already logged in

### Dashboard (`/dashboard`)
- Protected route (requires authentication)
- Create room form
- Join room form
- Available rooms list
- User info in navbar
- Logout button

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.io Client** - WebSocket client

## 📝 Usage

### 1. Register a New User
1. Navigate to `/register`
2. Fill in name, email, and password
3. Click "Create Account"
4. Redirected to dashboard

### 2. Login
1. Navigate to `/login`
2. Enter email and password
3. Click "Sign In"
4. Redirected to dashboard

### 3. Create a Room
1. On dashboard, enter room name
2. Click "Create Room"
3. Room ID is generated automatically
4. Auto-navigate to room (Phase 3)

### 4. Join a Room
1. On dashboard, enter room ID
2. Click "Join Room"
3. Navigate to room (Phase 3)

## 🔜 Next Steps (Phase 3)

- [ ] Whiteboard canvas component
- [ ] Drawing tools (pen, eraser, shapes)
- [ ] Real-time drawing synchronization
- [ ] Color picker
- [ ] Stroke width selector
- [ ] Clear canvas functionality
- [ ] User cursors visibility
- [ ] Undo/redo functionality

## 🐛 Troubleshooting

**Issue: API calls failing**
- Ensure backend server is running on `http://localhost:5000`
- Check `.env` file has correct API URL

**Issue: Socket not connecting**
- Verify backend Socket.io server is running
- Check browser console for connection errors

**Issue: Redirecting to login after refresh**
- Check if token is stored in localStorage
- Verify token is valid (not expired)
