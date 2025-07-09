import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/images/logo.png';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
            {/* Logo */}
            <div className="flex items-center">
                <img src={logoImage} alt="Parkendation Logo" className="w-32 mr-2" />
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-4">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Trang chủ
                </NavLink>
                <NavLink
                    to="/design"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Thiết kế bãi đỗ xe
                </NavLink>
                <NavLink
                    to="/parking-finding"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Tìm kiếm bãi đỗ xe
                </NavLink>
                <NavLink
                    to="/subscription"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Subscription
                </NavLink>
            </div>

            {/* Auth Button */}
            <div>
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors"
                    >
                        Đăng xuất
                    </button>
                ) : (
                    <Link to="/login" className="bg-gray-900 text-white px-6 py-2 rounded-full font-medium inline-block hover:bg-gray-800 transition-colors">
                        Đăng nhập/Đăng ký
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;