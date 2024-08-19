import { useState, useEffect } from 'react';

function RandomNumberGenerator() {
    const [randomNumber, setRandomNumber] = useState(generateRandomNumber());

    useEffect(() => {
        const interval = setInterval(() => {
            setRandomNumber(generateRandomNumber());
        }, 15000); // 15000 ms = 15 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    function generateRandomNumber() {
        // Generate a random number between 0 and 999999
        const number = Math.floor(Math.random() * 1000000);
        // Format the number to be 6 digits with leading zeros
        return number.toString().padStart(6, '0');
    }

    return (
        <div>
            <h1>PIN: {randomNumber}</h1>
        </div>
    );
}

export default RandomNumberGenerator;
