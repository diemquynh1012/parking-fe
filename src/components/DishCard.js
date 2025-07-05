import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';

const DishCard = ({ id, image, name, ingredientCount, ingredients }) => {
    const [showIngredientsModal, setShowIngredientsModal] = useState(false);
    const { openModal } = useModal();

    const addToCart = () => {
        openModal('dish', { id, name, image, ingredients });
    };

    const toggleIngredientsModal = (e) => {
        e.stopPropagation();
        setShowIngredientsModal(!showIngredientsModal);
    };

    return (
        <>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                {/* Dish image */}
                <div className="w-full p-4 flex justify-center">
                    <img
                        src={image}
                        alt={name}
                        className="w-full object-contain h-48"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default-dish.jpg';
                        }}
                    />
                </div>

                {/* Dish info and add button */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium text-gray-900 text-lg">{name}</h3>
                            <p className="text-orange-500 text-xs">{ingredientCount} nguyên liệu</p>
                        </div>
                        <button
                            className="bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-colors"
                            onClick={addToCart}
                            aria-label="Thêm vào giỏ hàng"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>

                    {/* View ingredients button */}
                    <button
                        onClick={toggleIngredientsModal}
                        className="mt-2 text-blue-600 text-sm font-medium hover:underline w-full text-left"
                    >
                        Xem nguyên liệu
                    </button>
                </div>
            </div>

            {/* Ingredients Modal */}
            {showIngredientsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={toggleIngredientsModal}>
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{name}</h3>
                            <button
                                onClick={toggleIngredientsModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <h4 className="text-lg font-medium mb-3">Nguyên liệu ({ingredientCount})</h4>
                        <ul className="space-y-3">
                            {ingredients.map((ingredient, index) => (
                                <li key={ingredient.id || `ingredient-${index}`} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 flex-shrink-0">
                                        <img
                                            src={ingredient.image || ingredient.imageUrl}
                                            alt={ingredient.vietnameseName || ingredient.name}
                                            className="w-full h-full object-contain rounded-full border border-gray-200"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/default-ingredient.jpg';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{ingredient.vietnameseName || ingredient.name}</p>
                                        {ingredient.unit && (
                                            <p className="text-sm text-gray-500">Đơn vị: {ingredient.unit}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};

export default DishCard;