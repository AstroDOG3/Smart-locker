import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import PinPage from './pages/pinPage';
import BookingPage from './pages/bookingPage';

function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage/>} />
                    <Route path="/pin" element={<PinPage/>} />
                    <Route path= "/booking" element={<BookingPage/>}/>
                </Routes>   
            </Router>
        </div>
    );
}

export default App
