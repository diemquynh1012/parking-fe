import React from 'react';
import { FaGithub, FaLinkedin, FaCode, FaEnvelope } from 'react-icons/fa';
import logoImage from '../assets/images/logo.png';


export const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-green-700 to-green-900 text-white py-5 mt-16">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                    {/* Logo và Giới thiệu */}
                    <div className="md:w-2/5">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <img src={logoImage} alt="Parkendation Logo" className="w-32 mr-2" />
                            Parkendation
                        </h3>
                        <p className="text-gray-200 leading-relaxed">
                            {/* Nền tảng thông minh giúp tìm kiếm cửa hàng dựa trên nguyên liệu bạn cần.
                            Ứng dụng tích hợp công nghệ trí tuệ nhân tạo để nhận diện và đề xuất
                            cửa hàng phù hợp nhất với danh sách nguyên liệu của người dùng. */}
                        </p>
                        <div className="mt-6 flex space-x-4">
                            <a href="#" className="text-white hover:text-green-200 transition-colors">
                                <FaGithub className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-white hover:text-green-200 transition-colors">
                                <FaLinkedin className="h-6 w-6" />
                            </a>
                            <a href="mailto:info@markendation.com" className="text-white hover:text-green-200 transition-colors">
                                <FaEnvelope className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
{/* 
                    Nhóm phát triển
                    <div className="md:w-2/5">
                        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-green-500">
                            Nhóm 5 - Grab Bootcamp 2025
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-800 bg-opacity-50 p-3 rounded-lg">
                                <h4 className="font-medium">Lê Công Quốc Hân</h4>
                                <p className="text-green-300 text-sm flex items-center">
                                    <FaCode className="mr-2" /> Backend
                                </p>
                            </div>
                            <div className="bg-green-800 bg-opacity-50 p-3 rounded-lg">
                                <h4 className="font-medium">Bùi Thành</h4>
                                <p className="text-green-300 text-sm flex items-center">
                                    <FaCode className="mr-2" /> Backend & Data Crawler
                                </p>
                            </div>
                            <div className="bg-green-800 bg-opacity-50 p-3 rounded-lg">
                                <h4 className="font-medium">Nguyễn Phương Thảo</h4>
                                <p className="text-green-300 text-sm flex items-center">
                                    <FaCode className="mr-2" /> Data Analyst & Frontend
                                </p>
                            </div>
                            <div className="bg-green-800 bg-opacity-50 p-3 rounded-lg">
                                <h4 className="font-medium">Lê Quốc Bảo</h4>
                                <p className="text-green-300 text-sm flex items-center">
                                    <FaCode className="mr-2" /> Machine Learning
                                </p>
                            </div>
                        </div>
                    </div> */}
                </div>

                <div className="border-t border-green-600 mt-10 pt-3 text-center text-green-200">
                    <p>© 2025 Parkendation. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;