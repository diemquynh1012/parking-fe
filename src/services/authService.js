import axios from 'axios';
import { userService } from './userService';

const API_URL = "http://160.191.49.99:7777/api/v0";

export const authService = {
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);

                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }

                const userData = await userService.getUserInfo();
                userService.saveUserToLocalStorage(userData);
            }

            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const registerData = {
                fullname: userData.fullname,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                address: userData.address,
                role: userData.role || 'Driver' // Default role is 'user'

            };

            const response = await axios.post(`${API_URL}/auth/register`, registerData);

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);

                const userInfo = await userService.getUserInfo();
                userService.saveUserToLocalStorage(userInfo);
            }

            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    }
};