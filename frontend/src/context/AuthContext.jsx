import { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';
import { initializeSocket, connectSocket, disconnectSocket } from '../socket/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Initialize socket connection
                initializeSocket();
                connectSocket();
            }

            setLoading(false);
        };

        loadUser();
    }, []);

    /**
     * Register a new user
     */
    const register = async (name, email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authService.register(name, email, password);

            if (response.success) {
                const { user: userData, token: userToken } = response.data;

                // Store in state
                setUser(userData);
                setToken(userToken);

                // Store in localStorage
                localStorage.setItem('token', userToken);
                localStorage.setItem('user', JSON.stringify(userData));

                // Initialize socket
                initializeSocket();
                connectSocket();

                return { success: true };
            }
        } catch (err) {
            setError(err);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login user
     */
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authService.login(email, password);

            if (response.success) {
                const { user: userData, token: userToken } = response.data;

                // Store in state
                setUser(userData);
                setToken(userToken);

                // Store in localStorage
                localStorage.setItem('token', userToken);
                localStorage.setItem('user', JSON.stringify(userData));

                // Initialize socket
                initializeSocket();
                connectSocket();

                return { success: true };
            }
        } catch (err) {
            setError(err);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        // Disconnect socket
        disconnectSocket();

        // Clear state
        setUser(null);
        setToken(null);
        setError(null);

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
