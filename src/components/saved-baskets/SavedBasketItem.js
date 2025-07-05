import React from 'react';

const SavedBasketItem = ({ item }) => {
    return (
        <div className="flex items-center py-3 mb-2 bg-gray-50 rounded-lg">
            <div className="flex items-center w-[40%]">
                <div className="bg-white p-2 rounded-md shadow-sm flex justify-center items-center h-16 w-16 ml-4 mr-4">
                    <img
                        src={item.imageUrl}
                        alt={item.vietnameseName}
                        className="h-12 w-12 object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default-ingredient.jpg';
                        }}
                    />
                </div>

                <div>
                    <p className="font-medium">{item.vietnameseName}</p>
                    {item.category && <p className="text-sm text-gray-500">{item.category}</p>}
                </div>
            </div>
            <div className="w-[60%] flex justify-end items-center pr-4">
                <div className="mx-3 px-4 py-2 bg-white border border-gray-300 rounded-full text-center min-w-[80px]">
                    <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
            </div>
        </div>
    );
};

export default SavedBasketItem;