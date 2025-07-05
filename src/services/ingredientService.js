import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const ingredientService = {
    getIngredientById: async (id) => {
        try {
            const response = await axiosPublic.get(`/public/ingredients/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ingredient with ID ${id}:`, error);
            throw error;
        }
    },

    getIngredients: async (pageNo = 0, pageSize = 32, pattern = '') => {
        try {
            const searchParam = pattern ? `&pattern=${encodeURIComponent(pattern)}` : '';
            const response = await axiosPublic.get(`/public/ingredients?pageSize=${pageSize}&pageNo=${pageNo}${searchParam}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ingredients (page ${pageNo}, pattern: ${pattern}):`, error);
            throw error;
        }
    }
};

export default ingredientService;