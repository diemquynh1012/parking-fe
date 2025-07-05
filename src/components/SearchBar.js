import React, { useState } from 'react';
import { FiSearch, FiArrowRight } from "react-icons/fi";
import cartIcon from '../assets/images/cart.png';


const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm);
        }
    };
    return (
        <div className="flex justify-center items-center px-12 space-x-4">
            <form onSubmit={handleSubmit} className="flex w-2/3">
                <div className="flex items-center w-full px-5 py-3 border border-gray-200 rounded-full bg-white">
                    <FiSearch className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        className="w-full outline-none text-gray-700"
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                </div>

                <button
                    type="submit"
                    className="flex items-center justify-between min-w-[200px] bg-green-600 text-white px-6 py-3 rounded-full ml-4"
                >
                    <img src={cartIcon} alt="" className="h-7 w-7 mr-2" />
                    <span>Tìm kiếm</span>
                    <FiArrowRight />
                </button>
            </form>
        </div>
    );
};

export default SearchBar;