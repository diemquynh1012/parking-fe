import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useBasket } from '../../context/BasketContext';
import { ingredientService } from '../../services/ingredientService';

const ProductCard = ({ id, vietnameseName, name, unit, image, category }) => {
    const { openModal } = useModal();
    const { addIngredient } = useBasket();
    const [loading, setLoading] = useState(false);

    const handleAddToCart = async () => {
        try {
            setLoading(true);

            const ingredientDetails = await ingredientService.getIngredientById(id);

            const completeIngredient = {
                id: ingredientDetails.id,
                vietnameseName: ingredientDetails.vietnameseName,
                name: ingredientDetails.name,
                unit: ingredientDetails.unit,
                image: ingredientDetails.imageUrl,
                category: ingredientDetails.category || category || 'Khác',
                quantity: 1
            };

            openModal('ingredients', [completeIngredient]);
        } catch (error) {
            console.error('Error fetching ingredient details:', error);

            const fallbackIngredient = {
                id,
                vietnameseName,
                name,
                unit: unit,
                image,
                category,
                quantity: 1
            };

            openModal('ingredients', [fallbackIngredient]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xs bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Product image */}
            <div className="w-full p-4 flex justify-center">
                <img
                    src={image}
                    alt={name}
                    className="w-full object-contain h-48"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-ingredient.jpg';
                    }}
                />
            </div>

            {/* Product info and add button */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div>
                    <h3 className="font-medium text-gray-900 text-lg">{vietnameseName}</h3>
                    {unit && <p className="text-gray-500 text-xs">Đơn vị: {unit}</p>}
                </div>
                <button
                    className={`bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-colors ${loading ? 'opacity-50 cursor-wait' : ''}`}
                    onClick={handleAddToCart}
                    disabled={loading}
                    aria-label="Add to cart"
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;