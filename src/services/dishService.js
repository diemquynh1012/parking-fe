import axiosPublic from './axiosPublic';

export const dishService = {
    getDishes: async (pageNo = 0, pageSize = 12, pattern = '') => {
        try {
            const searchParam = pattern ? `&pattern=${encodeURIComponent(pattern.toLowerCase())}` : '';
            const response = await axiosPublic.get(`public/dishes?pageSize=${pageSize}&pageNo=${pageNo}${searchParam}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching dishes (page ${pageNo}, pattern: ${pattern}):`, error);
            throw error;
        }
    }
};