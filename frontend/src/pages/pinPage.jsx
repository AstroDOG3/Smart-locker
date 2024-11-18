import React, { useState, useEffect } from 'react';

function PinPage() {
    const [pin, setPin] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch the current PIN from the FastAPI endpoint
    const fetchPin = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://192.168.0.198:8000/api/pin', { cache: "no-store" });
            const data = await response.json();
            setPin(data.pin);  // Update PIN in state
        } catch (error) {
            console.error('Error fetching PIN:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPin();  // Fetch PIN on component mount

        // Set an interval to re-fetch the PIN every minute
        const interval = setInterval(fetchPin, 60000);  // 60000 ms = 1 minute

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                    Use This Pin at your Locker
                </h1>
                <p className="text-gray-600 text-center mb-4">
                    The random pin generated every 1 minute is below:
                </p>
                
                <div className="mb-4">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <p className="text-3xl font-bold text-center">{pin}</p>
                    )}
                </div>
                
                <p className="text-gray-400 text-sm mt-4 text-center">
                    Trouble with your pin? 
                    <a href="#" onClick={fetchPin} className="text-blue-500 underline"> Refresh</a>
                </p>
            </div>
        </div>
    );
}

export default PinPage;
