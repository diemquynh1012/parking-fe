import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiCalendar, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { basketService } from '../../services/basketService';
import { toast } from 'react-toastify';
import { images } from '../../assets/assets';

const SavedBasketsList = ({ baskets, onRefresh }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return '';
        }
    };

    const handleRemoveBasket = async (index, event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            await basketService.removeSavedBasket(index);
            toast.success("Đã xóa giỏ hàng thành công!");

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("Error removing basket:", error);
            toast.error("Không thể xóa giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex bg-green-600 py-3 px-4">
                <img src={images.cart} alt="" className="h-7 w-7 mr-2" />
                <h2 className="text-white text-xl font-medium">Giỏ Hàng Đã Lưu</h2>
            </div>

            <div className="divide-y divide-gray-100">
                {baskets.map((basket, index) => {
                    const ingredientCount = basket.ingredients?.length || 0;
                    const dishCount = Object.keys(basket.dishes || {}).length || 0;

                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                            <Link
                                to={`/saved-baskets/${index}`}
                                className="flex items-center flex-grow"
                            >
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <FiShoppingBag className="text-orange-500 w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-medium text-lg text-gray-900">Giỏ hàng #{index + 1}</h3>
                                    <div className="flex items-center text-gray-500 text-sm mt-1">
                                        <span>{ingredientCount} nguyên liệu, {dishCount} món ăn</span>
                                        {basket.savedAt && (
                                            <>
                                                <span className="mx-2">•</span>
                                                <FiCalendar className="w-4 h-4 mr-1" />
                                                <span>{formatDate(basket.savedAt)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <FiChevronRight className="text-gray-400 w-5 h-5 ml-auto" />
                            </Link>
                            <button
                                onClick={(e) => handleRemoveBasket(index, e)}
                                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full"
                                title="Xóa giỏ hàng"
                            >
                                <FiTrash2 className="w-5 h-5" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {baskets.length === 0 && (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiShoppingBag className="text-gray-400 w-8 h-8" />
                    </div>
                    <p className="text-gray-500">Bạn chưa có giỏ hàng đã lưu nào</p>
                    <p className="text-gray-500 mt-2">Bấm "Lưu giỏ hàng yêu thích" ở trang giỏ hàng để lưu</p>
                </div>
            )}
        </div>
    );
};

export default SavedBasketsList;