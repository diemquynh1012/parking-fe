import { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineLocationMarker, HiStar } from "react-icons/hi";
import { images } from '../assets/assets';
// // import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import LocationSelector from '../components/LocationSelector';

const ParkingFinding = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [suggestedParkings, setSuggestedParkings] = useState([
        {
            id: 1,
            name: "Bãi đỗ xe Regent",
            address: "Regent Street, A4, A4201, London",
            phone: "0123 456 789",
            rating: 4.5,
            stars: 4.5,
            distance: 0.5, // in km
            totalPrice: 50000, // in VND
        },
        {
            id: 2,
            name: "Bãi đỗ xe Oxford",
            address: "Oxford Street, A4, A4201, London",
            phone: "0987 654 321",
            rating: 4.0,
            stars: 4.0,
            distance: 1.2, // in km
            totalPrice: 60000, // in VND
        }])

    useEffect(() => {
        const loadSavedLocation = () => {
            try {
                const savedLocation = localStorage.getItem('userLocation');
                if (savedLocation) {
                    const parsedLocation = JSON.parse(savedLocation);
                    if (parsedLocation && parsedLocation.address) {
                        setUserLocation(parsedLocation);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading saved location:', error);
            }

            setUserLocation({
                address: 'Regent Street, A4, A4201, London',
                latitude: 51.5093,
                longitude: -0.1367
            });
        };

        loadSavedLocation();

        const handleLocationUpdate = (event) => {
            if (event.detail) {
                setUserLocation(event.detail);
            }
        };
        window.addEventListener('locationUpdated', handleLocationUpdate);
        const fetchData = async () => {
            setLoading(true);
            try {
                const storedBasket = localStorage.getItem('basketItems');
                localStorage.getItem('basketItems');
            } catch (error) {
                console.error("Error initializing checkout calculation:", error);
                toast.error("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => {
            window.removeEventListener('locationUpdated', handleLocationUpdate);
        }
    }, [location.state]);
    
    const handleLocationChange = (location) => {
        if (!location) return;
        setUserLocation(location);
    };
    const handleBackToCart = () => {
        window.history.back();
    };

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('vi-VN');
    };

    const renderRating = (rating) => {
        if (!rating && rating !== 0) return null;

        const roundedRating = parseFloat(rating).toFixed(1);

        return (
            <div className="flex items-center mb-2">
                <span className="text-sm mr-2">Đánh giá:</span>
                <span className="font-medium mr-2">{roundedRating}</span>
                <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <HiStar
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                    ))}
                </div>
            </div>
        );
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* // <Header /> */}
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-wrap -mx-4">
                    {/* Parking Search Panel */}
                    <div className="w-full md:w-1/3 px-4 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="bg-green-600 p-4 -m-6 mb-6 rounded-t-lg">
                                <h2 className="text-xl font-medium flex items-center text-white">
                                    <img src={images.cart} className="h-8 w-8 mr-2" alt="Cart icon" />
                                    Tìm bãi đỗ xe
                                </h2>
                            </div>
                            <form
                                className="space-y-4"
                                onSubmit={e => {
                                    e.preventDefault();
                                    // TODO: Implement search logic here
                                    toast.info("Tính năng tìm kiếm bãi đỗ xe chưa được triển khai.");
                                }}
                            >
                                <div>
                                    <label className="block text-sm font-medium mb-1">Loại phương tiện</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        name="vehicleType"
                                    >
                                        <option value="car">Ô tô</option>
                                        <option value="motorbike">Xe máy</option>
                                        <option value="bicycle">Xe đạp</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Có sạc xe điện</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        name="hasCharger"
                                    >
                                        <option value="">Không quan tâm</option>
                                        <option value="yes">Có</option>
                                        <option value="no">Không</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Khu vực</label>
                                    {/* Location Selector Component */}
                                    <LocationSelector
                                        onLocationChange={handleLocationChange}
                                        initialLocation={userLocation}
                                    />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Khoảng cách tối đa (km)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="Ví dụ: 2"
                                            name="maxDistance"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Tìm kiếm
                                    </button>
                                    </form>
                                    </div>
                                    </div>
                                    <div className="w-full md:w-2/3 px-4">
                                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                            <div className="bg-green-600 p-4 -m-6 mb-6 rounded-t-lg">
                                                <h2 className="text-xl font-medium flex items-center text-white">
                                                    <HiOutlineLocationMarker className="h-8 w-8 mr-2" />
                                                    Danh sách bãi đỗ xe
                                                </h2>
                                            </div>

                                            {suggestedParkings.length > 0 ? (
                                                <div className="space-y-6">
                                                    {suggestedParkings.map((store) => (
                                                        <div key={store.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                            {/* Store header - Always visible */}
                                                            <div className="bg-gray-50 p-4">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <div className="flex-grow">
                                                                        <h3 className="text-xl font-medium text-gray-800 mb-2">{store.name}</h3>

                                                                        <div className="flex items-center mb-2">
                                                                            <div className="mr-2 w-5 h-5 text-green-600">
                                                                                <HiOutlineLocationMarker className="w-5 h-5" />
                                                                            </div>
                                                                            <span className="text-sm text-gray-600">{store.address}</span>
                                                                        </div>

                                                                        {store.phone && (
                                                                            <div className="text-sm text-gray-600 mb-2">
                                                                                SĐT: {store.phone}
                                                                            </div>
                                                                        )}

                                                                        {/* Rating and distance info */}
                                                                        {renderRating(store.rating || store.stars)}

                                                                        {store.distance > 0 && (
                                                                            <div className="text-sm text-gray-600">
                                                                                Khoảng cách: {(store.distance).toFixed(1)}km
                                                                            </div>
                                                                        )}

                                                                        {/* Price info */}
                                                                        {store.totalPrice && (
                                                                            <div className="text-sm text-gray-700 mt-2">
                                                                                Giá gửi xe: <span className="font-semibold text-green-700">{formatPrice(store.totalPrice)} VND</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Action buttons */}
                                                                <div className="flex flex-wrap gap-3 mt-4">
                                                                    <button
                                                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                                                        onClick={() => {
                                                                            // TODO: Implement navigation logic
                                                                            toast.info(`Đi đến bãi đỗ: ${store.name}`);
                                                                        }}
                                                                    >
                                                                        Đến bãi đỗ
                                                                    </button>
                                                                    <button
                                                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                                                                        onClick={() => {
                                                                            // TODO: Implement membership registration logic
                                                                            toast.info(`Đăng ký thành viên tại: ${store.name}`);
                                                                        }}
                                                                    >
                                                                        Đăng ký thành viên
                                                                    </button>
                                                                    <button
                                                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                                                        onClick={() => {
                                                                            // TODO: Implement detail info logic
                                                                            toast.info(`Xem thông tin chi tiết của: ${store.name}`);
                                                                        }}
                                                                    >
                                                                        Thông tin chi tiết
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {/* You can add more details here, e.g. available slots, charger info, etc. */}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <p className="text-gray-500">Không tìm thấy bãi đỗ xe phù hợp</p>
                                                    <p className="text-gray-400 text-sm mt-2">Thử thay đổi tiêu chí tìm kiếm của bạn</p>
                                                </div>
                                            )}
                                        </div>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleBackToCart}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                            >
                                <FiArrowLeft className="w-5 h-5 mr-2" />
                                Tìm kiếm bãi đỗ xe khác
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ParkingFinding;