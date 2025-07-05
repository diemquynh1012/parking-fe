import React from 'react';
import ProductCard from './ProductCard';

const FeaturedSection = ({ ingredients }) => {
    if (!ingredients || ingredients.length === 0) {
        return (
            <div className="mb-10 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Nguyên Liệu Nổi Bật</h2>
                </div>
                <p className="text-gray-600 mb-4">
                    Đang tải dữ liệu nguyên liệu...
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((index) => (
                        <div key={index} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-10 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Nguyên Liệu Nổi Bật</h2>
            </div>
            <p className="text-gray-600 mb-4">
                Các nguyên liệu thiết yếu được sử dụng nhiều nhất
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ingredients.slice(0, 4).map((ingredient) => (
                    <ProductCard
                        key={ingredient.id}
                        id={ingredient.id}
                        vietnameseName={ingredient.vietnameseName}
                        name={ingredient.name}
                        image={ingredient.imageUrl}
                        category={ingredient.category}
                        unit={ingredient.unit}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeaturedSection;