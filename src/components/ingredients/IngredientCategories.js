import React from 'react';

const IngredientCategories = ({ activeCategory, setActiveCategory }) => {
    const categories = [
        "Tất cả", "Fresh Meat", "Grains & Staples", 'Seasonings', "Vegetables", 'Cold Cuts: Sausages & Ham', "Ice Cream & Cheese", 'Instant Foods'
    ];

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh Mục Nguyên Liệu</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
                {categories.map((category, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === category
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default IngredientCategories;