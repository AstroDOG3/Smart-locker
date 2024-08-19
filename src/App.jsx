import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';



function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage/>} />
                </Routes>   
            </Router>
        </div>
    );
}

export default App
