import React, { useState } from 'react';
import RandomNumberGenerator from '../component/pinRandom';

function PinPage() {
    const [refreshKey, setRefreshKey] = useState(0); // State to trigger refresh

    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1); // Update key to refresh the component
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                    Use This Pin at your Lockery
                </h1>
                <p className="text-gray-600 text-center mb-4">
                    The random pin generated every 15 mins below
                </p>
                
                <div className="mb-4">
                    {/* Pass the refreshKey as a key to force re-render */}
                    <RandomNumberGenerator key={refreshKey} />
                </div>
                
                <p className="text-gray-400 text-sm mt-4 text-center">
                    Trouble with your pin? 
                    <a href="#" onClick={handleRefresh} className="text-blue-500 underline"> Refresh?</a>
                </p>
            </div>
        </div>
    );
}

export default PinPage;
