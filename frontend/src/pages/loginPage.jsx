import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5010/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/booking'); // Redirect after successful login
      } else {
        setError(data.error); // Show error to user
      }
    } catch (err) {
      console.error('Server error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to LOCKERY</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
      </div>

      <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleLogin}>
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2" htmlFor="email">
            Your email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg w-full py-2 px-4 text-gray-700 focus:outline-none focus:border-orange-400"
            placeholder="e.g. yourname@domain.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2" htmlFor="password">
            Your password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg w-full py-2 px-4 text-gray-700 focus:outline-none focus:border-orange-400"
            placeholder="*********"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg w-full"
        >
          Sign in
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <a href="/register" className="text-blue-500 hover:underline">Don't have an account?</a>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
