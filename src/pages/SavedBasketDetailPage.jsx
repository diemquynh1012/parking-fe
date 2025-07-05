import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SavedBasketSection from '../components/saved-baskets/SavedBasketSection';
import SavedDishSection from '../components/saved-baskets/SavedDishSection';
import { basketService } from '../services/basketService';
import { useBasket } from '../context/BasketContext';
import cartIcon from '../assets/images/cart.png';
import { FiShoppingCart, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const SavedBasketDetailPage = () => {
    const { basketId } = useParams();
    const navigate = useNavigate();
    const [basket, setBasket] = useState(null);
    const [loading, setLoading] = useState(true);
    const { updateBasket } = useBasket();

    useEffect(() => {
        fetchSavedBasket();
    }, [basketId]);

    const fetchSavedBasket = async () => {
        try {
            setLoading(true);
            const savedBaskets = await basketService.getSavedBaskets();
            console.log('data from details page: ', savedBaskets)
            const foundBasket = savedBaskets.find((basket, index) => index === parseInt(basketId));

            if (foundBasket) {
                setBasket(foundBasket);
            } else {
                toast.error("Không tìm thấy giỏ hàng đã lưu");
                navigate("/saved-baskets");
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching saved basket:", error);
            toast.error("Không thể tải giỏ hàng đã lưu. Vui lòng thử lại sau.");
            setLoading(false);
            navigate("/saved-baskets");
        }
    };

    const handleLoadToCart = async () => {
        if (basket) {
            try {
                await updateBasket(basket);
                toast.success("Đã tải giỏ hàng thành công!");
                navigate("/basket");
            } catch (error) {
                console.error("Error loading saved basket:", error);
                toast.error("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
            }
        }
    };

    const handleDeleteSavedBasket = async () => {
        try {
            await basketService.removeSavedBasket(parseInt(basketId));
            toast.success("Đã xóa giỏ hàng thành công!");
            navigate("/saved-baskets");
        } catch (error) {
            console.error("Error removing saved basket:", error);
            toast.error("Không thể xóa giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                // <Header />
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!basket) {
        return (
            <div className="min-h-screen bg-gray-50">
                // <Header />
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white p-8 text-center">
                        <h2 className="text-xl font-medium mb-4">Không tìm thấy giỏ hàng đã lưu</h2>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error("Error formatting date:", error);
            return '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            // <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="bg-green-600 py-3 px-4 flex justify-between items-center mb-px">

                    <div className="flex items-center gap-2">
                        <img src={cartIcon} alt="" className="h-7 w-7 mr-2" />
                        <h1 className="text-white text-xl font-medium">Giỏ hàng đã lưu</h1>
                    </div>
                    <div className="text-white font-medium">
                        {basket.savedAt && `Đã lưu: ${formatDate(basket.savedAt)}`}
                    </div>
                </div>
                <div className="bg-white border border-gray-200 border-t-0">
                    {/* Ingredients Section */}
                    {basket.ingredients && basket.ingredients.length > 0 && (
                        <SavedBasketSection
                            title="Nguyên Liệu"
                            items={basket.ingredients}
                        />
                    )}

                    {/* Dishes Section */}
                    {basket.dishes && basket.dishes.length > 0 && (
                        <SavedDishSection dishes={basket.dishes} />
                    )}

                    {/* Actions */}
                    <div className="py-4 flex justify-center gap-4 border-t border-gray-200 mt-4">
                        <Link
                            to="/saved-baskets"
                            className="bg-gray-600 text-white px-6 py-3 flex items-center justify-center rounded-md"
                        >
                            <FiArrowLeft className="mr-2" />
                            <span>Trở về danh sách giỏ hàng đã lưu</span>
                        </Link>
                        <button
                            onClick={handleLoadToCart}
                            className="bg-green-600 text-white px-6 py-3 flex items-center justify-center rounded-md"
                        >
                            <FiShoppingCart className="w-5 h-5 mr-2" />
                            Thêm vào giỏ hàng
                        </button>

                        <button
                            onClick={handleDeleteSavedBasket}
                            className="bg-red-500 text-white px-6 py-3 flex items-center justify-center rounded-md"
                        >
                            <FiTrash2 className="w-5 h-5 mr-2" />
                            Xóa khỏi Giỏ hàng đã lưu
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SavedBasketDetailPage;