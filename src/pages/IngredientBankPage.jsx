import React, { useState, useEffect } from 'react';
// import Header from '../components/Header';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ingredients/ProductCard';
import Footer from '../components/Footer';
import IngredientCategories from '../components/ingredients/IngredientCategories';
import FeaturedSection from '../components/ingredients/FeaturedSection';
import { ingredientService } from '../services/ingredientService';

const IngredientBankPage = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalIngredients, setTotalIngredients] = useState(0);
    const [searchPattern, setSearchPattern] = useState('');
    const pageSize = 32;

    const fetchIngredients = async (page, pattern) => {
        setLoading(true);
        try {
            const response = await ingredientService.getIngredients(page, pageSize, pattern);

            if (response) {
                setIngredients(response.ingredients);
                setFilteredIngredients(response.ingredients);

                const calculatedTotalPages = Math.ceil(response.numIngredients / pageSize);
                setTotalPages(calculatedTotalPages);
                setTotalIngredients(response.numIngredients);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error details:", error);
            setError("Có lỗi xảy ra khi tải dữ liệu nguyên liệu. Vui lòng thử lại sau.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredients(currentPage, searchPattern);
    }, [currentPage, searchPattern]);

    useEffect(() => {
        if (activeCategory === "Tất cả") {
            setFilteredIngredients(ingredients);
        } else {
            const filtered = ingredients.filter(item => item.category === activeCategory);
            setFilteredIngredients(filtered);
        }
    }, [activeCategory, ingredients]);

    const handleSearch = (searchTerm) => {
        if (searchTerm !== searchPattern) {
            setCurrentPage(0);
            setSearchPattern(searchTerm);
        }
    };

    const handlePageChange = (newPage) => {
        window.scrollTo(0, 0);
        setCurrentPage(newPage);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        let startPage = Math.max(0, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 0) {
                endPage = Math.min(4, totalPages - 1);
            } else if (endPage === totalPages - 1) {
                startPage = Math.max(0, totalPages - 5);
            }
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                    {/* First page button */}
                    <button
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0}
                        className={`px-3 py-1 rounded-md ${currentPage === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        «
                    </button>

                    {/* Previous page button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`px-3 py-1 rounded-md ${currentPage === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        ‹
                    </button>

                    {/* Page numbers */}
                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${currentPage === page
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                } border border-gray-300`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    {/* Next page button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages - 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        ›
                    </button>

                    {/* Last page button */}
                    <button
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages - 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        »
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            // <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <SearchBar onSearch={handleSearch} />

                <div className="mt-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
                            <p>{error}</p>
                        </div>
                    )}

                    <FeaturedSection ingredients={ingredients} />

                    <IngredientCategories
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {activeCategory === "Tất cả" ? "Tất Cả Nguyên Liệu" : `Nguyên Liệu ${activeCategory}`}
                        </h2>

                        {!loading && (
                            <div className="text-sm text-gray-600">
                                Hiển thị {filteredIngredients.length} nguyên liệu
                                {(activeCategory === "Tất cả" || searchPattern) && ` (trang ${currentPage + 1}/${totalPages})`}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                                <div key={index} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : filteredIngredients.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredIngredients.map((ingredient) => (
                                    <ProductCard
                                        key={ingredient.id}
                                        id={ingredient.id}
                                        vietnameseName={ingredient.vietnameseName}
                                        name={ingredient.name}
                                        unit={ingredient.unit}
                                        image={ingredient.imageUrl}
                                        category={ingredient.category}
                                    />
                                ))}
                            </div>

                            {(activeCategory === "Tất cả" || searchPattern) && renderPagination()}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Không tìm thấy nguyên liệu phù hợp</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default IngredientBankPage;