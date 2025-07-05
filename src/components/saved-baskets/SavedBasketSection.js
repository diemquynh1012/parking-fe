import React, { useState } from 'react';
import { FiChevronsUp, FiChevronsDown } from 'react-icons/fi';
import SavedBasketItem from './SavedBasketItem';

const SavedBasketSection = ({ title, items }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border-b border-gray-100">
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                    {isExpanded ? <FiChevronsUp size={20} /> : <FiChevronsDown size={20} />}
                </button>
            </div>

            {isExpanded && (
                <div className="pt-4 pb-4 px-6">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <SavedBasketItem
                                key={item.id}
                                item={item}
                                type="ingredient"
                            />
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-500">Không có {title.toLowerCase()} nào trong giỏ hàng này</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavedBasketSection;