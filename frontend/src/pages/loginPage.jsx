import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
function LoginPage(){
    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl mb-8">Login</h1>
            <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <div className = "mb-4">
                    <label className="block text-gray-700 text-xl font-bold mb-2" htmlFor="E-mail">
                        E-mail
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="abcdefg@gmail.com"
                    />
                </div>
                <div className = "mb-4"> 
                    <label className="block text-gray-700 text-xl font-bold mb-2" htmlFor="E-mail">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="*********"/>
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Login
                    </button>
                    <Link to="/register" className="text-lg md:text-xl">Create account</Link>
                </div>
            </form>
        </div>
    )
}
export default LoginPage;