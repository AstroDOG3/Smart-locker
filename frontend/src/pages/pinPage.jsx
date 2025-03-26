import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PinPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const initialLockerType = params.get("lockerType") || "hot"; // Default to hot if not provided

    const [lockerType, setLockerType] = useState(initialLockerType);
    const [pin, setPin] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPin = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/pin?locker_type=${lockerType}`, { cache: "no-store" });
            const data = await response.json();
            setPin(data.pin);
        } catch (error) {
            console.error('Error fetching PIN:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPin();
        const interval = setInterval(fetchPin, 60000);
        return () => clearInterval(interval);
    }, [lockerType]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                    Use This PIN at Your Locker
                </h1>
                <p className="text-gray-600 text-center mb-4">
                    The random PIN generated every 1 minute is below:
                </p>
                
                <div className="mb-4">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <p className="text-3xl font-bold text-center">{pin}</p>
                    )}
                </div>

                <p className="text-gray-400 text-sm mt-4 text-center">
                    Trouble with your PIN? 
                    <a href="#" onClick={fetchPin} className="text-blue-500 underline"> Refresh</a>
                </p>

                {/* Back Button */}
                <button 
                    onClick={() => navigate('/booking')} 
                    className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                    Back to Booking
                </button>
            </div>
        </div>
    );
}

export default PinPage;
