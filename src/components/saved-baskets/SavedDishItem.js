import React, { useState } from 'react';
import { FiChevronsUp, FiChevronsDown } from 'react-icons/fi';
import SavedBasketItem from './SavedBasketItem';

const SavedDishItem = ({ dish }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden shadow-sm">
            <div className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center">
                    {dish.imageUrl && (
                        <div className="mr-4 h-16 w-16 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                                src={dish.imageUrl}
                                alt={dish.name || dish.vietnameseName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/default-dish.jpg';
                                }}
                            />
                        </div>
                    )}
                    <div>
                        <h3 className="font-medium text-lg text-gray-800">{dish.vietnameseName || dish.name}</h3>
                        <div className="flex items-center mt-1">
                            <div className="bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                                <span className="text-sm text-gray-600">Phần ăn: <span className="font-medium">{dish.servings}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center"
                >
                    {isExpanded ? <FiChevronsUp size={24} /> : <FiChevronsDown size={24} />}
                </button>
            </div>

            {isExpanded && (
                <div className="pt-2 pb-3 px-4 bg-white">
                    {dish.ingredients && dish.ingredients.length > 0 ? (
                        dish.ingredients.map((ingredient) => (
                            <SavedBasketItem
                                key={ingredient.id}
                                item={ingredient}
                            />
                        ))
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-gray-500">Không có nguyên liệu nào trong món ăn này</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavedDishItem;