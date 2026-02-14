import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <h1 className="text-2xl font-bold text-primary-600">
                            Whiteboard Collab
                        </h1>
                    </Link>

                    {/* User Info & Logout */}
                    {isAuthenticated && user && (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">
                                Welcome, <span className="font-semibold">{user.name}</span>
                            </span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
