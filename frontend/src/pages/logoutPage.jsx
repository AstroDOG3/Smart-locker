import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Perform logout actions here, such as clearing tokens or user data
    localStorage.removeItem('authToken'); // Example: Remove authentication token
    localStorage.removeItem('userData');  // Example: Remove user data

    console.log('User logged out successfully.'); // Debug log

    // Optionally, you could make a call to your backend to log the user out on the server

    // Redirect to the login page after logging out
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl mb-8">Logging out...</h1>
    </div>
  );
}

export default LogoutPage;
