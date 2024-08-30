import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import PinPage from './pages/pinPage';
import BookingPage from './pages/bookingPage';
import DetailPage from './pages/detailPage';
import LogOutPage from './pages/logoutPage';

function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage/>} />
                    <Route path="/pin" element={<PinPage/>} />
                    <Route path="/booking" element={<BookingPage/>}/>
                    <Route path="/detail" element={<DetailPage/>}/>
                    <Route path="/logout" element={<LogOutPage/>}/>
                </Routes>   
            </Router>
        </div>
    );
}

export default App;
